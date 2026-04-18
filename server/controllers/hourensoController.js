const HourensoReports = require('../models/HourensoReports');
const Project = require('../models/Projects');

// @route   POST /api/hourenso
const createReport = async (req, res) => {
    try {
        const { projectId, houkoku, renraku, soudan } = req.body;

        const projectExists = await Project.findById(projectId);
        if (!projectExists) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!houkoku || !houkoku.currentStatus || !houkoku.progress || !houkoku.issues || !houkoku.nextSteps) {
            return res.status(400).json({ message: 'Houkoku (Report) section requires currentStatus, progress, and nextSteps.' });
        }
        const report = new HourensoReports({
            projectId: projectId,
            authorId: req.user._id,
            houkoku,
            renraku: renraku || { sharedInformation: '' },
            soudan: soudan || { topic: '', proposedOptions: [], deadline: null }

        })

        const savedReport = await report.save();
        await savedReport.populate('authorId', 'name role');
        res.status(201).json(savedReport)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @route   GET /api/hourenso/:projectId
const getProjectReports = async (req, res) => {
    try {
        const reports = await HourensoReports.find({ projectId: req.params.projectId }).populate('authorId', 'name role').sort({ createdAt: -1 })
        res.json(reports)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}



module.exports = {
    createReport,
    getProjectReports
}