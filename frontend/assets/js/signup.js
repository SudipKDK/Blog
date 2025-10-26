/**
 * Signup Page JavaScript
 * Handles user registration functionality
 */

class SignupPage {
  constructor() {
    this.init();
  }

  /**
   * Initialize the signup page
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
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSignup();
      });
    }

    // Password confirmation validation
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (password && confirmPassword) {
      confirmPassword.addEventListener('input', () => {
        this.validatePasswordMatch();
      });
    }
  }

  /**
   * Handle signup form submission
   */
  async handleSignup() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      this.showError('Please fill in all fields');
      return;
    }

    if (username.length < 3) {
      this.showError('Username must be at least 3 characters long');
      return;
    }

    if (password.length < 6) {
      this.showError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      this.showError('Passwords do not match');
      return;
    }

    this.showLoading(true);
    this.hideError();
    this.hideSuccess();

    try {
      const response = await apiClient.signup({
        username,
        email,
        password
      });

      if (response.success) {
        this.showSuccess('Account created successfully! Redirecting to login...');
        
        // Redirect to login page
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 2000);
      } else {
        this.showError(response.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      this.showError(error.message || 'Signup failed. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Validate password match
   */
  validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (confirmPassword && password !== confirmPassword) {
      this.showError('Passwords do not match');
    } else {
      this.hideError();
    }
  }

  /**
   * Show/hide loading spinner
   */
  showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const signupBtn = document.getElementById('signupBtn');
    
    if (loadingSpinner) {
      loadingSpinner.style.display = show ? 'block' : 'none';
    }
    
    if (signupBtn) {
      signupBtn.disabled = show;
      signupBtn.textContent = show ? 'Creating account...' : 'Create Account';
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

// Initialize signup page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SignupPage();
});
