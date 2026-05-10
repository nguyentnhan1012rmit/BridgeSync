const User = require('../models/Users')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { sendError, sendServerError } = require('../utils/httpResponses')
require('dotenv').config()

const REFRESH_TOKEN_EXPIRES_IN = '7d';
const allowedRoles = ['Japanese client', 'BrSE', 'Developer', 'PM'];

const getMissingAuthConfig = () => {
    return ['ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET', 'JWT_EXPIRES_IN']
        .filter((key) => !process.env[key]);
};

const buildUserResponse = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
});

const persistRefreshToken = async (user, refreshToken) => {
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();
};

async function registerUser(req, res) {
    try {
        const { name, email, password, role, preferredLanguage } = req.body;

        if (!name?.trim() || !email?.trim() || !password || !allowedRoles.includes(role)) {
            return sendError(res, 400, 'Name, email, password, and valid role are required', 'VALIDATION_ERROR');
        }

        const missingConfig = getMissingAuthConfig();
        if (missingConfig.length > 0) {
            return sendError(res, 500, `Missing auth configuration: ${missingConfig.join(', ')}`, 'AUTH_CONFIG_MISSING');
        }

        const normalizedEmail = email.trim().toLowerCase();
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return sendError(res, 400, 'User already exists', 'USER_EXISTS')
        }

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role,
            preferredLanguage
        })

        if (user) {
            const token = generateToken(user._id, user.role);
            const refreshToken = generateRefreshToken(user._id, user.role);

            await persistRefreshToken(user, refreshToken);

            res.status(201).json({
                token,
                refreshToken,
                user: buildUserResponse(user)
            })
        } else {
            sendError(res, 400, 'Invalid user data', 'INVALID_USER_DATA')
        }

    } catch (err) {
        sendServerError(res, err)
    }
};

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        const missingConfig = getMissingAuthConfig();
        if (missingConfig.length > 0) {
            return sendError(res, 500, `Missing auth configuration: ${missingConfig.join(', ')}`, 'AUTH_CONFIG_MISSING');
        }

        const user = await User.findOne({ email: email?.trim().toLowerCase() })

        if (user && (await user.matchPassword(password))) {
            const accessToken = generateToken(user._id, user.role);
            const refreshToken = generateRefreshToken(user._id, user.role);

            await persistRefreshToken(user, refreshToken);

            res.json({
                token: accessToken,
                refreshToken: refreshToken,
                user: buildUserResponse(user)
            })
        } else {
            sendError(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS')
        }
    } catch (err) {
        sendServerError(res, err)
    }
};

const logoutUser = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.refreshTokenHash = null;
        await user.save();
    }

    res.json({ message: 'Logged out successfully' });
}


const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
};

const generateRefreshToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN
    });
};

const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body

    if (refreshToken == null) {
        return sendError(res, 401, 'No refresh token provided', 'NO_REFRESH_TOKEN')
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decoded.id);
        if (!user?.refreshTokenHash) {
            return sendError(res, 401, 'User not found or refresh token revoked', 'REFRESH_REVOKED');
        }

        const matchesStoredToken = await bcrypt.compare(refreshToken, user.refreshTokenHash);
        if (!matchesStoredToken) {
            user.refreshTokenHash = null;
            await user.save();
            return sendError(res, 403, 'Refresh token has been revoked or is invalid', 'REFRESH_TOKEN_REUSE');
        }

        const newAccessToken = generateToken(user._id, user.role);
        const newRefreshToken = generateRefreshToken(user._id, user.role);
        await persistRefreshToken(user, newRefreshToken);

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch {
        sendError(res, 403, 'Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN')
    }
}

const listUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('name email role preferredLanguage')
            .sort({ name: 1 })
            .lean();

        res.json(users);
    } catch (error) {
        sendServerError(res, error)
    }
}



module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    listUsers
}
