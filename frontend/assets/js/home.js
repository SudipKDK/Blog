/**
 * Home Page JavaScript
 * Handles the main blog listing page
 */

class HomePage {
  constructor() {
    this.currentPage = 1;
    this.currentSearch = '';
    this.postsPerPage = 6;
    this.init();
  }

  /**
   * Initialize the home page
   */
  init() {
    this.setupEventListeners();
    this.loadPosts();
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Search form
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSearch();
      });
    }

    // Clear search
    const clearSearch = document.getElementById('clearSearch');
    if (clearSearch) {
      clearSearch.addEventListener('click', (e) => {
        e.preventDefault();
        this.clearSearch();
      });
    }

    // Pagination
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');

    if (prevPage) {
      prevPage.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.loadPosts();
        }
      });
    }

    if (nextPage) {
      nextPage.addEventListener('click', () => {
        this.currentPage++;
        this.loadPosts();
      });
    }
  }

  /**
   * Handle search form submission
   */
  handleSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      this.currentSearch = searchInput.value.trim();
      this.currentPage = 1;
      this.loadPosts();
    }
  }

  /**
   * Clear search
   */
  clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = '';
    }
    this.currentSearch = '';
    this.currentPage = 1;
    this.loadPosts();
  }

  /**
   * Load posts from API
   */
  async loadPosts() {
    this.showLoading(true);
    this.hideError();
    this.hideNoPosts();

    try {
      const response = await apiClient.getPosts(
        this.currentPage,
        this.postsPerPage,
        this.currentSearch
      );

      if (response.success) {
        this.displayPosts(response.data.posts);
        this.updatePagination(response.data.pagination);
        this.updateSearchUI();
      } else {
        this.showError('Failed to load posts');
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      this.showError('Failed to load posts. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Display posts in the grid
   */
  displayPosts(posts) {
    const postsGrid = document.getElementById('postsGrid');
    if (!postsGrid) return;

    if (posts.length === 0) {
      this.showNoPosts();
      return;
    }

    postsGrid.innerHTML = posts.map(post => this.createPostCard(post)).join('');
  }

  /**
   * Create HTML for a post card
   */
  createPostCard(post) {
    const postDate = new Date(post.createdAt).toLocaleDateString();
    const excerpt = this.truncateText(post.body, 150);
    const coverImage = post.coverImageURL ? 
      `<img src="${post.coverImageURL}" alt="${post.title}" loading="lazy">` : 
      '<div class="no-image">No Image</div>';

    return `
      <div class="post-card card">
        <div class="post-image">
          ${coverImage}
        </div>
        <div class="post-content">
          <a href="/post.html?id=${post._id}" class="post-title">${post.title}</a>
          <p class="post-excerpt">${excerpt}</p>
          <div class="post-meta">
            <div class="author-info">
              <img src="${post.author.profileImgURL || '/images/default_pfp.png'}" 
                   alt="${post.author.username}" 
                   class="author-avatar">
              <span class="author-name">${post.author.username}</span>
            </div>
            <div class="post-date">${postDate}</div>
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
   * Update pagination UI
   */
  updatePagination(pagination) {
    const paginationEl = document.getElementById('pagination');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const paginationInfo = document.getElementById('paginationInfo');

    if (!paginationEl) return;

    if (pagination.totalPages <= 1) {
      paginationEl.style.display = 'none';
      return;
    }

    paginationEl.style.display = 'flex';

    if (prevPage) {
      prevPage.disabled = !pagination.hasPrevPage;
    }

    if (nextPage) {
      nextPage.disabled = !pagination.hasNextPage;
    }

    if (paginationInfo) {
      paginationInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;
    }
  }

  /**
   * Update search UI
   */
  updateSearchUI() {
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');

    if (searchInput) {
      searchInput.value = this.currentSearch;
    }

    if (clearSearch) {
      clearSearch.style.display = this.currentSearch ? 'block' : 'none';
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
    if (errorMessage) {
      errorMessage.style.display = 'block';
      errorMessage.querySelector('p').textContent = message;
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
   * Show no posts message
   */
  showNoPosts() {
    const noPostsMessage = document.getElementById('noPostsMessage');
    if (noPostsMessage) {
      noPostsMessage.style.display = 'block';
    }
  }

  /**
   * Hide no posts message
   */
  hideNoPosts() {
    const noPostsMessage = document.getElementById('noPostsMessage');
    if (noPostsMessage) {
      noPostsMessage.style.display = 'none';
    }
  }
}

// Initialize home page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new HomePage();
});
