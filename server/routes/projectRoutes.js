const express = require('express');
const router = express.Router();
const { getProjects, createProject, deleteProject, getOneProject, getProjectMembers } = require('../controllers/projectController')
const { protect, authorize } = require('../middleware/authMiddleware')
const { setProject, authGetProject } = require('../middleware/projectMiddleware')

router.route('/')
    .get(protect, getProjects)
    .post(protect, authorize('PM', 'BrSE'), createProject);

router.route('/:projectId')
    .delete(protect, authorize('PM'), deleteProject)
    .get(protect, getOneProject)

router.route('/:projectId/members')
    .get(protect, getProjectMembers)




module.exports = router;