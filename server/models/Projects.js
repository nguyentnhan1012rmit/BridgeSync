const mongoose = require('mongoose');


const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }]
}, { timestamps: true });

module.exports = mongoose.model('Projects', projectSchema);