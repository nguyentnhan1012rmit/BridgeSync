const express = require('express');
const router = express.Router();
const { getGlossary, addGlossaryTerm } = require('../controllers/glossaryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getGlossary)
    .post(protect, authorize('BrSE'), addGlossaryTerm); // Only BrSE can add terms

module.exports = router;