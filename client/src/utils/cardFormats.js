/**
 * Card format (aspect ratio) configurations for shareable trip cards.
 * Dimensions are the actual render size; preview is scaled down in CardPreview.
 */

export const CARD_FORMATS = {
  story: {
    label: 'Story',
    icon: '📱',
    width: 1080,
    height: 1920,
    platform: 'instagram_story',
  },
  post: {
    label: 'Post',
    icon: '📸',
    width: 1080,
    height: 1080,
    platform: 'instagram_post',
  },
  whatsapp: {
    label: 'WhatsApp',
    icon: '💬',
    width: 1080,
    height: 1350,
    platform: 'whatsapp',
  },
  twitter: {
    label: 'Twitter / X',
    icon: '𝕏',
    width: 1200,
    height: 675,
    platform: 'twitter',
  },
};
