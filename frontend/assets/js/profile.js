/**
 * Profile Page JavaScript
 * Handles user profile display
 */

class ProfilePage {
  constructor() {
    this.init();
  }

  /**
   * Initialize the profile page
   */
  async init() {
    // Wait for auth manager to be ready
    await authManager.ready();
    
    // Check authentication
    if (!authManager.requireAuth()) {
      return;
    }

    this.loadProfile();
  }

  /**
   * Load user profile from API
   */
  async loadProfile() {
    this.showLoading(true);
    this.hideError();

    try {
      const response = await apiClient.getUserProfile();

      if (response.success) {
        this.displayProfile(response.data);
      } else {
        this.showError('Failed to load profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      this.showError('Failed to load profile. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Display profile information
   */
  displayProfile(data) {
    const { user, posts, stats } = data;

    // Update profile header
    this.updateProfileHeader(user);
    
    // Update stats
    this.updateStats(stats);
    
    // Display posts
    this.displayPosts(posts);

    // Show all sections
    document.getElementById('profileHeader').style.display = 'flex';
    document.getElementById('profileStats').style.display = 'grid';
    document.getElementById('userPosts').style.display = 'block';
  }

  /**
   * Update profile header
   */
  updateProfileHeader(user) {
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileRole = document.getElementById('profileRole');
    const profileAvatar = document.getElementById('profileAvatar');

    if (profileName) profileName.textContent = user.username;
    if (profileEmail) profileEmail.textContent = user.email;
    if (profileRole) profileRole.textContent = user.role || 'Member';
    if (profileAvatar) {
      // Check if user has a profile image
      if (user.profileImgURL) {
        // Create an image element
        const img = document.createElement('img');
        img.src = user.profileImgURL;
        img.alt = user.username;
        img.onerror = () => {
          // If image fails to load, show initials instead
          profileAvatar.textContent = user.username.charAt(0).toUpperCase();
          profileAvatar.classList.add('avatar-placeholder');
        };
        profileAvatar.innerHTML = '';
        profileAvatar.appendChild(img);
      } else {
        // Show initials if no profile image
        profileAvatar.textContent = user.username.charAt(0).toUpperCase();
        profileAvatar.classList.add('avatar-placeholder');
      }
    }
  }

  /**
   * Update profile stats
   */
  updateStats(stats) {
    const postCount = document.getElementById('postCount');
    const totalViews = document.getElementById('totalViews');
    const memberSince = document.getElementById('memberSince');

    if (postCount) postCount.textContent = stats.postCount;
    if (totalViews) totalViews.textContent = stats.totalViews;
    if (memberSince) {
      // You might want to add createdAt to user data
      memberSince.textContent = 'Recently';
    }
  }

  /**
   * Display user posts
   */
  displayPosts(posts) {
    const postsGrid = document.getElementById('postsGrid');
    if (!postsGrid) return;

    if (posts.length === 0) {
      postsGrid.innerHTML = '<p class="no-posts-message">You haven\'t created any posts yet.</p>';
      return;
    }

    postsGrid.innerHTML = posts.map(post => this.createPostCard(post)).join('');
  }

  /**
   * Create HTML for a post card
   */
  createPostCard(post) {
    const postDate = new Date(post.createdAt).toLocaleDateString();
    const excerpt = this.truncateText(post.body, 100);
    const coverImage = post.coverImageURL ? 
      `<img src="${post.coverImageURL}" alt="${post.title}" loading="lazy">` : 
      '<div class="no-image">No Image</div>';

    return `
      <div class="post-card-small">
        <div class="post-image-small">
          ${coverImage}
        </div>
        <div class="post-content-small">
          <a href="/post.html?id=${post._id}" class="post-title-small">${post.title}</a>
          <div class="post-meta-small">
            <span class="post-date">${postDate}</span>
            <div class="view-count-small">
              <span>👁</span>
              <span>${post.viewCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Truncate text to specified length
   */
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

// Initialize profile page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProfilePage();
});
