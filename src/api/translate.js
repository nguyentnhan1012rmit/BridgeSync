import { authFetch } from './apiClient';

/**
 * Translate text to the specified target language.
 * The backend checks the custom IT glossary first, then falls back to DeepL.
 *
 * @route POST /api/translate
 * @param {string} text       - The text to translate
 * @param {string} targetLang - Target language code (e.g. 'ja', 'vi')
 * @returns {Promise<{ originalText: string, translatedText: string, source: string }>}
 */
export const translateText = (text, targetLang) => {
  return authFetch('/translate', {
    method: 'POST',
    body: JSON.stringify({ text, targetLang }),
  });
};
