const Task = require('../models/Tasks')
const mongoose = require('mongoose')
const { sendError, sendServerError } = require('../utils/httpResponses')

const allowedStatuses = ['ongoing', 'completed', 'delayed'];

const isProjectMember = (project, userId) => {
    return project.members.some(memberId => memberId.toString() === userId.toString());
}

// @route   GET /api/tasks/:projectId
const getTasksByProject = async (req, res) => {
    try {
        const tasks = await Task.find({ projectId: req.project._id })
            .sort({ createdAt: -1 })
            .populate('assigneeId', 'name')
            .populate('reporterId', 'name')
            .lean();

        res.json(tasks)
    } catch (error) {
        sendServerError(res, error)
    }
}

// @route   POST /api/tasks
const createTask = async (req, res) => {
    try {
        const { projectId, title, description, assigneeId } = req.body;

        if (!projectId || !title?.trim()) {
            return sendError(res, 400, 'Project ID and Task Title are required.', 'VALIDATION_ERROR');
        }

        const normalizedAssigneeId = assigneeId || undefined;

        if (normalizedAssigneeId) {
            if (!mongoose.Types.ObjectId.isValid(normalizedAssigneeId)) {
                return sendError(res, 400, 'Invalid assignee id', 'VALIDATION_ERROR');
            }

            if (!isProjectMember(req.project, normalizedAssigneeId)) {
                return sendError(res, 400, 'Assignee must be a member of the project.', 'VALIDATION_ERROR');
            }
        }

        const task = new Task({
            projectId: req.project._id,
            title: title.trim(),
            description,
            assigneeId: normalizedAssigneeId,
            reporterId: req.user._id
        });

        const savedTask = await task.save();

        await savedTask.populate('assigneeId', 'name role');
        await savedTask.populate('reporterId', 'name role');
        res.status(201).json(savedTask)
    } catch (error) {
        sendServerError(res, error)
    }
}

// @route PUT /api/tasks/:taskId
const updateTask = async (req, res) => {
    try {
        const { title, description, assigneeId } = req.body;

        if (!title?.trim()) {
            return sendError(res, 400, 'Task title is required.', 'VALIDATION_ERROR');
        }

        const normalizedAssigneeId = assigneeId || undefined;

        if (normalizedAssigneeId) {
            if (!mongoose.Types.ObjectId.isValid(normalizedAssigneeId)) {
                return sendError(res, 400, 'Invalid assignee id', 'VALIDATION_ERROR');
            }

            if (!isProjectMember(req.project, normalizedAssigneeId)) {
                return sendError(res, 400, 'Assignee must be a member of the project.', 'VALIDATION_ERROR');
            }
        }

        req.task.title = title.trim();
        req.task.description = description || '';
        req.task.assigneeId = normalizedAssigneeId;

        const task = await req.task.save();
        await task.populate('assigneeId', 'name role');
        await task.populate('reporterId', 'name role');

        res.json(task);
    } catch (error) {
        sendServerError(res, error)
    }
}

// @route   PUT /api/tasks/:taskId/status
const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!allowedStatuses.includes(status)) {
            return sendError(res, 400, 'Invalid task status', 'VALIDATION_ERROR');
        }

        req.task.status = status;
        const task = await req.task.save();
        await task.populate('assigneeId', 'name role');
        await task.populate('reporterId', 'name role');

        res.json(task);
    } catch (error) {
        sendServerError(res, error)
    }
}

// @route DELETE /api/tasks/:taskId
const deleteTask = async (req, res) => {
    try {
        await req.task.deleteOne();
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        sendServerError(res, error)
    }
}

module.exports = {
    getTasksByProject,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
}
