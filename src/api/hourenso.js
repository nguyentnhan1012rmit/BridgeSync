import { authFetch } from './apiClient';

/**
 * Fetch all hourenso reports for a specific project.
 * @route GET /api/hourenso/:projectId
 * @param {string} projectId
 */
export const getProjectReports = (projectId) => {
  return authFetch(`/hourenso/${projectId}`);
};

/**
 * Create a new hourenso report.
 * @route POST /api/hourenso
 * @param {Object} reportData - { projectId, houkoku, renraku, soudan }
 *   houkoku: { currentStatus, progress, issues, nextSteps }
 *   renraku: { sharedInformation }  (optional)
 *   soudan:  { topic, proposedOptions, deadline }  (optional)
 */
export const createReport = (reportData) => {
  return authFetch('/hourenso', {
    method: 'POST',
    body: JSON.stringify(reportData),
  });
};

export const updateReport = (reportId, reportData) => {
  return authFetch(`/hourenso/reports/${reportId}`, {
    method: 'PUT',
    body: JSON.stringify(reportData),
  });
};

export const deleteReport = (reportId) => {
  return authFetch(`/hourenso/reports/${reportId}`, {
    method: 'DELETE',
  });
};
