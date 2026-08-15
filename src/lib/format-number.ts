/** Formats an integer count for display, e.g. 12480 -> "12.480". */
export function formatCount(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}
