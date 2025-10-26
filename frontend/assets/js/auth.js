/**
 * Authentication Module
 * Handles user authentication state and UI updates
 */

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
    this.initPromise = this.init();
  }

  /**
   * Initialize authentication state
   */
  async init() {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      await this.loadUserProfile();
    } else {
      this.updateUIForGuest();
    }
    this.isInitialized = true;
    return this;
  }

  /**
   * Wait for auth manager to be ready
   */
  async ready() {
    await this.initPromise;
    return this;
  }

  /**
   * Load user profile from API
   */
  async loadUserProfile() {
    try {
      const response = await apiClient.getUserProfile();
      if (response.success) {
        this.currentUser = response.data.user;
        this.updateUIForUser();
      } else {
        this.logout();
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      this.logout();
    }
  }

  /**
   * Update UI for authenticated user
   */
  updateUIForUser() {
    if (!this.currentUser) return;

    // Show user dropdown
    const userDropdown = document.getElementById('userDropdown');
    const authLinks = document.getElementById('authLinks');
    
    if (userDropdown) userDropdown.style.display = 'block';
    if (authLinks) authLinks.style.display = 'none';

    // Update user info
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userName) {
      userName.textContent = this.currentUser.username;
    }
    
    if (userAvatar) {
      // Check if user has a profile image
      if (this.currentUser.profileImgURL) {
        // Create an image element
        const img = document.createElement('img');
        img.src = this.currentUser.profileImgURL;
        img.alt = this.currentUser.username;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';
        img.onerror = () => {
          // If image fails to load, show initials instead
          userAvatar.textContent = this.currentUser.username.charAt(0).toUpperCase();
        };
        userAvatar.innerHTML = '';
        userAvatar.appendChild(img);
      } else {
        // Show initials if no profile image
        userAvatar.textContent = this.currentUser.username.charAt(0).toUpperCase();
      }
    }

    // Show authenticated links
    const addPostLink = document.getElementById('addPostLink');
    const mobileAddPostLink = document.getElementById('mobileAddPostLink');
    const mobileProfileLink = document.getElementById('mobileProfileLink');
    const mobileLogoutLink = document.getElementById('mobileLogoutLink');
    const mobileSignupLink = document.getElementById('mobileSignupLink');
    const mobileLoginLink = document.getElementById('mobileLoginLink');

    if (addPostLink) addPostLink.style.display = 'block';
    if (mobileAddPostLink) mobileAddPostLink.style.display = 'block';
    if (mobileProfileLink) mobileProfileLink.style.display = 'block';
    if (mobileLogoutLink) mobileLogoutLink.style.display = 'block';
    if (mobileSignupLink) mobileSignupLink.style.display = 'none';
    if (mobileLoginLink) mobileLoginLink.style.display = 'none';

    // Set up logout handlers
    this.setupLogoutHandlers();
  }

  /**
   * Update UI for guest user
   */
  updateUIForGuest() {
    // Hide user dropdown
    const userDropdown = document.getElementById('userDropdown');
    const authLinks = document.getElementById('authLinks');
    
    if (userDropdown) userDropdown.style.display = 'none';
    if (authLinks) authLinks.style.display = 'block';

    // Hide authenticated links
    const addPostLink = document.getElementById('addPostLink');
    const mobileAddPostLink = document.getElementById('mobileAddPostLink');
    const mobileProfileLink = document.getElementById('mobileProfileLink');
    const mobileLogoutLink = document.getElementById('mobileLogoutLink');
    const mobileSignupLink = document.getElementById('mobileSignupLink');
    const mobileLoginLink = document.getElementById('mobileLoginLink');

    if (addPostLink) addPostLink.style.display = 'none';
    if (mobileAddPostLink) mobileAddPostLink.style.display = 'none';
    if (mobileProfileLink) mobileProfileLink.style.display = 'none';
    if (mobileLogoutLink) mobileLogoutLink.style.display = 'none';
    if (mobileSignupLink) mobileSignupLink.style.display = 'block';
    if (mobileLoginLink) mobileLoginLink.style.display = 'block';
  }

  /**
   * Set up logout event handlers
   */
  setupLogoutHandlers() {
    const logoutLink = document.getElementById('logoutLink');
    const mobileLogoutLink = document.getElementById('mobileLogoutLink');

    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }

    if (mobileLogoutLink) {
      mobileLogoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.currentUser = null;
      this.updateUIForGuest();
      
      // Redirect to home page
      if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
        window.location.href = '/index.html';
      }
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Require authentication (redirect if not logged in)
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  }
}

// Create global auth manager instance
window.authManager = new AuthManager();
