/**
 * Edit Post Page JavaScript
 * Handles editing existing blog posts
 */

class EditPostPage {
  constructor() {
    this.postId = null;
    this.currentPost = null;
    this.init();
  }

  /**
   * Initialize the edit post page
   */
  async init() {
    // Wait for auth manager to be ready
    await authManager.ready();
    
    // Check authentication
    if (!authManager.requireAuth()) {
      return;
    }

    // Get post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    this.postId = urlParams.get('id');

    if (!this.postId) {
      this.showError('No post ID provided');
      return;
    }

    await this.loadPost();
    this.setupEventListeners();
  }

  /**
   * Load post data from API
   */
  async loadPost() {
    this.showLoading(true);
    this.hideError();

    try {
      const response = await apiClient.getPost(this.postId);

      if (response.success && response.data.post) {
        this.currentPost = response.data.post;
        
        // Check if user is the author
        const currentUser = authManager.getCurrentUser();
        if (!currentUser || currentUser.id !== this.currentPost.author._id) {
          this.showError('You can only edit your own posts');
          setTimeout(() => {
            window.location.href = '/index.html';
          }, 2000);
          return;
        }

        this.populateForm();
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
   * Populate form with post data
   */
  populateForm() {
    const titleInput = document.getElementById('title');
    const bodyInput = document.getElementById('body');
    const editPostForm = document.getElementById('editPostForm');

    if (titleInput) {
      titleInput.value = this.currentPost.title;
      this.updateCharacterCount();
    }

    if (bodyInput) {
      bodyInput.value = this.currentPost.body;
      this.updateCharacterCount();
    }

    // Show current cover image if exists
    if (this.currentPost.coverImageURL) {
      const currentCover = document.getElementById('currentCover');
      const currentCoverImg = document.getElementById('currentCoverImg');
      if (currentCover && currentCoverImg) {
        currentCoverImg.src = this.currentPost.coverImageURL;
        currentCover.style.display = 'block';
      }
    }

    if (editPostForm) {
      editPostForm.style.display = 'block';
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    const editPostForm = document.getElementById('editPostForm');
    if (editPostForm) {
      editPostForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.handleCancel();
      });
    }

    // Character count for title
    const titleInput = document.getElementById('title');
    if (titleInput) {
      titleInput.addEventListener('input', () => {
        this.updateCharacterCount();
      });
    }

    // Character count for body
    const bodyInput = document.getElementById('body');
    if (bodyInput) {
      bodyInput.addEventListener('input', () => {
        this.updateCharacterCount();
      });
    }
  }

  /**
   * Handle form submission
   */
  async handleSubmit() {
    const title = document.getElementById('title').value.trim();
    const body = document.getElementById('body').value.trim();
    const coverImageInput = document.getElementById('coverImage');
    const coverImage = coverImageInput.files[0];

    // Validation
    if (!title || title.length < 5) {
      toast.error('Title must be at least 5 characters');
      return;
    }

    if (!body || body.length < 10) {
      toast.error('Content must be at least 10 characters');
      return;
    }

    // Validate file size if new image selected
    if (coverImage && coverImage.size > 5 * 1024 * 1024) {
      toast.error('Cover image must be less than 5MB');
      return;
    }

    this.showLoading(true);
    this.hideError();
    this.hideSuccess();

    try {
      const response = await apiClient.updatePost(this.postId, {
        title,
        body,
        coverImage
      });

      if (response.success) {
        toast.success('Post updated successfully!');
        this.showSuccess('Post updated successfully! Redirecting...');
        
        // Redirect to the post
        setTimeout(() => {
          window.location.href = `/post.html?id=${this.postId}`;
        }, 1500);
      } else {
        toast.error(response.error || 'Failed to update post');
        this.showError(response.error || 'Failed to update post');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update post. Please try again.');
      this.showError(error.message || 'Failed to update post. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Handle cancel button
   */
  handleCancel() {
    if (confirm('Are you sure you want to cancel? Your changes will be lost.')) {
      window.location.href = `/post.html?id=${this.postId}`;
    }
  }

  /**
   * Update character count for title and body
   */
  updateCharacterCount() {
    const titleInput = document.getElementById('title');
    const bodyInput = document.getElementById('body');
    const titleCount = document.getElementById('titleCount');
    const bodyCount = document.getElementById('bodyCount');

    if (titleInput && titleCount) {
      titleCount.textContent = titleInput.value.length;
    }

    if (bodyInput && bodyCount) {
      bodyCount.textContent = bodyInput.value.length;
    }
  }

  /**
   * Show/hide loading spinner
   */
  showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const submitBtn = document.getElementById('submitBtn');
    
    if (loadingSpinner) {
      loadingSpinner.style.display = show ? 'block' : 'none';
    }
    
    if (submitBtn) {
      submitBtn.disabled = show;
      submitBtn.textContent = show ? 'Updating...' : 'Update Post';
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

  /**
   * Show success message
   */
  showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    
    if (successMessage && successText) {
      successText.textContent = message;
      successMessage.style.display = 'block';
    }
  }

  /**
   * Hide success message
   */
  hideSuccess() {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
      successMessage.style.display = 'none';
    }
  }
}

// Initialize edit post page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new EditPostPage();
});

