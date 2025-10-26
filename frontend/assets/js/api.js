/**
 * API Client Module
 * Handles all API communication with the backend
 */

class ApiClient {
  constructor() {
    this.baseURL = '/api';
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  /**
   * Get authentication headers
   */
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  /**
   * Authentication API calls
   */
  async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
      includeAuth: false,
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      includeAuth: false,
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });

    this.setToken(null);
    return response;
  }

  /**
   * Posts API calls
   */
  async getPosts(page = 1, limit = 6, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    return this.request(`/posts?${params}`);
  }

  async getPost(id) {
    return this.request(`/posts/${id}`);
  }

  async createPost(postData) {
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('body', postData.body);

    if (postData.coverImage) {
      formData.append('coverImage', postData.coverImage);
    }

    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}/posts`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }

  async updatePost(id, postData) {
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('body', postData.body);

    if (postData.coverImage) {
      formData.append('coverImage', postData.coverImage);
    }

    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}/posts/${id}`, {
      method: 'PUT',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }

  async deletePost(id) {
    return this.request(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * User profile API calls
   */
  async getUserProfile() {
    return this.request('/auth/profile');
  }
}

// Create global API client instance
window.apiClient = new ApiClient();
