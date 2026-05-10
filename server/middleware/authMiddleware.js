const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const { sendError } = require('../utils/httpResponses');
const { logger } = require('../utils/logger');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return sendError(res, 401, 'Not authorized, user not found', 'AUTH_USER_NOT_FOUND');
            }

            return next();
        } catch (error) {
            logger.warn({ err: error }, 'JWT verification failed');
            return sendError(res, 401, 'Not authorized, token failed', 'AUTH_TOKEN_FAILED');
        }
    }

    if (!token) {
        return sendError(res, 401, 'Not authorized, no token', 'AUTH_TOKEN_MISSING');
    }
};


const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return sendError(res, 403, `User role '${req.user.role}' is not authorized to access this route`, 'ROLE_FORBIDDEN');
        }
        next();
    };
};



module.exports = { protect, authorize };
