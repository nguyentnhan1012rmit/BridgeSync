const express = require('express');
const router = express.Router();
const { createReport, getProjectReports } = require('../controllers/hourensoController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/:projectId')
    .get(protect, getProjectReports);

// Route to create reports (Blocked for 'Japanese client' role)
router.route('/')
    .post(protect, authorize('Developer', 'BrSE', 'PM'), createReport);

module.exports = router;