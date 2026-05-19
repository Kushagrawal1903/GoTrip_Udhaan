import api from '../services/api';

/**
 * Fire a share analytics event. Never throws — wrapped in try/catch
 * so it never blocks the UI on failure.
 *
 * @param {string} tripId - The trip's MongoDB _id
 * @param {Object} params
 * @param {string} params.platform - 'download' | 'whatsapp' | 'link' | 'native'
 * @param {string} [params.theme] - Theme used (midnight/parchment/editorial)
 * @param {string} [params.format] - Format used (story/post/whatsapp/twitter)
 */
export const fireShareEvent = async (tripId, { platform, theme, format }) => {
  try {
    await api.post(`/trips/${tripId}/share-analytics`, { platform, theme, format });
  } catch (err) {
    // Intentionally swallowed — analytics should never block the user
    console.warn('Share analytics failed (non-blocking):', err.message);
  }
};
