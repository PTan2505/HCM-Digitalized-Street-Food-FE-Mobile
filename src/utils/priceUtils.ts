const fmt = (n: number): string => n.toLocaleString('vi-VN') + 'đ';

/**
 * Computes a price range string from a list of dishes.
 * - 0 dishes → "Đang cập nhật"
 * - 1 dish   → "0đ - <price>" (min is 0 per business rule)
 * - 2+ dishes → "<min> - <max>"
 */
export const getPriceRange = (dishes: { price: number }[]): string => {
  if (dishes.length === 0) return 'Đang cập nhật';
  const prices = dishes.map((d) => d.price);
  const min = prices.length === 1 ? 0 : Math.min(...prices);
  const max = Math.max(...prices);
  return `${fmt(min)} - ${fmt(max)}`;
};
