import { decode } from 'html-entities';

/**
 * Strip HTML tags from text and decode HTML entities
 *
 * @param text - Text potentially containing HTML
 * @returns Clean text without HTML tags
 */
export function stripHtmlTags(text: string): string {
  if (!text) return '';

  // Remove HTML tags
  let clean = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  clean = decode(clean);

  // Normalize whitespace
  clean = clean.replace(/\s+/g, ' ').trim();

  return clean;
}

/**
 * Check if text is just an HTML tag (like <li>, </ol>, etc.)
 *
 * @param text - Text to check
 * @returns true if text is only an HTML tag
 */
export function isHtmlTagOnly(text: string): boolean {
  const trimmed = text.trim();
  return /^<\/?[a-z][a-z0-9]*[^>]*>$/i.test(trimmed);
}
