import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blogApp',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5242880,
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12
};
