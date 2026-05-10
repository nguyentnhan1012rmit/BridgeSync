const { z } = require('zod');

const addGlossaryTermSchema = z.object({
  body: z.object({
    baseTerm: z.string().min(1, 'Base term is required').max(500),
    translations: z.object({
      en: z.string().min(1, 'English translation is required'),
      vi: z.string().min(1, 'Vietnamese translation is required'),
      ja: z.string().min(1, 'Japanese translation is required'),
    }),
  }),
});

const updateGlossaryTermSchema = z.object({
  body: z.object({
    baseTerm: z.string().min(1).max(500).optional(),
    translations: z.object({
      en: z.string().min(1).optional(),
      vi: z.string().min(1).optional(),
      ja: z.string().min(1).optional(),
    }).optional(),
  }),
});

const importGlossarySchema = z.object({
  body: z.object({
    terms: z.array(z.any()).min(1, 'Import requires a non-empty terms array').max(500),
  }),
});

module.exports = { addGlossaryTermSchema, updateGlossaryTermSchema, importGlossarySchema };
