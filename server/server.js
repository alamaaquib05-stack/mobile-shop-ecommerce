import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';
import validateEnv from './utils/validateEnv.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
validateEnv();

// Connect to database
connectDB();

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Made with Bob
