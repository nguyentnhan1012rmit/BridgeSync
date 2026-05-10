const mongoose = require('mongoose')
const Project = require('../models/Projects')
const Task = require('../models/Tasks')
const HourensoReports = require('../models/HourensoReports')
const { canViewProject } = require('../permission/project')
const { sendError, sendServerError } = require('../utils/httpResponses')

const findProjectById = async (projectId, res) => {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        sendError(res, 400, 'Invalid project id', 'VALIDATION_ERROR')
        return null
    }

    const project = await Project.findById(projectId)

    if (!project) {
        sendError(res, 404, 'Project not found', 'PROJECT_NOT_FOUND')
        return null
    }

    return project
}

const setProject = async (req, res, next) => {
    try {
        const project = await findProjectById(req.params.projectId, res)
        if (!project) return

        req.project = project
        next()
    } catch (error) {
        sendServerError(res, error)
    }
}

const setProjectFromBody = async (req, res, next) => {
    try {
        const projectId = req.body?.projectId

        if (!projectId) {
            return sendError(res, 400, 'Project ID is required', 'VALIDATION_ERROR')
        }

        const project = await findProjectById(projectId, res)
        if (!project) return

        req.project = project
        next()
    } catch (error) {
        sendServerError(res, error)
    }
}

const setProjectFromTask = async (req, res, next) => {
    try {
        const taskId = req.params.taskId

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return sendError(res, 400, 'Invalid task id', 'VALIDATION_ERROR')
        }

        const task = await Task.findById(taskId)

        if (!task) {
            return sendError(res, 404, 'Task not found', 'TASK_NOT_FOUND')
        }

        const project = await findProjectById(task.projectId, res)
        if (!project) return

        req.task = task
        req.project = project
        next()
    } catch (error) {
        sendServerError(res, error)
    }
}

const setProjectFromReport = async (req, res, next) => {
    try {
        const reportId = req.params.reportId

        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return sendError(res, 400, 'Invalid report id', 'VALIDATION_ERROR')
        }

        const report = await HourensoReports.findById(reportId)

        if (!report) {
            return sendError(res, 404, 'Report not found', 'REPORT_NOT_FOUND')
        }

        const project = await findProjectById(report.projectId, res)
        if (!project) return

        req.report = report
        req.project = project
        next()
    } catch (error) {
        sendServerError(res, error)
    }
}

const authGetProject = (req, res, next) => {
    if (!canViewProject(req.user, req.project)) {
        return sendError(res, 403, 'Not allowed to access this project', 'PROJECT_FORBIDDEN')
    }

    next()
}

module.exports = {
    setProject,
    setProjectFromBody,
    setProjectFromTask,
    setProjectFromReport,
    authGetProject
}
