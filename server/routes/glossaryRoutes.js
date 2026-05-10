const express = require('express');
const router = express.Router();
const { getGlossary, addGlossaryTerm, importGlossaryTerms } = require('../controllers/glossaryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { addGlossaryTermSchema, importGlossarySchema } = require('../validators/glossaryValidator');

router.route('/')
    .get(protect, getGlossary)
    .post(protect, authorize('BrSE'), validate(addGlossaryTermSchema), addGlossaryTerm); // Only BrSE can add terms

router.route('/import')
    .post(protect, authorize('BrSE'), validate(importGlossarySchema), importGlossaryTerms);

module.exports = router;
