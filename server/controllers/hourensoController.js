const HourensoReports = require('../models/HourensoReports');
const { sendError, sendServerError } = require('../utils/httpResponses');
const { emitEvent } = require('../socket');

const validateReportPayload = ({ houkoku, soudan }, res) => {
    if (!houkoku || !houkoku.currentStatus || !houkoku.progress || !houkoku.issues || !houkoku.nextSteps) {
        sendError(res, 400, 'Houkoku (Report) section requires currentStatus, progress, issues, and nextSteps.', 'VALIDATION_ERROR');
        return false;
    }

    if (soudan?.proposedOptions && !Array.isArray(soudan.proposedOptions)) {
        sendError(res, 400, 'Soudan proposedOptions must be an array.', 'VALIDATION_ERROR');
        return false;
    }

    if (soudan?.deadline && Number.isNaN(new Date(soudan.deadline).getTime())) {
        sendError(res, 400, 'Soudan deadline must be a valid date.', 'VALIDATION_ERROR');
        return false;
    }

    return true;
};

// @route   POST /api/hourenso
const createReport = async (req, res) => {
    try {
        const { houkoku, renraku, soudan } = req.body;

        if (!validateReportPayload({ houkoku, soudan }, res)) return;

        const report = new HourensoReports({
            projectId: req.project._id,
            authorId: req.user._id,
            houkoku,
            renraku: renraku || { sharedInformation: '' },
            soudan: soudan || { topic: '', proposedOptions: [], deadline: null }

        })

        const savedReport = await report.save();
        await savedReport.populate('authorId', 'name role');
        emitEvent('report:created', { projectId: String(req.project._id), report: savedReport });
        res.status(201).json(savedReport)
    } catch (error) {
        sendServerError(res, error)
    }
}

// @route PUT /api/hourenso/reports/:reportId
const updateReport = async (req, res) => {
    try {
        const { houkoku, renraku, soudan } = req.body;

        if (!validateReportPayload({ houkoku, soudan }, res)) return;

        req.report.houkoku = houkoku;
        req.report.renraku = renraku || { sharedInformation: '' };
        req.report.soudan = soudan || { topic: '', proposedOptions: [], deadline: null };

        const report = await req.report.save();
        await report.populate('authorId', 'name role');

        emitEvent('report:updated', { projectId: String(report.projectId), report });
        res.json(report);
    } catch (error) {
        sendServerError(res, error)
    }
}

// @route   GET /api/hourenso/:projectId
const getProjectReports = async (req, res) => {
    try {
        const reports = await HourensoReports.find({ projectId: req.project._id })
            .sort({ createdAt: -1 })
            .populate('authorId', 'name role')
            .lean();
        res.json(reports)
    } catch (error) {
        sendServerError(res, error)
    }
}

// @route DELETE /api/hourenso/reports/:reportId
const deleteReport = async (req, res) => {
    try {
        const projectId = String(req.report.projectId);
        const reportId = String(req.report._id);
        await req.report.deleteOne();
        emitEvent('report:deleted', { projectId, reportId });
        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        sendServerError(res, error)
    }
}



module.exports = {
    createReport,
    updateReport,
    getProjectReports,
    deleteReport
}
