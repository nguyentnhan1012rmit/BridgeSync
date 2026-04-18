import { authFetch } from './apiClient';

/**
 * Fetch all glossary terms, sorted alphabetically by baseTerm.
 * @route GET /api/glossary
 */
export const getGlossary = () => {
  return authFetch('/glossary');
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
