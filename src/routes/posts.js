/**
 * Post Routes
 * Handles blog post endpoints
 */

import express from 'express';
import PostController from '../controllers/PostController.js';
import { validatePostCreation } from '../middleware/validation.js';
import { uploadSingle, handleUploadError } from '../middleware/fileUpload.js';
import { apiAuth, optionalApiAuth } from '../middleware/apiAuth.js';

const router = express.Router();

// Public routes
router.get('/', optionalApiAuth, PostController.getPosts);
router.get('/:id', optionalApiAuth, PostController.getPost);

// Protected routes
router.post('/', apiAuth, uploadSingle, handleUploadError, validatePostCreation, PostController.createPost);
router.put('/:id', apiAuth, uploadSingle, handleUploadError, validatePostCreation, PostController.updatePost);
router.delete('/:id', apiAuth, PostController.deletePost);

// User posts
router.get('/user/:id', optionalApiAuth, PostController.getUserPosts);

export default router;
