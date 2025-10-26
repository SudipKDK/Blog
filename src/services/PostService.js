/**
 * Post Service
 * Handles blog post business logic
 */

import Post from '../models/post.js';
import { ApiError } from '../utils/ApiError.js';

class PostService {
  /**
   * Get all posts with pagination and search
   */
  static async getPosts({ page, limit, search }) {
    const skip = (page - 1) * limit;
    
    let query = { published: true };
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ];
    }
    
    const posts = await Post.find(query)
      .populate('author', 'username profileImgURL')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);
    
    return {
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Get single post by ID
   */
  static async getPost(id) {
    const post = await Post.findById(id)
      .populate('author', 'username profileImgURL')
      .lean();
    
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }
    
    // Increment view count
    await Post.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
    post.viewCount += 1;
    
    return { post };
  }

  /**
   * Create new post
   */
  static async createPost({ title, body, coverImage, author }) {
    const postData = {
      title,
      body,
      author,
    };

    if (coverImage) {
      postData.coverImageURL = `/uploads/${coverImage.filename}`;
    }

    const post = await Post.create(postData);
    await post.populate('author', 'username profileImgURL');
    
    return { post };
  }

  /**
   * Update post
   */
  static async updatePost(id, { title, body, coverImage, author }) {
    const post = await Post.findById(id);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    // Check ownership
    if (post.author.toString() !== author.toString()) {
      throw new ApiError(403, 'You can only edit your own posts');
    }

    const updateData = { title, body };

    if (coverImage) {
      updateData.coverImageURL = `/uploads/${coverImage.filename}`;
    }

    const updatedPost = await Post.findByIdAndUpdate(id, updateData, { new: true })
      .populate('author', 'username profileImgURL');
    
    return { post: updatedPost };
  }

  /**
   * Delete post
   */
  static async deletePost(id, authorId) {
    const post = await Post.findById(id);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    // Check ownership
    if (post.author.toString() !== authorId.toString()) {
      throw new ApiError(403, 'You can only delete your own posts');
    }

    await Post.findByIdAndDelete(id);
    return {};
  }

  /**
   * Get user's posts
   */
  static async getUserPosts(userId, { page, limit }) {
    const skip = (page - 1) * limit;
    
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalPosts = await Post.countDocuments({ author: userId });
    const totalPages = Math.ceil(totalPosts / limit);
    
    return {
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }
}

export default PostService;
