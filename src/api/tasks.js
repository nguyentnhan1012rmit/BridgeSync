import { authFetch } from './apiClient';

/**
 * Fetch all tasks for a specific project.
 * @route GET /api/tasks/:projectId
 * @param {string} projectId
 */
export const getTasksByProject = (projectId) => {
  return authFetch(`/tasks/${projectId}`);
};

/**
 * Create a new task.
 * @route POST /api/tasks
 * @param {Object} taskData - { projectId, title, description, assigneeId }
 */
export const createTask = (taskData) => {
  return authFetch('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
};

/**
 * Update the status of a task.
 * @route PUT /api/tasks/:taskId/status
 * @param {string} taskId
 * @param {string} status - The new status value
 */
export const updateTaskStatus = (taskId, status) => {
  return authFetch(`/tasks/${taskId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};
