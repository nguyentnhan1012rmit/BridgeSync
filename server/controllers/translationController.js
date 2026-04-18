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

        // 1. Check Custom IT Glossary First
        const glossaryMatch = await ITGlossary.findOne({ baseTerm: text.toLowerCase() });

        if (glossaryMatch && glossaryMatch.translations[targetLang]) {
            glossaryMatch.useCount += 1;
            await glossaryMatch.save();

            return res.json({
                originalText: text,
                translatedText: glossaryMatch.translations[targetLang],
                source: 'Custom IT Glossary'
            });
        }

        // 2. Fallback to External API (Example using DeepL Free API)

        const deeplApiEndpoint = process.env.DEEPL_API_URL || process.env.DEEPL_URL;
        if (!deeplApiEndpoint) {
            return res.status(500).json({ message: 'DeepL API endpoint is not configured.' });
        }

        let response;
        if (process.env.DEEPL_API_URL) {
            response = await axios.post(process.env.DEEPL_API_URL, null, {
                params: {
                    auth_key: process.env.DEEPL_API_KEY,
                    text,
                    target_lang: targetLang.toUpperCase()
                }
            });
        } else {
            response = await axios.post(process.env.DEEPL_URL, {
                text: [text],
                target_lang: targetLang.toUpperCase()
            }, {
                headers: {
                    'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
        }

        res.json({
            originalText: text,
            translatedText: response.data.translations[0].text,
            source: 'DeepL API'
        });

    } catch (error) {
        console.error('Translation API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Failed to translate text via external API.' });
    }
};


module.exports = {
    translateText
}
