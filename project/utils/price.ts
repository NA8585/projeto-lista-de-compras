export function parsePrice(raw: string): number | null {
  if (!raw) return null;

  const cleaned = raw
    .toLowerCase()
    .replace(/[^\d.,]/g, '')
    .replace(',', '.');

  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
}
