import { authFetch } from './apiClient';

/**
 * Fetch all active projects for the current user.
 * @route GET /api/projects
 */
export const getProjects = () => {
  return authFetch('/projects');
};

/**
 * Fetch a single project by ID.
 * @route GET /api/projects/:projectId
 * @param {string} projectId
 */
export const getProject = (projectId) => {
  return authFetch(`/projects/${projectId}`);
};

/**
 * Create a new project.
 * @route POST /api/projects
 * @param {Object} projectData - { name, description, members }
 */
export const createProject = (projectData) => {
  return authFetch('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
};

/**
 * Delete a project by ID.
 * @route DELETE /api/projects/:projectId
 * @param {string} projectId
 */
export const deleteProject = (projectId) => {
  return authFetch(`/projects/${projectId}`, {
    method: 'DELETE',
  });
};

/**
 * Fetch all members of a specific project.
 * @route GET /api/projects/:projectId/members
 * @param {string} projectId
 */
export const getProjectMembers = (projectId) => {
  return authFetch(`/projects/${projectId}/members`);
};
