const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        enum: ['Japanese client', 'BrSE', 'Developer', 'PM'],
        required: true
    },
    preferredLanguage: {
        type: String,
        enum: ['en', 'vi', 'ja'],
        default: 'en'
    }
}, { timestamps: true });

module.exports = mongoose.model('Users', userSchema);