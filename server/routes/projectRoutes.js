const express = require('express');
const router = express.Router();
const { getProjects, createProject, deleteProject, getOneProject, getProjectMembers, addProjectMember, removeProjectMember } = require('../controllers/projectController')
const { protect, authorize } = require('../middleware/authMiddleware')
const { setProject, authGetProject } = require('../middleware/projectMiddleware')

router.route('/')
    .get(protect, getProjects)
    .post(protect, authorize('PM', 'BrSE'), createProject);

router.route('/:projectId')
    .delete(protect, authorize('PM'), setProject, authGetProject, deleteProject)
    .get(protect, setProject, authGetProject, getOneProject)

router.route('/:projectId/members')
    .get(protect, setProject, authGetProject, getProjectMembers)
    .post(protect, authorize('PM'), setProject, authGetProject, addProjectMember)

router.route('/:projectId/members/:userId')
    .delete(protect, authorize('PM'), setProject, authGetProject, removeProjectMember)



module.exports = router;
