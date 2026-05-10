const Project = require('../models/Projects');
const Task = require('../models/Tasks');
const HourensoReports = require('../models/HourensoReports');
const ITGlossary = require('../models/ITGlossary');
const { sendServerError } = require('../utils/httpResponses');

// @desc    Get aggregated dashboard stats
// @route   GET /api/stats
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const isPM = req.user.role === 'PM';
        const projectFilter = isPM ? { status: 'active' } : { status: 'active', members: userId };

        const userProjects = isPM
            ? await Project.find({ status: 'active' }).select('_id').lean()
            : await Project.find({ members: userId }).select('_id').lean();
        const projectIds = userProjects.map(p => p._id);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const reportScope = isPM
            ? { projectId: { $in: projectIds } }
            : { $or: [{ authorId: userId }, { projectId: { $in: projectIds } }] };

        const [activeProjects, pendingTasks, glossaryTerms, reportsThisWeek, recentReports] = await Promise.all([
            Project.countDocuments(projectFilter),
            Task.countDocuments(isPM
                ? { status: 'ongoing', projectId: { $in: projectIds } }
                : { status: 'ongoing', assigneeId: userId }),
            ITGlossary.countDocuments(),
            HourensoReports.countDocuments({ ...reportScope, createdAt: { $gte: oneWeekAgo } }),
            HourensoReports.find(reportScope)
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('authorId', 'name role')
                .populate('projectId', 'name')
                .lean(),
        ]);

        res.json({
            activeProjects,
            pendingTasks,
            reportsThisWeek,
            glossaryTerms,
            recentReports,
        });
    } catch (error) {
        sendServerError(res, error);
    }
};

module.exports = { getDashboardStats };
