require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket');
const { logger } = require('./utils/logger');

const PORT = process.env.PORT || 3000;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    logger.info('Database connected');
  } catch (err) {
    logger.fatal({ err }, 'Database connection failed');
    process.exit(1);
  }
};

connectDB();

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => logger.info(`Server started on port ${PORT}`));
