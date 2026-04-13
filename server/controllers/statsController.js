const Project = require('../models/Projects');
const Task = require('../models/Tasks');
const HourensoReports = require('../models/HourensoReports');
const ITGlossary = require('../models/ITGlossary');

// @desc    Get aggregated dashboard stats
// @route   GET /api/stats
const getDashboardStats = async (req, res) => {
    try {
        const [activeProjects, pendingTasks, glossaryTerms] = await Promise.all([
            Project.countDocuments({ status: 'active' }),
            Task.countDocuments({ status: 'ongoing' }),
            ITGlossary.countDocuments(),
        ]);

        // Reports created in the last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const reportsThisWeek = await HourensoReports.countDocuments({
            createdAt: { $gte: oneWeekAgo },
        });

        // Recent activity — last 5 reports across all projects
        const recentReports = await HourensoReports.find()
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
