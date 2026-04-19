require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const glossaryRoutes = require('./routes/glossaryRoutes');
const translationRoutes = require('./routes/translationRoutes');
const hourensoRoutes = require('./routes/hourensoRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS — allow Vite dev server
app.use(cors({ origin: ['http://localhost:5173'] }));
app.use(express.json());

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log('Database connected');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
};
connectDB();

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/glossary', glossaryRoutes);
app.use('/api/translate', translationRoutes);
app.use('/api/hourenso', hourensoRoutes);
app.use('/api/stats', statsRoutes);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
