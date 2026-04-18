import { authFetch } from './apiClient';

/**
 * Fetch aggregated dashboard statistics.
 * @route GET /api/stats
 * @returns {Promise<{ activeProjects, pendingTasks, reportsThisWeek, glossaryTerms, recentReports }>}
 */
export const getDashboardStats = () => {
  return authFetch('/stats');
};
