/**
 * Toast Notification System
 * Elegant non-blocking notifications
 */

class Toast {
  constructor() {
    this.container = this.createContainer();
    document.body.appendChild(this.container);
  }

  createContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    return container;
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const colors = {
      success: { bg: '#10b981', border: '#059669' },
      error: { bg: '#ef4444', border: '#dc2626' },
      warning: { bg: '#f59e0b', border: '#d97706' },
      info: { bg: '#2563eb', border: '#1d4ed8' }
    };

    const color = colors[type] || colors.info;

    toast.style.cssText = `
      background: ${color.bg};
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      min-width: 300px;
      max-width: 500px;
      font-weight: 500;
      pointer-events: all;
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
      border-left: 4px solid ${color.border};
      display: flex;
      align-items: center;
      gap: 12px;
    `;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.innerHTML = `
      <span style="font-size: 20px; font-weight: 700;">${icons[type] || icons.info}</span>
      <span style="flex: 1;">${message}</span>
    `;

    toast.addEventListener('click', () => {
      this.remove(toast);
    });

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast);
      }, duration);
    }

    return toast;
  }

  remove(toast) {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }

  @media (max-width: 640px) {
    #toast-container {
      top: 10px;
      right: 10px;
      left: 10px;
    }

    .toast {
      min-width: auto !important;
      max-width: 100% !important;
    }
  }
`;
document.head.appendChild(style);

// Create global toast instance
window.toast = new Toast();

