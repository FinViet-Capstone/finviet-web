/** Formats a whole-VND amount for display, e.g. 490000 -> "490.000đ". */
export function formatVnd(price: number): string {
  return `${price.toLocaleString("vi-VN")}đ`;
}

/** Formats a billing cadence for display, e.g. 1 -> "/tháng", 12 -> "/năm", 3 -> "/3 tháng". */
export function formatBillingInterval(months: number): string {
  if (months === 1) return "/tháng";
  if (months === 12) return "/năm";
  return `/${months} tháng`;
}
