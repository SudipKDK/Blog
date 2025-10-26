/**
 * Add Post Page JavaScript
 * Handles creating new blog posts
 */

class AddPostPage {
  constructor() {
    this.init();
  }

  /**
   * Initialize the add post page
   */
  async init() {
    // Wait for auth manager to be ready
    await authManager.ready();
    
    // Check authentication
    if (!authManager.requireAuth()) {
      return;
    }

    this.setupEventListeners();
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    const postForm = document.getElementById('postForm');
    if (postForm) {
      postForm.addEventListener('submit', (e) => {
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
  }

  /**
   * Handle form submission
   */
  async handleSubmit() {
    const title = document.getElementById('title').value.trim();
    const body = document.getElementById('body').value.trim();
    const coverImage = document.getElementById('coverImage').files[0];

    // Validation
    if (!title || !body) {
      this.showError('Please fill in all required fields');
      return;
    }

    if (title.length > 100) {
      this.showError('Title must be 100 characters or less');
      return;
    }

    if (body.length < 50) {
      this.showError('Post content must be at least 50 characters long');
      return;
    }

    this.showLoading(true);
    this.hideError();
    this.hideSuccess();

    try {
      const postData = {
        title,
        body,
        coverImage
      };

      const response = await apiClient.createPost(postData);

      if (response.success) {
        this.showSuccess('Post created successfully! Redirecting...');
        
        // Redirect to the new post
        setTimeout(() => {
          window.location.href = `/post.html?id=${response.data.post._id}`;
        }, 1500);
      } else {
        this.showError(response.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Create post error:', error);
      this.showError(error.message || 'Failed to create post. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Handle cancel button
   */
  handleCancel() {
    if (confirm('Are you sure you want to cancel? Your changes will be lost.')) {
      window.location.href = '/index.html';
    }
  }

  /**
   * Update character count for title
   */
  updateCharacterCount() {
    const titleInput = document.getElementById('title');
    const titleLabel = document.querySelector('label[for="title"]');
    
    if (titleInput && titleLabel) {
      const count = titleInput.value.length;
      const maxLength = 100;
      
      if (count > maxLength * 0.9) {
        titleLabel.textContent = `Post Title (${count}/${maxLength})`;
        titleLabel.style.color = count > maxLength ? '#dc2626' : '#f59e0b';
      } else {
        titleLabel.textContent = 'Post Title';
        titleLabel.style.color = '';
      }
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
      submitBtn.textContent = show ? 'Creating post...' : 'Create Post';
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

// Initialize add post page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AddPostPage();
});
