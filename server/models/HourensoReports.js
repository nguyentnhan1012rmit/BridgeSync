const mongoose = require('mongoose');

const hourensoReportSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Projects', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },

    // 報告 (Houkoku) - Report
    houkoku: {
        currentStatus: { type: String, required: true },
        progress: { type: String, required: true },
        issues: { type: String },
        nextSteps: { type: String, required: true }
    },

    // 連絡 (Renraku) - Contact/Share
    renraku: {
        sharedInformation: { type: String }
    },

    // 相談 (Soudan) - Consult
    soudan: {
        topic: { type: String },
        proposedOptions: [{ type: String }],
        deadline: { type: Date }
    }
}, { timestamps: true });

hourensoReportSchema.index({ projectId: 1, createdAt: -1 });
hourensoReportSchema.index({ authorId: 1, createdAt: -1 });

module.exports = mongoose.model('HourensoReports', hourensoReportSchema)
