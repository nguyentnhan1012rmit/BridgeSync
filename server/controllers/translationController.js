const axios = require('axios');
const ITGlossary = require('../models/ITGlossary');
const { sendError, sendServerError } = require('../utils/httpResponses');
const { logger } = require('../utils/logger');

// @desc    Translate text (Checks Glossary first, then falls back to API)
// @route   POST /api/translate
const translateText = async (req, res) => {
    try {
        const { text, targetLang } = req.body; // e.g., targetLang: 'ja' or 'vi'

        if (!text || !targetLang) {
            return sendError(res, 400, 'Text and target language are required.', 'VALIDATION_ERROR');
        }

        if (!['en', 'vi', 'ja'].includes(targetLang)) {
            return sendError(res, 400, 'Unsupported target language.', 'VALIDATION_ERROR');
        }

        const normalizedText = text.trim().toLocaleLowerCase();

        // 1. Check Custom IT Glossary First (case-insensitive)
        const glossaryQuery = {
            $or: [
                { normalizedBaseTerm: normalizedText },
                { baseTerm: { $regex: new RegExp(`^${text.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
            ]
        };

        const glossaryMatch = await ITGlossary.findOneAndUpdate(
            glossaryQuery,
            { $inc: { useCount: 1 } },
            { new: true }
        ).lean();

        if (glossaryMatch && glossaryMatch.translations[targetLang]) {
            return res.json({
                originalText: text,
                translatedText: glossaryMatch.translations[targetLang],
                source: 'Custom IT Glossary'
            });
        }

        // 2. Fallback to DeepL API
        const deeplApiEndpoint = process.env.DEEPL_API_URL || 'https://api-free.deepl.com/v2/translate';
        const deeplApiKey = process.env.DEEPL_API_KEY;

        if (!deeplApiKey) {
            return res.json({
                originalText: text,
                translatedText: text,
                source: 'No translation API key configured'
            });
        }

        try {
            const response = await axios.post(deeplApiEndpoint, {
                text: [text],
                target_lang: targetLang.toUpperCase()
            }, {
                headers: {
                    'Authorization': `DeepL-Auth-Key ${deeplApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000,
            });

            return res.json({
                originalText: text,
                translatedText: response.data.translations[0].text,
                source: 'DeepL API'
            });
        } catch (deeplError) {
            logger.warn({ err: deeplError }, 'DeepL API Error');

            // Return original text gracefully instead of crashing with 500
            return res.json({
                originalText: text,
                translatedText: text,
                source: 'DeepL unavailable'
            });
        }

    } catch (error) {
        logger.error({ err: error }, 'Translation API Error');
        sendServerError(res, error);
    }
};


module.exports = {
    translateText
}
