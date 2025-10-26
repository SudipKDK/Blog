/**
 * Post Controller
 * Handles blog post operations
 */

import PostService from '../services/PostService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

class PostController {
  /**
   * Get all posts with pagination and search
   */
  static getPosts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 6, search = '' } = req.query;
    
    const result = await PostService.getPosts({
      page: parseInt(page),
      limit: parseInt(limit),
      search: search.trim()
    });
    
    res.json(
      new ApiResponse(200, result, 'Posts retrieved successfully')
    );
  });

  /**
   * Get single post by ID
   */
  static getPost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const result = await PostService.getPost(id);
    
    res.json(
      new ApiResponse(200, result, 'Post retrieved successfully')
    );
  });

  /**
   * Create new post
   */
  static createPost = asyncHandler(async (req, res) => {
    const { title, body } = req.body;
    const coverImage = req.file;
    
    const result = await PostService.createPost({
      title,
      body,
      coverImage,
      author: req.user._id
    });
    
    res.status(201).json(
      new ApiResponse(201, result, 'Post created successfully')
    );
  });

  /**
   * Update post
   */
  static updatePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, body } = req.body;
    const coverImage = req.file;
    
    const result = await PostService.updatePost(id, {
      title,
      body,
      coverImage,
      author: req.user._id
    });
    
    res.json(
      new ApiResponse(200, result, 'Post updated successfully')
    );
  });

  /**
   * Delete post
   */
  static deletePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    await PostService.deletePost(id, req.user._id);
    
    res.json(
      new ApiResponse(200, {}, 'Post deleted successfully')
    );
  });

  /**
   * Get user's posts
   */
  static getUserPosts = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await PostService.getUserPosts(id, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.json(
      new ApiResponse(200, result, 'User posts retrieved successfully')
    );
  });
}

export default PostController;
