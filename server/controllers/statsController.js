const Project = require('../models/Projects');
const Task = require('../models/Tasks');
const HourensoReports = require('../models/HourensoReports');
const ITGlossary = require('../models/ITGlossary');

// @desc    Get aggregated dashboard stats
// @route   GET /api/stats
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const [activeProjects, pendingTasks, glossaryTerms] = await Promise.all([
            Project.countDocuments({ status: 'active', members: userId }),
            Task.countDocuments({ status: 'ongoing', assigneeId: userId }),
            ITGlossary.countDocuments(),
        ]);

        // Reports created in the last 7 days by the user
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const reportsThisWeek = await HourensoReports.countDocuments({
            authorId: userId,
            createdAt: { $gte: oneWeekAgo },
        });

        // Recent activity — last 5 reports by the user or on user's projects
        const userProjects = await Project.find({ members: userId }).select('_id');
        const projectIds = userProjects.map(p => p._id);
        
        const recentReports = await HourensoReports.find({
            $or: [{ authorId: userId }, { projectId: { $in: projectIds } }]
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('authorId', 'name role')
            .populate('projectId', 'name');

        res.json({
            activeProjects,
            pendingTasks,
            reportsThisWeek,
            glossaryTerms,
            recentReports,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };
