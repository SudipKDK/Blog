/**
 * Post Page JavaScript
 * Handles displaying individual blog post
 */

class PostPage {
  constructor() {
    this.postId = null;
    this.post = null;
    this.init();
  }

  /**
   * Initialize the post page
   */
  async init() {
    // Wait for auth manager to be ready
    await authManager.ready();
    
    // Get post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    this.postId = urlParams.get('id');

    if (!this.postId) {
      this.showError('No post ID provided');
      return;
    }

    this.loadPost();
    this.setupEventListeners();
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    const editBtn = document.getElementById('editPostBtn');
    const deleteBtn = document.getElementById('deletePostBtn');

    if (editBtn) {
      editBtn.addEventListener('click', () => this.handleEdit());
    }

    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.handleDelete());
    }
  }

  /**
   * Load post from API
   */
  async loadPost() {
    this.showLoading(true);
    this.hideError();

    try {
      const response = await apiClient.getPost(this.postId);

      if (response.success && response.data.post) {
        this.post = response.data.post;
        this.displayPost();
      } else {
        this.showError('Failed to load post');
      }
    } catch (error) {
      console.error('Error loading post:', error);
      this.showError('Post not found or failed to load');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Display post content
   */
  displayPost() {
    const post = this.post;

    // Update document title
    document.title = `${post.title} - MyBlog`;

    // Display title
    const titleEl = document.getElementById('postTitle');
    if (titleEl) {
      titleEl.textContent = post.title;
    }

    // Display author info
    const authorNameEl = document.getElementById('authorName');
    const authorAvatarEl = document.getElementById('authorAvatar');
    
    if (authorNameEl && post.author) {
      authorNameEl.textContent = post.author.username;
    }
    
    if (authorAvatarEl && post.author) {
      authorAvatarEl.src = post.author.profileImgURL || '/images/default_pfp.png';
      authorAvatarEl.alt = post.author.username;
    }

    // Display date
    const postDateEl = document.getElementById('postDate');
    if (postDateEl) {
      const date = new Date(post.createdAt);
      postDateEl.textContent = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    // Display view count
    const viewCountEl = document.getElementById('viewCount');
    if (viewCountEl) {
      viewCountEl.textContent = post.viewCount || 0;
    }

    // Display cover image if exists
    if (post.coverImageURL) {
      const coverContainer = document.getElementById('postCoverContainer');
      const coverImg = document.getElementById('postCover');
      if (coverContainer && coverImg) {
        coverImg.src = post.coverImageURL;
        coverImg.alt = post.title;
        coverContainer.style.display = 'block';
      }
    }

    // Display post body
    const postBodyEl = document.getElementById('postBody');
    if (postBodyEl) {
      // Convert line breaks to paragraphs for better readability
      const formattedBody = post.body
        .split('\n\n')
        .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
        .join('');
      postBodyEl.innerHTML = formattedBody;
    }

    // Show edit/delete buttons if user is the author
    const currentUser = authManager.getCurrentUser();
    if (currentUser && post.author && currentUser.id === post.author._id) {
      const postActions = document.getElementById('postActions');
      if (postActions) {
        postActions.style.display = 'flex';
      }
    }

    // Show post content
    const postContent = document.getElementById('postContent');
    if (postContent) {
      postContent.style.display = 'block';
    }
  }

  /**
   * Handle edit button click
   */
  handleEdit() {
    // Redirect to edit page (you'll need to create edit-post.html)
    window.location.href = `/edit-post.html?id=${this.postId}`;
  }

  /**
   * Handle delete button click
   */
  async handleDelete() {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiClient.deletePost(this.postId);

      if (response.success) {
        toast.success('Post deleted successfully');
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1000);
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post. Please try again.');
    }
  }

  /**
   * Show/hide loading spinner
   */
  showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
      loadingSpinner.style.display = show ? 'block' : 'none';
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    if (errorMessage && errorText) {
      errorText.textContent = message;
      errorMessage.style.display = 'block';
    }

    const postContent = document.getElementById('postContent');
    if (postContent) {
      postContent.style.display = 'none';
    }
  }

  /**
   * Hide error message
   */
  hideError() {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
      errorMessage.style.display = 'none';
    }
  }
}

// Initialize post page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PostPage();
});

