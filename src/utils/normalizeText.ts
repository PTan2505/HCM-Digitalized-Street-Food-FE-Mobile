/**
 * Strips Vietnamese diacritical marks and lowercases a string so that
 * "Bu" matches "Bún", "bo" matches "bò", etc.
 *
 * How it works:
 *  1. NFD decomposition splits pre-composed chars (e.g. ú → u + ́)
 *  2. The combining marks (U+0300–U+036F) are removed
 *  3. Vietnamese Đ/đ has no combining form, so it's handled separately
 */
export const normalizeForMatch = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
