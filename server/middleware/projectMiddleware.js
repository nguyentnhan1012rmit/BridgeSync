const Project = require('../models/Projects')
const { canViewProject } = require('../permission/project')


const setProject = async (req, res, next) => {
    const projectId = req.params.projectId
    req.project = await Project.findById(projectId)

    if (req.project == null) {
        return res.status(404).json({ message: 'Project not found' })
    }

    next()
}

const authGetProject = (req, res, next) => {
    if (!canViewProject(req.user, req.project)) {
        res.status(401).json({ message: 'Not Allowed' })
    }

    next()
}

module.exports = {
    setProject,
    authGetProject
}