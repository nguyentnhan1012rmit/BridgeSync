const mongoose = require('mongoose');


const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    preferredLanguage: { type: String, enum: ['en', 'vi', 'ja'], default: 'ja' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }]
}, { timestamps: true });

projectSchema.index({ status: 1, members: 1 });

module.exports = mongoose.model('Projects', projectSchema);
