const express = require('express');
const router = express.Router();
const { getTasksByProject, createTask, updateTask, updateTaskStatus, deleteTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { setProject, setProjectFromBody, setProjectFromTask, authGetProject } = require('../middleware/projectMiddleware');
const { validate } = require('../middleware/validate');
const { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } = require('../validators/taskValidator');

router.route('/')
    .post(protect, authorize('PM', 'BrSE'), validate(createTaskSchema), setProjectFromBody, authGetProject, createTask);

router.get('/:projectId', protect, setProject, authGetProject, getTasksByProject);

router.route('/:taskId')
    .put(protect, authorize('PM', 'BrSE'), validate(updateTaskSchema), setProjectFromTask, authGetProject, updateTask)
    .delete(protect, authorize('PM', 'BrSE'), setProjectFromTask, authGetProject, deleteTask);

router.route('/:taskId/status')
    .put(protect, authorize('PM', 'BrSE', 'Developer'), validate(updateTaskStatusSchema), setProjectFromTask, authGetProject, updateTaskStatus);

module.exports = router;
