const express = require('express');
const router = express.Router();
const { createReport, updateReport, getProjectReports, deleteReport } = require('../controllers/hourensoController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { setProject, setProjectFromBody, setProjectFromReport, authGetProject } = require('../middleware/projectMiddleware');

router.route('/reports/:reportId')
    .put(protect, authorize('Developer', 'BrSE', 'PM'), setProjectFromReport, authGetProject, updateReport)
    .delete(protect, authorize('Developer', 'BrSE', 'PM'), setProjectFromReport, authGetProject, deleteReport);

router.route('/:projectId')
    .get(protect, setProject, authGetProject, getProjectReports);

// Route to create reports (Blocked for 'Japanese client' role)
router.route('/')
    .post(protect, authorize('Developer', 'BrSE', 'PM'), setProjectFromBody, authGetProject, createReport);

module.exports = router;
