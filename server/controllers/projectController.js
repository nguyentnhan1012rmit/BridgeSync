const mongoose = require('mongoose')
const Project = require('../models/Projects')
const Task = require('../models/Tasks')
const HourensoReports = require('../models/HourensoReports')
const User = require('../models/Users')
const { sendError, sendServerError } = require('../utils/httpResponses')

// @route   GET /api/projects
const getProjects = async (req, res) => {
    try {
        const filter = req.user.role === 'PM'
            ? { status: 'active' }
            : { status: 'active', members: req.user._id };

        const projects = await Project.find(filter)
            .sort({ createdAt: -1 })
            .populate('members', 'name email')
            .lean();

        res.json(projects)
    } catch (err) {
        sendServerError(res, err)
    };
};


// @route   POST /api/projects
const createProject = async (req, res) => {
    try {
        const { name, description, members = [], preferredLanguage = 'ja' } = req.body;

        if (!name?.trim()) {
            return sendError(res, 400, 'Project name is required', 'VALIDATION_ERROR');
        }

        if (!['en', 'vi', 'ja'].includes(preferredLanguage)) {
            return sendError(res, 400, 'Invalid preferred language', 'VALIDATION_ERROR');
        }

        if (!Array.isArray(members)) {
            return sendError(res, 400, 'Project members must be an array', 'VALIDATION_ERROR');
        }

        const memberIds = [...new Set([...members, req.user._id.toString()])];
        const hasInvalidMember = memberIds.some(id => !mongoose.Types.ObjectId.isValid(id));

        if (hasInvalidMember) {
            return sendError(res, 400, 'Invalid project member id', 'VALIDATION_ERROR');
        }

        const existingMemberCount = await User.countDocuments({ _id: { $in: memberIds } });
        if (existingMemberCount !== memberIds.length) {
            return sendError(res, 400, 'One or more project members do not exist', 'VALIDATION_ERROR');
        }

        const project = new Project({
            name: name.trim(),
            description,
            preferredLanguage,
            members: memberIds
        });

        const savedProject = await project.save();
        res.status(201).json(savedProject)
    } catch (error) {
        sendServerError(res, error)
    }
}

// @route DElETE /api/projects/:projectId
const deleteProject = async (req, res) => {
    try {
        await Promise.all([
            Task.deleteMany({ projectId: req.project._id }),
            HourensoReports.deleteMany({ projectId: req.project._id }),
        ]);
        await req.project.deleteOne();
        res.json({ message: 'Project deleted successfully' })
    } catch (error) {
        sendServerError(res, error)
    }
}

//@route GET /api/projects/:projectId
const getOneProject = async (req, res) => {
    try {
        await req.project.populate('members', 'name email role');
        res.json(req.project)
    } catch (error) {
        sendServerError(res, error)
    }
}

// @desc    Get all members of a specific project
// @route   GET /api/projects/:projectId/members
const getProjectMembers = async (req, res) => {
    try {
        await req.project.populate('members', 'name email role');
        res.json(req.project.members);
    } catch (error) {
        sendServerError(res, error)
    }
};

// @route POST /api/projects/:projectId/members
const addProjectMember = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return sendError(res, 400, 'Invalid user id', 'VALIDATION_ERROR');
        }

        const user = await User.findById(userId).select('_id');
        if (!user) {
            return sendError(res, 404, 'User not found', 'USER_NOT_FOUND');
        }

        const alreadyMember = req.project.members.some(memberId => memberId.toString() === userId.toString());
        if (!alreadyMember) {
            req.project.members.push(user._id);
            await req.project.save();
        }

        await req.project.populate('members', 'name email role');
        res.json(req.project.members);
    } catch (error) {
        sendServerError(res, error)
    }
};

// @route DELETE /api/projects/:projectId/members/:userId
const removeProjectMember = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return sendError(res, 400, 'Invalid user id', 'VALIDATION_ERROR');
        }

        req.project.members = req.project.members.filter(memberId => memberId.toString() !== userId.toString());
        await req.project.save();

        await req.project.populate('members', 'name email role');
        res.json(req.project.members);
    } catch (error) {
        sendServerError(res, error)
    }
};




module.exports = {
    getProjects,
    createProject,
    deleteProject,
    getOneProject,
    getProjectMembers,
    addProjectMember,
    removeProjectMember
}
