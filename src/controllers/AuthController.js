/**
 * Authentication Controller
 * Handles user authentication operations
 */

import AuthService from '../services/AuthService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

class AuthController {
  /**
   * Register a new user
   */
  static signup = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    
    const result = await AuthService.signup({ username, email, password });
    
    res.status(201).json(
      new ApiResponse(201, result, 'User registered successfully')
    );
  });

  /**
   * Login user
   */
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const result = await AuthService.login({ email, password });
    
    res.json(
      new ApiResponse(200, result, 'Login successful')
    );
  });

  /**
   * Logout user
   */
  static logout = asyncHandler(async (req, res) => {
    await AuthService.logout(req.user);
    
    res.json(
      new ApiResponse(200, {}, 'Logout successful')
    );
  });

  /**
   * Get current user profile
   */
  static getProfile = asyncHandler(async (req, res) => {
    const result = await AuthService.getProfile(req.user);
    
    res.json(
      new ApiResponse(200, result, 'Profile retrieved successfully')
    );
  });
}

export default AuthController;
