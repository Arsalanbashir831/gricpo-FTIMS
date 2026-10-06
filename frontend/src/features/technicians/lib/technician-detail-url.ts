export function technicianDetailUrl(origin: string, qrCode: string) {
  // A technician QR code is generated as `technician:<number>`. Keep the
  // separator readable in the URL while still escaping any other characters.
  const pathToken = encodeURIComponent(qrCode).replace(/%3A/gi, ":");
  return `${origin}/${pathToken}`;
}
