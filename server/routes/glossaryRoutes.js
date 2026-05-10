const express = require('express');
const router = express.Router();
const { getGlossary, addGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm, importGlossaryTerms } = require('../controllers/glossaryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { addGlossaryTermSchema, updateGlossaryTermSchema, importGlossarySchema } = require('../validators/glossaryValidator');

router.route('/')
    .get(protect, getGlossary)
    .post(protect, authorize('BrSE'), validate(addGlossaryTermSchema), addGlossaryTerm);

router.route('/import')
    .post(protect, authorize('BrSE'), validate(importGlossarySchema), importGlossaryTerms);

router.route('/:termId')
    .put(protect, authorize('BrSE'), validate(updateGlossaryTermSchema), updateGlossaryTerm)
    .delete(protect, authorize('BrSE'), deleteGlossaryTerm);

module.exports = router;
