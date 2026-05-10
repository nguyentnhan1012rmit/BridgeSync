const ITGlossary = require('../models/ITGlossary')
const { sendError, sendServerError } = require('../utils/httpResponses')

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeTerm = (baseTerm) => baseTerm.trim().toLocaleLowerCase();

const isValidTermPayload = (term) => {
    return Boolean(
        term?.baseTerm?.trim() &&
        term?.translations?.en?.trim() &&
        term?.translations?.vi?.trim() &&
        term?.translations?.ja?.trim()
    );
};

const buildGlossaryPayload = (term, addedBy) => ({
    baseTerm: term.baseTerm.trim(),
    normalizedBaseTerm: normalizeTerm(term.baseTerm),
    translations: {
        en: term.translations.en.trim(),
        vi: term.translations.vi.trim(),
        ja: term.translations.ja.trim(),
    },
    addedBy,
});

// @route   GET /api/glossary
const getGlossary = async (req, res) => {
    try {
        const { search = '', page, limit } = req.query;
        const trimmedSearch = search.trim();
        const filter = trimmedSearch
            ? {
                $or: [
                    { baseTerm: { $regex: new RegExp(escapeRegExp(trimmedSearch), 'i') } },
                    { 'translations.en': { $regex: new RegExp(escapeRegExp(trimmedSearch), 'i') } },
                    { 'translations.vi': { $regex: new RegExp(escapeRegExp(trimmedSearch), 'i') } },
                    { 'translations.ja': { $regex: new RegExp(escapeRegExp(trimmedSearch), 'i') } },
                ],
            }
            : {};

        if (page || limit || trimmedSearch) {
            const pageNumber = Math.max(Number.parseInt(page || '1', 10), 1);
            const pageSize = Math.min(Math.max(Number.parseInt(limit || '20', 10), 1), 100);
            const skip = (pageNumber - 1) * pageSize;
            const [items, total] = await Promise.all([
                ITGlossary.find(filter).sort({ baseTerm: 1 }).skip(skip).limit(pageSize).lean(),
                ITGlossary.countDocuments(filter),
            ]);

            return res.json({
                items,
                pagination: {
                    page: pageNumber,
                    limit: pageSize,
                    total,
                    totalPages: Math.max(Math.ceil(total / pageSize), 1),
                },
            });
        }

        const terms = await ITGlossary.find(filter).sort({ baseTerm: 1 }).lean();
        res.json(terms)
    } catch (error) {
        sendServerError(res, error)
    }
}

// @route POST /api/glossary
const addGlossaryTerm = async (req, res) => {
    try {
        const { baseTerm, translations } = req.body;

        if (!baseTerm?.trim()) {
            return sendError(res, 400, 'Base term is required.', 'VALIDATION_ERROR');
        }

        if (!translations?.en || !translations?.vi || !translations?.ja) {
            return sendError(res, 400, 'English, Vietnamese, and Japanese translations are required.', 'VALIDATION_ERROR');
        }

        const normalizedBaseTerm = normalizeTerm(baseTerm);
        const termExists = await ITGlossary.findOne({
            $or: [
                { normalizedBaseTerm },
                { baseTerm: { $regex: new RegExp(`^${escapeRegExp(baseTerm.trim())}$`, 'i') } }
            ]
        })

        if (termExists) {
            return sendError(res, 400, 'Term already exists in the glossary.', 'DUPLICATE_GLOSSARY_TERM')
        }

        const newTerm = new ITGlossary(buildGlossaryPayload({ baseTerm, translations }, req.user._id))
        const savedTerm = await newTerm.save();
        res.status(201).json(savedTerm)
    } catch (error) {
        if (error.code === 11000) {
            return sendError(res, 400, 'Term already exists in the glossary.', 'DUPLICATE_GLOSSARY_TERM')
        }

        sendServerError(res, error)
    }
}

// @route POST /api/glossary/import
const importGlossaryTerms = async (req, res) => {
    try {
        const { terms } = req.body;

        if (!Array.isArray(terms) || terms.length === 0) {
            return sendError(res, 400, 'Import requires a non-empty terms array.', 'VALIDATION_ERROR');
        }

        if (terms.length > 500) {
            return sendError(res, 400, 'Import is limited to 500 terms at a time.', 'VALIDATION_ERROR');
        }

        const validTerms = [];
        const seen = new Set();
        let invalidCount = 0;
        let duplicateInFileCount = 0;

        terms.forEach((term) => {
            if (!isValidTermPayload(term)) {
                invalidCount += 1;
                return;
            }

            const normalizedBaseTerm = normalizeTerm(term.baseTerm);
            if (seen.has(normalizedBaseTerm)) {
                duplicateInFileCount += 1;
                return;
            }

            seen.add(normalizedBaseTerm);
            validTerms.push(buildGlossaryPayload(term, req.user._id));
        });

        if (validTerms.length === 0) {
            return res.status(400).json({
                message: 'No valid glossary terms found.',
                error: { code: 'VALIDATION_ERROR', status: 400 },
                imported: 0,
                skipped: invalidCount + duplicateInFileCount,
            });
        }

        const normalizedTerms = validTerms.map(term => term.normalizedBaseTerm);
        const existingTerms = await ITGlossary.find({ normalizedBaseTerm: { $in: normalizedTerms } }).select('normalizedBaseTerm').lean();
        const existingSet = new Set(existingTerms.map(term => term.normalizedBaseTerm));
        const termsToInsert = validTerms.filter(term => !existingSet.has(term.normalizedBaseTerm));

        let imported = 0;
        if (termsToInsert.length > 0) {
            const inserted = await ITGlossary.insertMany(termsToInsert, { ordered: false });
            imported = inserted.length;
        }

        const duplicateInDatabaseCount = validTerms.length - termsToInsert.length;

        res.status(201).json({
            imported,
            skipped: invalidCount + duplicateInFileCount + duplicateInDatabaseCount,
            invalid: invalidCount,
            duplicateInFile: duplicateInFileCount,
            duplicateInDatabase: duplicateInDatabaseCount,
        });
    } catch (error) {
        if (error.code === 11000) {
            return sendError(res, 400, 'One or more terms already exist in the glossary.', 'DUPLICATE_GLOSSARY_TERM')
        }

        sendServerError(res, error)
    }
}

module.exports = {
    getGlossary,
    addGlossaryTerm,
    importGlossaryTerms
}
