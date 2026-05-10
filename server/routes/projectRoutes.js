const express = require('express');
const router = express.Router();
const { getProjects, createProject, updateProject, deleteProject, getOneProject, getProjectMembers, addProjectMember, removeProjectMember } = require('../controllers/projectController')
const { protect, authorize } = require('../middleware/authMiddleware')
const { setProject, authGetProject } = require('../middleware/projectMiddleware')
const { validate } = require('../middleware/validate')
const { createProjectSchema, updateProjectSchema } = require('../validators/projectValidator')

router.route('/')
    .get(protect, getProjects)
    .post(protect, authorize('PM', 'BrSE'), validate(createProjectSchema), createProject);

router.route('/:projectId')
    .get(protect, setProject, authGetProject, getOneProject)
    .put(protect, authorize('PM', 'BrSE'), validate(updateProjectSchema), setProject, authGetProject, updateProject)
    .delete(protect, authorize('PM'), setProject, authGetProject, deleteProject)

router.route('/:projectId/members')
    .get(protect, setProject, authGetProject, getProjectMembers)
    .post(protect, authorize('PM'), setProject, authGetProject, addProjectMember)

router.route('/:projectId/members/:userId')
    .delete(protect, authorize('PM'), setProject, authGetProject, removeProjectMember)

module.exports = router;
