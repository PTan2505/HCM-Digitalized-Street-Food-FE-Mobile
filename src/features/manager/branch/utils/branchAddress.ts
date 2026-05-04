/**
 * Strip a trailing ward/town/city qualifier from a free-form address.
 * Mirrors the web `normalizeAddressDetail` helper so the backend gets
 * the same value regardless of whether the user came from web or mobile.
 */
export function normalizeAddressDetail(address: string): string {
  const trimmed = address.trim();
  if (!trimmed) return '';

  const wardMatch = trimmed.match(/\s*,?\s*(phường|xã|thị trấn)\b/i);
  if (!wardMatch?.index) {
    return trimmed;
  }

  return trimmed.slice(0, wardMatch.index).replace(/,\s*$/, '').trim();
}

/**
 * VN mobile-phone regex matching `validator.isMobilePhone(value, 'vi-VN')`
 * (the helper used by the web project). Accepts 10–11 digits with VN
 * carrier prefixes (03/05/07/08/09 mobile, 02 landline) and an optional
 * +84 / 84 country code.
 */
export const VN_PHONE_REGEX =
  /^(?:\+?84|0)(?:3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-46-9]|2\d)\d{7}$/;
