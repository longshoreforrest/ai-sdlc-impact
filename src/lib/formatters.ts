export function formatEur(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}\u00A0M\u00A0\u20AC`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${Math.round(value / 1_000)}\u00A0K\u00A0\u20AC`;
  }
  return `${value.toFixed(0)}\u00A0\u20AC`;
}

export function formatHours(value: number): string {
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}
