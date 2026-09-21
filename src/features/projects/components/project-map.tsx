import { MapPin } from "lucide-react";

export function projectMapUrl(latitude: number, longitude: number) {
  const bounds = [longitude - 0.11, latitude - 0.07, longitude + 0.11, latitude + 0.07];
  const params = new URLSearchParams({ bbox: bounds.join(","), layer: "mapnik", marker: `${latitude},${longitude}` });
  return `https://www.openstreetmap.org/export/embed.html?${params}`;
}
export function projectMapLink(latitude: number, longitude: number) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=12/${latitude}/${longitude}`;
}
export function ProjectMap({ latitude, longitude, name }: { latitude?: number; longitude?: number; name: string }) {
  if (latitude === undefined || longitude === undefined) {
    return <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-slate-50 text-slate-400"><MapPin className="size-9" /><p className="mt-2 text-sm">Search and confirm a location to preview it.</p></div>;
  }
  return <iframe title={`Map of ${name}`} src={projectMapUrl(latitude, longitude)} loading="lazy" referrerPolicy="no-referrer" className="h-64 w-full rounded-lg border border-slate-200" />;
}
