const User = require('../models/Users')
const jwt = require('jsonwebtoken')
require('dotenv').config()

async function registerUser(req, res) {
    try {
        const { name, email, password, role, preferredLanguage } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' })
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            preferredLanguage
        })

        if (user) {
            const token = generateToken(user._id, user.role);
            res.status(201).json({
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }
            })
        } else {
            res.status(400).json({ message: 'Invalid user data' })
        }

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
};

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email })

        if (user && (await user.matchPassword(password))) {
            const accessToken = generateToken(user._id, user.role);
            const refreshToken = generateRefreshToken(user._id, user.role);

            user.refreshToken = refreshToken;
            await user.save();

            res.json({
                token: accessToken,
                refreshToken: refreshToken,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }
            })
        } else {
            res.status(401).json({ message: 'Invalid email or password' })
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
};

const logoutUser = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.refreshToken = null;
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
        expiresIn: '7d'
    });
};

const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body

    if (refreshToken == null) {
        return res.status(401).json({ message: 'No refresh token provided' })
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: 'User not found' });


        if (user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: 'Refresh token has been revoked or is invalid' });
        }
        
        const newAccessToken = generateToken(user._id, user.role);

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired refresh token' })
    }
}



module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}