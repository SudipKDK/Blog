/**
 * Authentication Service
 * Handles authentication business logic
 */

import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/config.js';
import { ApiError } from '../utils/ApiError.js';

class AuthService {
  /**
   * Register a new user
   */
  static async signup({ username, email, password }) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
    });

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImgURL: user.profileImgURL
      }
    };
  }

  /**
   * Login user and generate token
   */
  static async login({ email, password }) {
    // Find user and verify password
    const token = await User.matchPasswordAndGenerateToken(email, password);
    
    // Get user data
    const user = await User.findOne({ email }).select('-password');
    
    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImgURL: user.profileImgURL
      }
    };
  }

  /**
   * Logout user (client-side token removal)
   */
  static async logout(user) {
    // In a more complex system, you might want to blacklist the token
    // For now, we rely on client-side token removal
    return {};
  }

  /**
   * Get user profile with stats
   */
  static async getProfile(user) {
    const Post = (await import('../models/post.js')).default;
    
    // Get user's posts
    const userPosts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Get total view count for user's posts
    const totalViews = await Post.aggregate([
      { $match: { author: user._id } },
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);
    
    const userStats = {
      postCount: userPosts.length,
      totalViews: totalViews[0]?.totalViews || 0
    };
    
    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImgURL: user.profileImgURL
      },
      posts: userPosts,
      stats: userStats
    };
  }
}

export default AuthService;
