/**
 * Authentication Routes
 * Handles user authentication endpoints
 */

import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { validateUserRegistration, validateUserLogin } from '../middleware/validation.js';
import { apiAuth } from '../middleware/apiAuth.js';

const router = express.Router();

// Public routes
router.post('/signup', validateUserRegistration, AuthController.signup);
router.post('/login', validateUserLogin, AuthController.login);

// Protected routes
router.post('/logout', apiAuth, AuthController.logout);
router.get('/profile', apiAuth, AuthController.getProfile);

export default router;
