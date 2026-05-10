import { authFetch } from './apiClient';

/**
 * Fetch glossary terms (paginated). Always returns { items, pagination }.
 * @route GET /api/glossary
 */
export const getGlossary = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  return authFetch(`/glossary${queryString ? `?${queryString}` : ''}`);
};

/**
 * Fetch all glossary terms as a flat array (for TextHighlighter).
 * Uses a large page size to retrieve all terms in one request.
 */
export const getAllGlossaryTerms = async () => {
  const data = await getGlossary({ limit: 500 });
  return data.items || [];
};

/**
 * Add a new glossary term.
 * @route POST /api/glossary
 * @param {Object} termData - { baseTerm, translations }
 *   translations is an object like { ja: '...', vi: '...' }
 */
export const addGlossaryTerm = (termData) => {
  return authFetch('/glossary', {
    method: 'POST',
    body: JSON.stringify(termData),
  });
};

/**
 * Import glossary terms in bulk.
 * @route POST /api/glossary/import
 * @param {Array} terms - [{ baseTerm, translations: { en, vi, ja } }]
 */
export const importGlossaryTerms = (terms) => {
  return authFetch('/glossary/import', {
    method: 'POST',
    body: JSON.stringify({ terms }),
  });
};
