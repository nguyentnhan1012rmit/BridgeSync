const axios = require('axios');
const ITGlossary = require('../models/ITGlossary');
require('dotenv').config();

// @desc    Translate text (Checks Glossary first, then falls back to API)
// @route   POST /api/translate
const translateText = async (req, res) => {
    try {
        const { text, targetLang } = req.body; // e.g., targetLang: 'ja' or 'vi'

        if (!text || !targetLang) {
            return res.status(400).json({ message: 'Text and target language are required.' });
        }

        // 1. Check Custom IT Glossary First (case-insensitive)
        const glossaryMatch = await ITGlossary.findOne({
            baseTerm: { $regex: new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        if (glossaryMatch && glossaryMatch.translations[targetLang]) {
            glossaryMatch.useCount += 1;
            await glossaryMatch.save();

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
            const errMsg = deeplError.response?.data?.message || deeplError.message;
            console.error('DeepL API Error:', errMsg);

            // Return original text gracefully instead of crashing with 500
            return res.json({
                originalText: text,
                translatedText: text,
                source: 'DeepL unavailable'
            });
        }

    } catch (error) {
        console.error('Translation API Error:', error.message);
        res.status(500).json({ message: 'Failed to translate text.' });
    }
};


module.exports = {
    translateText
}
