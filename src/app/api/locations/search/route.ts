import type { LocationSearchResult } from "@/features/projects/types";

type NominatimPlace = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
};

// Public Nominatim permits occasional, user-initiated searches, not autocomplete.
// This process-level throttle is suitable for the current UI; use a dedicated
// geocoding provider before serving traffic from multiple server instances.
let nextSearchAt = 0;

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 3 || query.length > 120) {
    return Response.json({ error: "Enter at least 3 characters to search." }, { status: 400 });
  }

  const now = Date.now();
  if (now < nextSearchAt) {
    return Response.json({ error: "Please wait a moment before searching again." }, { status: 429 });
  }
  nextSearchAt = now + 1100;

  const params = new URLSearchParams({ q: query, format: "jsonv2", addressdetails: "1", limit: "5" });
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: {
        "User-Agent": "GRIPCO-FTIMS/1.0 (project location picker)",
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`Geocoding service returned ${response.status}`);

    const places = (await response.json()) as NominatimPlace[];
    const results: LocationSearchResult[] = places
      .map((place) => ({
        id: String(place.place_id),
        label: place.display_name,
        latitude: Number(place.lat),
        longitude: Number(place.lon),
        city: place.address?.city ?? place.address?.town ?? place.address?.village ?? place.address?.municipality ?? place.address?.county ?? "",
        country: place.address?.country ?? "",
      }))
      .filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude) && place.country);
    return Response.json({ results });
  } catch {
    return Response.json({ error: "Location search is unavailable. Please try again." }, { status: 502 });
  }
}
