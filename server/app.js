const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const glossaryRoutes = require('./routes/glossaryRoutes');
const translationRoutes = require('./routes/translationRoutes');
const hourensoRoutes = require('./routes/hourensoRoutes');
const statsRoutes = require('./routes/statsRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { sendError } = require('./utils/httpResponses');

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_ORIGIN,
].filter(Boolean);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: (req) => !req.socket,
  handler: (req, res) => sendError(res, 429, 'Too many requests, please try again later', 'RATE_LIMITED'),
});

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/glossary', glossaryRoutes);
app.use('/api/translate', translationRoutes);
app.use('/api/hourenso', hourensoRoutes);
app.use('/api/stats', statsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
