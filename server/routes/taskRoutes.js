const express = require('express');
const router = express.Router();
const { getTasksByProject, createTask, updateTaskStatus } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('PM', 'BrSE'), createTask);

router.get('/:projectId', protect, getTasksByProject);

router.route('/:taskId/status')
    .put(protect, authorize('PM', 'BrSE', 'Developer'), updateTaskStatus);

module.exports = router;