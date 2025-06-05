// Global variables for forgot password functionality
window.currentForgotPasswordOtpId = null;
window.forgotPasswordEmail = '';

// Show forgot password modal
function showForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    const modalContent = document.getElementById('forgotPasswordModalContent');
    
    if (!modal) {
        createForgotPasswordModal();
        return;
    }
    
    // Show modal with fade-in animation
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Trigger scale-up animation
    setTimeout(() => {
        if (modalContent) {
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }
    }, 10);
    
    // Clear any existing messages and form
    hideForgotPasswordMessages();
    resetForgotPasswordForm();
    
    // Focus email input
    setTimeout(() => {
        const emailInput = document.getElementById('forgotPasswordEmail');
        if (emailInput) {
            emailInput.focus();
        }
    }, 200);
}

function closeForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    const modalContent = document.getElementById('forgotPasswordModalContent');
    
    if (modal && modalContent) {
        // Start closing animation
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 300);
    }
    
    // Reset form and clear data
    resetForgotPasswordForm();
    hideForgotPasswordMessages();
    window.currentForgotPasswordOtpId = null;
    window.forgotPasswordEmail = '';
}

// Create forgot password modal HTML
function createForgotPasswordModal() {
    const modalHTML = `
    <div id="forgotPasswordModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 transition-opacity duration-300">
        <div id="forgotPasswordModalContent" class="relative top-20 mx-auto p-6 border w-full max-w-md shadow-2xl rounded-xl bg-white transform transition-transform duration-300 scale-95">
            <!-- Close Button -->
            <button onclick="closeForgotPasswordModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>

            <!-- Modal Header -->
            <div class="text-center mb-6">
                <div class="mx-auto w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-4 4-4-4 1.257-1.257A6 6 0 1118 8zm-6-2a1 1 0 11-2 0 1 1 0 012 0z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Reset Password</h3>
                <p class="text-gray-600 text-sm">Enter your email to receive password reset instructions</p>
            </div>

            <!-- Error Message -->
            <div id="forgotPasswordErrorMessage" class="hidden mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
                <div class="flex items-center">
                    <svg class="w-4 h-4 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                    </svg>
                    <p class="text-sm font-medium text-red-800"></p>
                </div>
            </div>

            <!-- Success Message -->
            <div id="forgotPasswordSuccessMessage" class="hidden mb-4 rounded-lg bg-green-50 border border-green-200 p-3">
                <div class="flex items-center">
                    <svg class="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    <p class="text-sm font-medium text-green-800">Password reset instructions sent to your email!</p>
                </div>
            </div>

            <!-- Email Input Form -->
            <div id="forgotPasswordEmailForm" class="space-y-4">
                <div>
                    <label for="forgotPasswordEmail" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input type="email" id="forgotPasswordEmail" required
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors" 
                           placeholder="your.email@iskolarngbayan.pup.edu.ph">
                </div>
                
                <button id="sendResetInstructionsBtn" onclick="sendPasswordResetInstructions()" 
                        class="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <span id="sendResetButtonText">Confirm Email</span>
                    <svg id="sendResetSpinner" class="hidden animate-spin -mr-1 ml-2 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </button>
            </div>
            
            <!-- Help Text -->
            <div class="mt-6 bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div class="flex items-start">
                    <svg class="w-5 h-5 text-orange-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                    </svg>
                    <div>
                        <h4 class="text-sm font-medium text-orange-800 mb-2">What happens next:</h4>
                        <ul class="text-sm text-orange-700 space-y-1">
                            <li>• Check your email inbox and spam folder</li>
                            <li>• Click the reset link in the email</li>
                            <li>• Create a new secure password</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
    
    // Get references to the newly created elements
    const modal = document.getElementById('forgotPasswordModal');
    const modalContent = document.getElementById('forgotPasswordModalContent');
    
    // Show the modal with animation
    if (modalContent) {
        // Trigger scale-up animation after a brief delay
        setTimeout(() => {
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }, 10);
    }
    
    // Focus email input
    setTimeout(() => {
        const emailInput = document.getElementById('forgotPasswordEmail');
        if (emailInput) {
            emailInput.focus();
        }
    }, 100);
}

// Message functions
function showForgotPasswordError(message) {
    const errorMessage = document.getElementById('forgotPasswordErrorMessage');
    if (errorMessage) {
        const errorText = errorMessage.querySelector('p');
        if (errorText) {
            errorText.textContent = message;
        }
        errorMessage.classList.remove('hidden');
        
        setTimeout(() => {
            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
    
    // Hide success message
    const successMessage = document.getElementById('forgotPasswordSuccessMessage');
    if (successMessage) {
        successMessage.classList.add('hidden');
    }
}

function showForgotPasswordSuccess(message = 'Password reset instructions sent to your email!') {
    const successMessage = document.getElementById('forgotPasswordSuccessMessage');
    if (successMessage) {
        const successText = successMessage.querySelector('p');
        if (successText) {
            successText.textContent = message;
        }
        successMessage.classList.remove('hidden');
        
        setTimeout(() => {
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
    
    // Hide error message
    const errorMessage = document.getElementById('forgotPasswordErrorMessage');
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
}

function hideForgotPasswordMessages() {
    const errorMessage = document.getElementById('forgotPasswordErrorMessage');
    const successMessage = document.getElementById('forgotPasswordSuccessMessage');
    
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
    if (successMessage) {
        successMessage.classList.add('hidden');
    }
}

// Form functions
function resetForgotPasswordForm() {
    const emailInput = document.getElementById('forgotPasswordEmail');
    const sendBtn = document.getElementById('sendResetInstructionsBtn');
    const sendBtnText = document.getElementById('sendResetButtonText');
    const sendSpinner = document.getElementById('sendResetSpinner');
    
    if (emailInput) {
        emailInput.value = '';
    }
    
    if (sendBtn) {
        sendBtn.disabled = false;
    }
    
    if (sendBtnText) {
        sendBtnText.textContent = 'Send Reset Instructions';
    }
    
    if (sendSpinner) {
        sendSpinner.classList.add('hidden');
    }
}

function goBackToLogin() {
    closeForgotPasswordModal();
}

// API functions
async function validateForgotPasswordEmailWithAPI(email) {
    try {
        const apiUrl = '/Auth/ValidateForgotPasswordEmail';
        const token = document.querySelector('input[name="__RequestVerificationToken"]').value;
        
        const requestData = { email: email };
        
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "RequestVerificationToken": token
            },
            body: JSON.stringify(requestData)
        };

        const response = await fetch(apiUrl, requestOptions);
        
        if (!response.ok) {
            return { 
                success: false, 
                message: `Server Error ${response.status}: ${response.statusText}`,
                errors: [`Server Error ${response.status}`]
            };
        }

        const responseText = await response.text();
        
        // Handle non-JSON responses gracefully
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            return { 
                success: false, 
                message: "Invalid server response. Please try again.",
                errors: ["Invalid server response"]
            };
        }
        
        return {
            success: result.is_valid || false,
            message: result.message || '',
            errors: result.errors || []
        };
        
    } catch (error) {
        return { 
            success: false, 
            message: `Network Error: ${error.message}`,
            errors: [`Network Error: ${error.message}`]
        };
    }
}

async function sendPasswordResetOTPWithAPI(email) {
    try {
        const apiUrl = '/Auth/SendPasswordResetOTP';
        const token = document.querySelector('input[name="__RequestVerificationToken"]').value;
        
        const requestData = { email: email };
        
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "RequestVerificationToken": token
            },
            body: JSON.stringify(requestData)
        };

        const response = await fetch(apiUrl, requestOptions);
        const responseText = await response.text();
        
        // Handle non-JSON responses gracefully
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            return { 
                success: false, 
                message: "Invalid server response. Please try again.",
                otp_id: null
            };
        }
        
        return {
            success: result.success || false,
            message: result.message || '',
            otp_id: result.otp_id || null
        };
        
    } catch (error) {
        return { 
            success: false, 
            message: `Network Error: ${error.message}`,
            otp_id: null
        };
    }
}

// Main function to send password reset instructions
async function sendPasswordResetInstructions() {
    const emailInput = document.getElementById('forgotPasswordEmail');
    const sendBtn = document.getElementById('sendResetInstructionsBtn');
    const sendBtnText = document.getElementById('sendResetButtonText');
    const sendSpinner = document.getElementById('sendResetSpinner');
    
    if (!emailInput) return;
    
    const email = emailInput.value.trim();
    
    // Client-side validation
    if (!email) {
        showForgotPasswordError('Please enter your email address.');
        return;
    }
    
    // Basic email format validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        showForgotPasswordError('Please enter a valid email address.');
        return;
    }
    
    // Check PUP domain
    if (!email.endsWith('@iskolarngbayan.pup.edu.ph')) {
        showForgotPasswordError('Please use your PUP email address (@iskolarngbayan.pup.edu.ph).');
        return;
    }
    
    // Set loading state
    sendBtn.disabled = true;
    sendBtnText.textContent = 'Validating...';
    sendSpinner.classList.remove('hidden');
    hideForgotPasswordMessages();
    
    try {
        // Store email globally
        window.forgotPasswordEmail = email;
        
        // Validate email with API
        const validationResult = await validateForgotPasswordEmailWithAPI(email);
        
        if (validationResult.success) {
            // Email is valid - send reset instructions
            sendBtnText.textContent = 'Sending Instructions...';
            
            const resetResult = await sendPasswordResetOTPWithAPI(email);
            
            if (resetResult.success) {
                window.currentForgotPasswordOtpId = resetResult.otp_id;
                
                showForgotPasswordSuccess('Password reset instructions have been sent to your email!');
                
                // Hide form and show success state
                const emailForm = document.getElementById('forgotPasswordEmailForm');
                if (emailForm) {
                    emailForm.classList.add('hidden');
                }
                
                // Auto-close modal after 5 seconds
                setTimeout(() => {
                    closeForgotPasswordModal();
                }, 5000);
                
            } else {
                showForgotPasswordError(resetResult.message || 'Failed to send reset instructions. Please try again.');
            }
            
        } else {
            // Show validation errors
            const errorMessages = validationResult.errors && validationResult.errors.length > 0 
                ? validationResult.errors.join(' ') 
                : validationResult.message || 'Email validation failed.';
            
            showForgotPasswordError(errorMessages);
        }
        
    } catch (error) {
        showForgotPasswordError('Failed to process request. Please try again.');
        console.error('Forgot password error:', error);
    } finally {
        // Reset button state
        sendBtn.disabled = false;
        sendBtnText.textContent = 'Send Reset Instructions';
        sendSpinner.classList.add('hidden');
    }
}

// Make functions globally accessible
window.showForgotPasswordModal = showForgotPasswordModal;
window.closeForgotPasswordModal = closeForgotPasswordModal;
window.sendPasswordResetInstructions = sendPasswordResetInstructions;
window.goBackToLogin = goBackToLogin;
