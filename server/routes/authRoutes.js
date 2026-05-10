const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, refreshAccessToken, listUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/logout', protect, logoutUser);
router.post('/refresh', refreshAccessToken);
router.get('/users', protect, authorize('PM', 'BrSE'), listUsers);

module.exports = router;
