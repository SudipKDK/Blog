import express from "express";
import Post from "../models/post.js";
import User from "../models/user.js";
import { validatePostCreation, validateUserRegistration, validateUserLogin } from "../middleware/validation.js";
import { uploadSingle, handleUploadError } from "../middleware/fileUpload.js";
import { apiAuth, optionalApiAuth } from "../middleware/apiAuth.js";

const router = express.Router();

// ============================================================================
// AUTHENTICATION API ROUTES
// ============================================================================

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/auth/signup', validateUserRegistration, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'User with this email already exists' 
      });
    }

    const user = await User.create({ username, email, password });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false,
      error: 'An error occurred during registration' 
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/auth/login', validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await User.matchPasswordAndGenerateToken(email, password);
    
    // Get user data
    const user = await User.findOne({ email }).select('-password');
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      success: false,
      error: 'Incorrect email or password' 
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ============================================================================
// POSTS API ROUTES
// ============================================================================

/**
 * GET /api/posts
 * Get all published posts with pagination and search
 */
router.get('/posts', optionalApiAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    
    let query = { published: true };
    
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
    
    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to load posts' 
    });
  }
});

/**
 * GET /api/posts/:id
 * Get a single post by ID
 */
router.get('/posts/:id', optionalApiAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profileImgURL')
      .lean();
    
    if (!post) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }
    
    // Increment view count
    await Post.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    post.viewCount += 1;
    
    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to load post' 
    });
  }
});

/**
 * POST /api/posts
 * Create a new post (requires authentication)
 */
router.post('/posts', apiAuth, uploadSingle, handleUploadError, validatePostCreation, async (req, res) => {
  try {
    const { title, body } = req.body;
    
    const postData = {
      title,
      body,
      author: req.user._id,
    };

    if (req.file) {
      postData.coverImageURL = `/uploads/${req.file.filename}`;
    }

    const post = await Post.create(postData);
    await post.populate('author', 'username profileImgURL');
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create post' 
    });
  }
});

/**
 * PUT /api/posts/:id
 * Update a post (requires authentication and ownership)
 */
router.put('/posts/:id', apiAuth, uploadSingle, handleUploadError, validatePostCreation, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        error: 'You can only edit your own posts' 
      });
    }

    const { title, body } = req.body;
    const updateData = { title, body };

    if (req.file) {
      updateData.coverImageURL = `/uploads/${req.file.filename}`;
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('author', 'username profileImgURL');
    
    res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post: updatedPost }
    });
  } catch (error) {
    console.error('Post update error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update post' 
    });
  }
});

/**
 * DELETE /api/posts/:id
 * Delete a post (requires authentication and ownership)
 */
router.delete('/posts/:id', apiAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        error: 'You can only delete your own posts' 
      });
    }

    await Post.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Post deletion error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete post' 
    });
  }
});

// ============================================================================
// USER PROFILE API ROUTES
// ============================================================================

/**
 * GET /api/user/profile
 * Get current user's profile and stats
 */
router.get('/user/profile', apiAuth, async (req, res) => {
  try {
    // Get user's posts
    const userPosts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Get total view count for user's posts
    const totalViews = await Post.aggregate([
      { $match: { author: req.user._id } },
      { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);
    
    const userStats = {
      postCount: userPosts.length,
      totalViews: totalViews[0]?.totalViews || 0
    };
    
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          role: req.user.role,
          profileImgURL: req.user.profileImgURL
        },
        posts: userPosts,
        stats: userStats
      }
    });
  } catch (error) {
    console.error('Error loading profile:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to load profile' 
    });
  }
});

export default router;
