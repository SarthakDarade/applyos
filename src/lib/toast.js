/**
 * Utility function to show toast notifications from anywhere in the app
 * Works by dispatching a custom event that the ToastProvider listens to
 */
export const showToast = (message, type = 'info') => {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message, type }
        }));
    }
};

/**
 * Convenience methods for different toast types
 */
export const toast = {
    success: (message) => showToast(message, 'success'),
    error: (message) => showToast(message, 'error'),
    info: (message) => showToast(message, 'info'),
};
