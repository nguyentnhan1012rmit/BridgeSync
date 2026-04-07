const express = require('express');
const router = express.Router();
const { translateText } = require('../controllers/translationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, translateText);

module.exports = router;