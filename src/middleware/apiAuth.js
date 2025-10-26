import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { config } from '../config/config.js';

/**
 * API Authentication Middleware
 * Handles both cookie-based and Authorization header authentication
 */
export async function apiAuth(req, res, next) {
  try {
    let token = null;

    // Check for token in Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Fallback to cookie-based token
    if (!token) {
      token = req.cookies?.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded._id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token - user not found'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('API Auth error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
}

/**
 * Optional API Authentication Middleware
 * Similar to apiAuth but doesn't require authentication
 * Attaches user if token is valid, but continues if not
 */
export async function optionalApiAuth(req, res, next) {
  try {
    let token = null;

    // Check for token in Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Fallback to cookie-based token
    if (!token) {
      token = req.cookies?.token;
    }

    if (token) {
      try {
        // Verify JWT token
        const decoded = jwt.verify(token, config.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded._id).select('-password');
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we continue without user
        console.log('Optional auth: Invalid token, continuing without user');
      }
    }

    next();
  } catch (error) {
    console.error('Optional API Auth error:', error);
    next(); // Continue even if there's an error
  }
}
