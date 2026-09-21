export function equipmentDetailUrl(origin: string, qrToken: string) {
  return `${origin}/equipment/${encodeURIComponent(qrToken)}`;
}
