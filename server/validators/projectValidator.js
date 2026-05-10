const { z } = require('zod');

const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required').max(200),
    description: z.string().max(2000).optional(),
    preferredLanguage: z.enum(['en', 'vi', 'ja']).optional(),
    members: z.array(z.string()).optional(),
  }),
});

module.exports = { createProjectSchema };
