import logger from './logger.js';

/**
 * Validate required environment variables on startup
 * Crashes the application if any required variable is missing
 */
const validateEnv = () => {
  const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'SHOP_UPI_ID',
    'SHOP_UPI_NAME',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'FRONTEND_URL'
  ];

  const missingVars = [];

  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    logger.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      logger.error(`   - ${varName}`);
    });
    logger.error('\nPlease check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  // Validate JWT_SECRET length (should be at least 32 characters)
  if (process.env.JWT_SECRET.length < 32) {
    logger.error('❌ JWT_SECRET must be at least 32 characters long for security.');
    process.exit(1);
  }

  // Validate MongoDB URI format
  if (!process.env.MONGO_URI.startsWith('mongodb')) {
    logger.error('❌ MONGO_URI must be a valid MongoDB connection string.');
    process.exit(1);
  }

  // Validate Razorpay keys format
  if (!process.env.RAZORPAY_KEY_ID.startsWith('rzp_')) {
    logger.error('❌ RAZORPAY_KEY_ID must start with "rzp_"');
    process.exit(1);
  }

  logger.info('✅ All required environment variables are present and valid');
};

export default validateEnv;

// Made with Bob
