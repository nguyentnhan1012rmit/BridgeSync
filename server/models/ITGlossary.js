const mongoose = require('mongoose')

const ITGlossarySchema = new mongoose.Schema({
    baseTerm: { type: String, required: true, unique: true }, // E.g., "Deployment"
    translations: {
        en: { type: String, required: true },
        vi: { type: String, required: true },
        ja: { type: String, required: true }
    },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }, // Tracks which BrSE added the term
    useCount: { type: Number, default: 0 } // Useful for caching frequently used terms later 
}, { timestamps: true });

module.exports = mongoose.model('ITGlossary', ITGlossarySchema)