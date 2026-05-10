const { z } = require('zod');

const houkokuSchema = z.object({
  currentStatus: z.string().min(1, 'Current status is required'),
  progress: z.string().min(1, 'Progress is required'),
  issues: z.string().optional(),
  nextSteps: z.string().min(1, 'Next steps are required'),
});

const createReportSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    houkoku: houkokuSchema,
    renraku: z.object({
      sharedInformation: z.string().optional(),
    }).optional(),
    soudan: z.object({
      topic: z.string().optional(),
      proposedOptions: z.array(z.string()).optional(),
      deadline: z.string().datetime().or(z.string()).nullable().optional(),
    }).optional(),
  }),
});

const updateReportSchema = z.object({
  body: z.object({
    houkoku: houkokuSchema,
    renraku: z.object({
      sharedInformation: z.string().optional(),
    }).optional(),
    soudan: z.object({
      topic: z.string().optional(),
      proposedOptions: z.array(z.string()).optional(),
      deadline: z.string().datetime().or(z.string()).nullable().optional(),
    }).optional(),
  }),
});

module.exports = { createReportSchema, updateReportSchema };
