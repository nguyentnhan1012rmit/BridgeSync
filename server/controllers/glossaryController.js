const ITGlossary = require('../models/ITGlossary')

// @route   GET /api/glossary
const getGlossary = async (req, res) => {
    try {
        const terms = await ITGlossary.find().sort({ baseTerm: 1 });
        res.json(terms)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}


// @route POST /api/glossary
const addGlossaryTerm = async (req, res) => {
    try {
        const { baseTerm, translations } = req.body;
        const termExists = await ITGlossary.findOne({ baseTerm: baseTerm.toLowerCase() })
        if (termExists) {
            return res.status(400).json({ message: 'Term already exists in the glossary.' })
        }
        const newTerm = new ITGlossary({
            baseTerm: baseTerm,
            translations: translations,
            addedBy: req.user._id
        })
        const savedTerm = await newTerm.save();
        res.status(201).json(savedTerm)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}





module.exports = {
    getGlossary,
    addGlossaryTerm,


}