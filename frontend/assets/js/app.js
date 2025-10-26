// =============================================================================
// DROPDOWN FUNCTIONALITY
// =============================================================================

function toggleDropdown(event) {
  if (event) event.stopPropagation();
  const dropdown = document.querySelector('.dropdown');
  const button = document.querySelector('.dropdown-toggle');
  if (!dropdown || !button) return;
  const isOpen = dropdown.classList.contains('open');
  dropdown.classList.toggle('open', !isOpen);
  button.setAttribute('aria-expanded', String(!isOpen));
}

// =============================================================================
// MOBILE MENU FUNCTIONALITY
// =============================================================================

function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  if (!mobileMenu || !hamburgerBtn) return;
  const isOpen = mobileMenu.classList.contains('show');
  mobileMenu.classList.toggle('show', !isOpen);
  mobileMenu.setAttribute('aria-hidden', String(isOpen));
  hamburgerBtn.setAttribute('aria-expanded', String(!isOpen));
}

// =============================================================================
// NAVIGATION UTILITIES
// =============================================================================

function setActiveNavLink() {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach((link) => {
    const linkPath = link.getAttribute('href');
    link.classList.toggle('active', linkPath === currentPath);
  });
}

// =============================================================================
// EVENT LISTENERS
// =============================================================================

function initializeEventListeners() {
  const dropdownToggleButton = document.querySelector('.dropdown-toggle');
  const dropdown = document.querySelector('.dropdown');
  const hamburgerButton = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (dropdownToggleButton) {
    dropdownToggleButton.addEventListener('click', (event) => toggleDropdown(event));
  }

  if (hamburgerButton) {
    hamburgerButton.addEventListener('click', () => toggleMobileMenu());
  }

  // Submit logout form when clicking styled anchor
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      const form = logoutLink.closest('form');
      if (form) form.submit();
    });
  }

  // Global click: close dropdown and mobile menu on outside click
  document.addEventListener('click', (event) => {
    if (dropdown && !dropdown.contains(event.target) && dropdown.classList.contains('open')) {
      dropdown.classList.remove('open');
      const button = document.querySelector('.dropdown-toggle');
      if (button) button.setAttribute('aria-expanded', 'false');
    }
    if (mobileMenu && !mobileMenu.contains(event.target) && !event.target.closest('#hamburgerBtn')) {
      if (mobileMenu.classList.contains('show')) {
        mobileMenu.classList.remove('show');
        mobileMenu.setAttribute('aria-hidden', 'true');
        if (hamburgerButton) hamburgerButton.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Escape key closes open menus
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (dropdown && dropdown.classList.contains('open')) {
      dropdown.classList.remove('open');
      const button = document.querySelector('.dropdown-toggle');
      if (button) button.setAttribute('aria-expanded', 'false');
    }
    if (mobileMenu && mobileMenu.classList.contains('show')) {
      mobileMenu.classList.remove('show');
      mobileMenu.setAttribute('aria-hidden', 'true');
      if (hamburgerButton) hamburgerButton.setAttribute('aria-expanded', 'false');
    }
  });
}

// =============================================================================
// SCROLL TO TOP FUNCTIONALITY
// =============================================================================

function initScrollToTop() {
  // Create scroll-to-top button if it doesn't exist
  let scrollBtn = document.querySelector('.scroll-to-top');
  if (!scrollBtn) {
    scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '↑';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    scrollBtn.title = 'Back to top';
    document.body.appendChild(scrollBtn);
  }

  // Show/hide button based on scroll position
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });

  // Scroll to top on click
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// =============================================================================
// PERFORMANCE OPTIMIZATIONS
// =============================================================================

// Lazy load images
function initLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener("DOMContentLoaded", () => {
  initializeEventListeners();
  setActiveNavLink();
  initScrollToTop();
  initLazyLoading();
});


