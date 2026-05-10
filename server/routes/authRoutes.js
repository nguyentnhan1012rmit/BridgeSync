const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, refreshAccessToken, listUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');


router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.post('/refresh', refreshAccessToken);
router.get('/users', protect, authorize('PM', 'BrSE'), listUsers);

module.exports = router;
