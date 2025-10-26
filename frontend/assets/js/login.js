/**
 * Login Page JavaScript
 * Handles user login functionality
 */

class LoginPage {
  constructor() {
    this.init();
  }

  /**
   * Initialize the login page
   */
  async init() {
    // Wait for auth manager to be ready
    await authManager.ready();
    
    this.setupEventListeners();
    
    // Redirect if already logged in
    if (authManager.isAuthenticated()) {
      window.location.href = '/index.html';
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }
  }

  /**
   * Handle login form submission
   */
  async handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      this.showError('Please fill in all fields');
      return;
    }

    this.showLoading(true);
    this.hideError();
    this.hideSuccess();

    try {
      const response = await apiClient.login({ email, password });

      if (response.success) {
        this.showSuccess('Login successful! Redirecting...');
        
        // Update auth manager
        await authManager.loadUserProfile();
        
        // Redirect to home page
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1000);
      } else {
        this.showError(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showError(error.message || 'Login failed. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Show/hide loading spinner
   */
  showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const loginBtn = document.getElementById('loginBtn');
    
    if (loadingSpinner) {
      loadingSpinner.style.display = show ? 'block' : 'none';
    }
    
    if (loginBtn) {
      loginBtn.disabled = show;
      loginBtn.textContent = show ? 'Logging in...' : 'Login';
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

// Initialize login page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LoginPage();
});
