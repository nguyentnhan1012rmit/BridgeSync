const { z } = require('zod');

const createTaskSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    title: z.string().min(1, 'Task title is required').max(500),
    description: z.string().max(5000).optional(),
    assigneeId: z.string().optional(),
  }),
});

const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Task title is required').max(500),
    description: z.string().max(5000).optional(),
    assigneeId: z.string().nullable().optional(),
  }),
});

const updateTaskStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ongoing', 'completed', 'delayed']),
  }),
});

module.exports = { createTaskSchema, updateTaskSchema, updateTaskStatusSchema };
