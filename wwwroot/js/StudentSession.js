// Student session management and auto-logout functionality

class StudentSessionManager {
    constructor() {
        this.checkInterval = null;
        this.warningShown = false;
        this.autoLogoutTimer = null;
        
        // Check session every 5 minutes for 24-hour sessions
        this.startSessionMonitoring();
    }

    startSessionMonitoring() {
        this.checkInterval = setInterval(() => {
            this.checkSessionStatus();
        }, 300000); // Check every 5 minutes
    }

    async checkSessionStatus() {
        try {
            const response = await fetch('/Student/CheckSessionStatus', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!data.isAuthenticated || !data.isValid) {
                this.handleSessionExpired();
                return;
            }

            // Show warning if session is near expiry (1 hour or less)
            if (data.isNearExpiry && !this.warningShown) {
                this.showSessionWarning(data.hoursRemaining, data.minutesRemaining);
            }

            // Auto-logout if session expires
            if (data.secondsRemaining <= 0) {
                this.handleSessionExpired();
            }

        } catch (error) {
            console.error('Error checking session status:', error);
        }
    }

    showSessionWarning(hoursRemaining, minutesRemaining) {
        this.warningShown = true;
        
        let timeText = '';
        if (hoursRemaining > 0) {
            timeText = `${hoursRemaining} hour(s) and ${minutesRemaining % 60} minute(s)`;
        } else {
            timeText = `${minutesRemaining} minute(s)`;
        }
        
        const warning = document.createElement('div');
        warning.id = 'sessionWarning';
        warning.className = 'fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm';
        warning.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <div class="flex-1">
                    <p class="font-semibold">Session Expiring Soon</p>
                    <p class="text-sm">Your session will expire in ${timeText}. Please save your work.</p>
                </div>
            </div>
            <div class="mt-2 flex space-x-2">
                <button onclick="sessionManager.dismissWarning()" class="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400">
                    Dismiss
                </button>
            </div>
        `;

        document.body.appendChild(warning);

        // Auto-dismiss after 60 seconds
        setTimeout(() => {
            this.dismissWarning();
        }, 60000);
    }

    dismissWarning() {
        const warning = document.getElementById('sessionWarning');
        if (warning) {
            warning.remove();
        }
        this.warningShown = false; // Allow warning to show again later
    }

    handleSessionExpired() {
        // Clear monitoring
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        // Show expired message
        this.showSessionExpiredModal();
    }

    showSessionExpiredModal() {
        const modal = document.createElement('div');
        modal.id = 'sessionExpiredModal';
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="relative mx-auto p-8 border w-full max-w-md shadow-2xl rounded-xl bg-white">
                <div class="text-center">
                    <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-4">Session Expired</h3>
                    <p class="text-gray-600 mb-6">Your 24-hour session has expired for security reasons. Please log in again to continue.</p>
                    <button onclick="window.location.href='/Auth/Login'" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        Go to Login
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Auto-redirect after 15 seconds
        setTimeout(() => {
            window.location.href = '/Auth/Login';
        }, 15000);
    }

    showSuccessMessage(message) {
        this.showToast(message, 'success');
    }

    showErrorMessage(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm transition-all duration-300 ${
            type === 'success' ? 'bg-green-100 border border-green-400 text-green-800' :
            type === 'error' ? 'bg-red-100 border border-red-400 text-red-800' :
            'bg-blue-100 border border-blue-400 text-blue-800'
        }`;
        
        toast.innerHTML = `
            <div class="flex items-center">
                <span class="flex-1">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-gray-500 hover:text-gray-700">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        if (this.autoLogoutTimer) {
            clearTimeout(this.autoLogoutTimer);
        }
    }
}

// Initialize session manager when page loads
let sessionManager;
document.addEventListener('DOMContentLoaded', function() {
    sessionManager = new StudentSessionManager();
});

// Clean up when page unloads
window.addEventListener('beforeunload', function() {
    if (sessionManager) {
        sessionManager.destroy();
    }
});
