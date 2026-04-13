require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const { protect, authorize } = require('./middleware/authMiddleware')

const authRoutes = require('./routes/authRoutes')
const projectRoutes = require('./routes/projectRoutes')
const taskRoutes = require('./routes/taskRoutes')
const glossaryRoutes = require('./routes/glossaryRoutes')
const translationRoutes = require('./routes/translationRoutes')
const hourensoRoutes = require('./routes/hourensoRoutes');
const statsRoutes = require('./routes/statsRoutes');
const corsOptions = {
    origin: ["http://localhost:5173"]
}

app.use(cors(corsOptions))
app.use(express.json())

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI)
        console.log("Database connected");
    }
    catch (err) {
        console.error("Database lost connection", err.message);

    }
}
connectDB();

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks/', taskRoutes);
app.use('/api/glossary/', glossaryRoutes);
app.use('/api/translate/', translationRoutes);
app.use('/api/hourenso', hourensoRoutes);
app.use('/api/stats', statsRoutes);

// PM api
app.get('/api/admin/dashboard', protect, authorize('PM'), (req, res) => {
    res.json({ message: 'Welcome to the PM Dashboard' });
});

app.listen(3000, () => console.log("Server started on ", process.env.PORT))
