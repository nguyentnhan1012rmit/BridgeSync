const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Projects', required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'delayed'],
        default: 'ongoing'
    },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }
}, { timestamps: true });

module.exports = mongoose.model('Tasks', taskSchema);