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
    // DON'T clear the email when closing - keep it for OTP modal
    // window.forgotPasswordEmail = '';
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
                    <span id="sendResetButtonText">Send Reset Instructions</span>
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

// API function to verify password reset OTP
async function verifyPasswordResetOTPWithAPI(otpId, otpCode) {
    try {
        const apiUrl = '/Auth/VerifyPasswordResetOTP';
        const token = document.querySelector('input[name="__RequestVerificationToken"]').value;
        
        const requestData = {
            otp_id: otpId,
            otp_code: otpCode
        };
        
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
                reset_token: null
            };
        }
        
        return {
            success: result.success || false,
            message: result.message || 'Verification failed',
            reset_token: result.reset_token || null
        };
        
    } catch (error) {
        return { 
            success: false, 
            message: "Network error. Please check your connection and try again.",
            reset_token: null
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
            // Email is valid - send reset OTP
            sendBtnText.textContent = 'Sending Reset Code...';
            
            const resetResult = await sendPasswordResetOTPWithAPI(email);
            
            if (resetResult.success) {
                window.currentForgotPasswordOtpId = resetResult.otp_id;
                
                // Close this modal and show OTP modal
                closeForgotPasswordModal();
                
                // Show OTP modal after a brief delay
                setTimeout(() => {
                    showPasswordResetOTPModal();
                }, 300);
                
            } else {
                showForgotPasswordError(resetResult.message || 'Failed to send reset code. Please try again.');
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

// Show password reset OTP modal
function showPasswordResetOTPModal() {
    const modal = document.getElementById('passwordResetOTPModal');
    const modalContent = document.getElementById('passwordResetOTPModalContent');
    
    if (!modal) {
        createPasswordResetOTPModal();
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
    hidePasswordResetOTPMessages();
    resetPasswordResetOTPForm();
    
    // Focus first OTP input
    setTimeout(() => {
        const firstInput = document.getElementById('passwordResetOtpInput1');
        if (firstInput) {
            firstInput.focus();
        }
    }, 200);
    
    // Setup OTP inputs
    setupPasswordResetOTPInputs();
}

function closePasswordResetOTPModal() {
    const modal = document.getElementById('passwordResetOTPModal');
    const modalContent = document.getElementById('passwordResetOTPModalContent');
    
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
    resetPasswordResetOTPForm();
    hidePasswordResetOTPMessages();
    window.currentForgotPasswordOtpId = null;
    // Clear email only when completely done with password reset flow
    window.forgotPasswordEmail = '';
}

// Create password reset OTP modal HTML
function createPasswordResetOTPModal() {
    const modalHTML = `
    <div id="passwordResetOTPModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 transition-opacity duration-300">
        <div id="passwordResetOTPModalContent" class="relative top-20 mx-auto p-8 border w-full max-w-md shadow-2xl rounded-xl bg-white transform transition-transform duration-300 scale-95">
            <!-- Modal Header -->
            <div class="text-center mb-8">
                <div class="mx-auto w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mb-6">
                    <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-3">Reset Password Verification</h3>
                <p class="text-gray-600 text-base">
                    Enter the 6-digit verification code sent to your email
                </p>
                <p class="text-gray-500 text-sm mt-2">
                    ${window.forgotPasswordEmail}
                </p>
            </div>

            <!-- Error Message -->
            <div id="passwordResetOTPErrorMessage" class="hidden mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                    </svg>
                    <p class="text-base font-medium text-red-800"></p>
                </div>
            </div>

            <!-- Success Message -->
            <div id="passwordResetOTPSuccessMessage" class="hidden mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    <p class="text-base font-medium text-green-800">Password reset successful! You can now login with your new password.</p>
                </div>
            </div>

            <!-- Resend Success Message -->
            <div id="passwordResetOTPResendSuccessMessage" class="hidden mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4 animate-pulse">
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    <p class="text-base font-medium text-blue-800">New verification code sent successfully!</p>
                </div>
            </div>

            <!-- OTP Input Section -->
            <div class="mb-8">
                <label class="block text-base font-medium text-gray-700 mb-4 text-center">
                    Enter Verification Code
                </label>
                
                <!-- OTP Input Fields -->
                <div class="flex justify-center space-x-3 mb-6">
                    <input type="text" id="passwordResetOtpInput1" maxlength="1" autocomplete="off" inputmode="numeric" 
                           class="w-12 h-12 text-center border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xl font-semibold" />
                    <input type="text" id="passwordResetOtpInput2" maxlength="1" autocomplete="off" inputmode="numeric"
                           class="w-12 h-12 text-center border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xl font-semibold" />
                    <input type="text" id="passwordResetOtpInput3" maxlength="1" autocomplete="off" inputmode="numeric"
                           class="w-12 h-12 text-center border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xl font-semibold" />
                    <input type="text" id="passwordResetOtpInput4" maxlength="1" autocomplete="off" inputmode="numeric"
                           class="w-12 h-12 text-center border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xl font-semibold" />
                    <input type="text" id="passwordResetOtpInput5" maxlength="1" autocomplete="off" inputmode="numeric"
                           class="w-12 h-12 text-center border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xl font-semibold" />
                    <input type="text" id="passwordResetOtpInput6" maxlength="1" autocomplete="off" inputmode="numeric"
                           class="w-12 h-12 text-center border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-xl font-semibold" />
                </div>
                
                <!-- Resend OTP -->
                <div class="text-center">
                    <button id="resendPasswordResetOtpBtn" onclick="resendPasswordResetOTP()" class="text-orange-600 hover:text-orange-700 text-base font-medium underline transition-colors disabled:text-gray-400 disabled:line-through disabled:no-underline disabled:cursor-not-allowed">
                        Resend Code
                    </button>
                </div>
            </div>

            <!-- Modal Buttons -->
            <div class="flex space-x-4">
                <button onclick="closePasswordResetOTPModal()" class="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors font-medium text-base">
                    Cancel
                </button>
                <button id="verifyPasswordResetOtpBtn" onclick="verifyPasswordResetOTP()" disabled 
                        class="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed">
                    <span id="verifyPasswordResetButtonText">Verify & Reset</span>
                    <svg id="verifyPasswordResetSpinner" class="hidden animate-spin -mr-1 ml-2 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </button>
            </div>
            
            <!-- Important Notes -->
            <div class="mt-6 bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div class="flex items-start">
                    <svg class="w-5 h-5 text-orange-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                    </svg>
                    <div>
                        <h4 class="text-sm font-medium text-orange-800 mb-2">Important:</h4>
                        <ul class="text-sm text-orange-700 space-y-1">
                            <li>• Check your email inbox and spam folder</li>
                            <li>• Code expires in 10 minutes</li>
                            <li>• You'll be prompted to set a new password</li>
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
    const modal = document.getElementById('passwordResetOTPModal');
    const modalContent = document.getElementById('passwordResetOTPModalContent');
    
    // Show the modal with animation
    if (modalContent) {
        // Trigger scale-up animation after a brief delay
        setTimeout(() => {
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }, 10);
    }
    
    // Focus first input
    setTimeout(() => {
        const firstInput = document.getElementById('passwordResetOtpInput1');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
    
    // Setup OTP inputs
    setupPasswordResetOTPInputs();
}

// Message functions for password reset OTP
function showPasswordResetOTPError(message) {
    const errorMessage = document.getElementById('passwordResetOTPErrorMessage');
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
    
    // Hide other messages
    const successMessage = document.getElementById('passwordResetOTPSuccessMessage');
    const resendMessage = document.getElementById('passwordResetOTPResendSuccessMessage');
    if (successMessage) successMessage.classList.add('hidden');
    if (resendMessage) resendMessage.classList.add('hidden');
}

function showPasswordResetOTPSuccess(message = 'Password reset successful!') {
    const successMessage = document.getElementById('passwordResetOTPSuccessMessage');
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
    
    // Hide other messages
    const errorMessage = document.getElementById('passwordResetOTPErrorMessage');
    const resendMessage = document.getElementById('passwordResetOTPResendSuccessMessage');
    if (errorMessage) errorMessage.classList.add('hidden');
    if (resendMessage) resendMessage.classList.add('hidden');
}

function showPasswordResetOTPResendSuccess(message = 'New verification code sent successfully!') {
    const resendMessage = document.getElementById('passwordResetOTPResendSuccessMessage');
    if (resendMessage) {
        const resendText = resendMessage.querySelector('p');
        if (resendText) {
            resendText.textContent = message;
        }
        resendMessage.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            resendMessage.classList.add('hidden');
        }, 5000);
    }
    
    // Hide error message
    const errorMessage = document.getElementById('passwordResetOTPErrorMessage');
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
}

function hidePasswordResetOTPMessages() {
    const errorMessage = document.getElementById('passwordResetOTPErrorMessage');
    const successMessage = document.getElementById('passwordResetOTPSuccessMessage');
    const resendMessage = document.getElementById('passwordResetOTPResendSuccessMessage');
    
    if (errorMessage) errorMessage.classList.add('hidden');
    if (successMessage) successMessage.classList.add('hidden');
    if (resendMessage) resendMessage.classList.add('hidden');
}

// Form functions for password reset OTP
function resetPasswordResetOTPForm() {
    // Clear OTP inputs
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`passwordResetOtpInput${i}`);
        if (input) {
            input.value = '';
            input.classList.remove('border-red-400');
        }
    }
    
    // Reset verify button
    const verifyBtn = document.getElementById('verifyPasswordResetOtpBtn');
    const verifyBtnText = document.getElementById('verifyPasswordResetButtonText');
    const verifySpinner = document.getElementById('verifyPasswordResetSpinner');
    
    if (verifyBtn) verifyBtn.disabled = true;
    if (verifyBtnText) verifyBtnText.textContent = 'Verify & Reset';
    if (verifySpinner) verifySpinner.classList.add('hidden');
    
    // Reset resend button
    const resendBtn = document.getElementById('resendPasswordResetOtpBtn');
    if (resendBtn) {
        resendBtn.textContent = 'Resend Code';
        resendBtn.disabled = false;
        resendBtn.classList.remove('line-through', 'no-underline', 'text-gray-400', 'cursor-not-allowed');
        resendBtn.classList.add('text-orange-600', 'hover:text-orange-700', 'underline');
    }
}

// Setup OTP inputs for password reset
function setupPasswordResetOTPInputs() {
    const otpInputs = [];
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`passwordResetOtpInput${i}`);
        if (input) {
            otpInputs.push(input);
        }
    }
    
    if (otpInputs.length !== 6) return;
    
    function checkOTPComplete() {
        const otpValue = otpInputs.map(input => input.value).join('');
        const verifyBtn = document.getElementById('verifyPasswordResetOtpBtn');
        if (verifyBtn) {
            verifyBtn.disabled = otpValue.length !== 6;
        }
    }
    
    otpInputs.forEach((input, index) => {
        // Clear any existing listeners
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        otpInputs[index] = newInput;
        
        newInput.addEventListener('input', function(e) {
            const value = e.target.value.replace(/[^0-9]/g, '');
            e.target.value = value;
            
            if (value && index < 5) {
                otpInputs[index + 1].focus();
            }
            
            checkOTPComplete();
        });
        
        newInput.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpInputs[index - 1].focus();
            } else if (e.key === 'ArrowLeft' && index > 0) {
                otpInputs[index - 1].focus();
            } else if (e.key === 'ArrowRight' && index < 5) {
                otpInputs[index + 1].focus();
            }
        });
        
        newInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
            
            if (pastedData.length === 6) {
                for (let i = 0; i < 6; i++) {
                    if (otpInputs[i]) {
                        otpInputs[i].value = pastedData[i] || '';
                    }
                }
                checkOTPComplete();
            }
        });
    });
}

// Verify password reset OTP
async function verifyPasswordResetOTP() {
    const otpInputs = [];
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`passwordResetOtpInput${i}`);
        if (input) {
            otpInputs.push(input);
        }
    }
    
    const otpCode = otpInputs.map(input => input.value).join('');
    
    if (otpCode.length !== 6) {
        showPasswordResetOTPError('Please enter the complete 6-digit verification code.');
        return;
    }
    
    if (!window.currentForgotPasswordOtpId) {
        showPasswordResetOTPError('OTP session expired. Please try again.');
        return;
    }
    
    // Set loading state
    const verifyBtn = document.getElementById('verifyPasswordResetOtpBtn');
    const verifyBtnText = document.getElementById('verifyPasswordResetButtonText');
    const verifySpinner = document.getElementById('verifyPasswordResetSpinner');
    
    verifyBtn.disabled = true;
    verifyBtnText.textContent = 'Verifying...';
    verifySpinner.classList.remove('hidden');
    hidePasswordResetOTPMessages();
    
    // Add subtle loading effect to OTP inputs
    otpInputs.forEach(input => {
        input.disabled = true;
        input.classList.add('processing-glow');
    });
    
    try {
        // Call the actual API endpoint
        const result = await verifyPasswordResetOTPWithAPI(window.currentForgotPasswordOtpId, otpCode);
        
        if (result.success) {
            // Success flow - keep existing timing
            verifyBtnText.textContent = 'Verified!';
            verifyBtn.classList.remove('bg-orange-600', 'hover:bg-orange-700');
            verifyBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            
            showPasswordResetOTPSuccess('Verification successful! Set your new password...');
            
            // Store session information for new password modal
            window.currentPasswordResetSessionId = result.reset_token;
            window.newPasswordEmail = window.forgotPasswordEmail;
            
            // Close OTP modal and show new password modal
            setTimeout(() => {
                closePasswordResetOTPModal();
                
                // Show new password modal after a brief delay
                setTimeout(() => {
                    showNewPasswordModal();
                }, 300);
            }, 1500);
        } else {
            // Enhanced failure flow with better UX
            
            // Add minimum delay for better perceived performance (feels more secure)
            const minDelay = 1200; // 1.2 seconds minimum processing time
            const startTime = Date.now();
            
            await new Promise(resolve => {
                const elapsed = Date.now() - startTime;
                const remainingDelay = Math.max(0, minDelay - elapsed);
                setTimeout(resolve, remainingDelay);
            });
            
            // Show error state on button first
            verifyBtnText.textContent = 'Verification Failed';
            verifyBtn.classList.remove('bg-orange-600', 'hover:bg-orange-700');
            verifyBtn.classList.add('bg-red-600', 'hover:bg-red-700');
            
            // Show error with slight delay for better visual flow
            setTimeout(() => {
                showPasswordResetOTPError(result.message || 'Invalid verification code. Please check your code and try again.');
                
                // Add red border animation to inputs
                otpInputs.forEach((input, index) => {
                    setTimeout(() => {
                        input.classList.add('border-red-400', 'animate-pulse');
                        input.style.borderColor = '#f87171';
                        
                        // Shake animation effect
                        input.style.animation = 'shake 0.5s ease-in-out';
                    }, index * 50); // Staggered animation
                });
                
                // Reset inputs with staggered clear animation
                setTimeout(() => {
                    otpInputs.forEach((input, index) => {
                        setTimeout(() => {
                            input.value = '';
                            input.style.transform = 'scale(0.95)';
                            
                            setTimeout(() => {
                                input.style.transform = 'scale(1)';
                            }, 100);
                        }, index * 80);
                    });
                }, 600);
                
                // Clean up styling and reset button after error display
                setTimeout(() => {
                    // Remove error styling from inputs
                    otpInputs.forEach(input => {
                        input.disabled = false;
                        input.classList.remove('border-red-400', 'animate-pulse', 'processing-glow');
                        input.style.borderColor = '';
                        input.style.animation = '';
                        input.style.transform = '';
                    });
                    
                    // Reset button state
                    verifyBtn.disabled = false;
                    verifyBtnText.textContent = 'Verify & Reset';
                    verifySpinner.classList.add('hidden');
                    verifyBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
                    verifyBtn.classList.add('bg-orange-600', 'hover:bg-orange-700');
                    
                    // Focus first input for retry with subtle highlight
                    const firstInput = otpInputs[0];
                    if (firstInput) {
                        firstInput.focus();
                        firstInput.style.boxShadow = '0 0 0 2px rgba(251, 146, 60, 0.3)';
                        
                        // Remove highlight after a moment
                        setTimeout(() => {
                            firstInput.style.boxShadow = '';
                        }, 1000);
                    }
                }, 1500);
                
            }, 300);
        }
        
    } catch (error) {
        // Network error handling with enhanced UX
        const minDelay = 1000;
        const startTime = Date.now();
        
        await new Promise(resolve => {
            const elapsed = Date.now() - startTime;
            const remainingDelay = Math.max(0, minDelay - elapsed);
            setTimeout(resolve, remainingDelay);
        });
        
        verifyBtnText.textContent = 'Connection Error';
        verifyBtn.classList.remove('bg-orange-600', 'hover:bg-orange-700');
        verifyBtn.classList.add('bg-red-600', 'hover:bg-red-700');
        
        setTimeout(() => {
            showPasswordResetOTPError('Verification failed due to a network error. Please check your connection and try again.');
            
            // Reset everything after network error
            setTimeout(() => {
                otpInputs.forEach(input => {
                    input.disabled = false;
                    input.classList.remove('processing-glow');
                    input.value = '';
                });
                
                verifyBtn.disabled = false;
                verifyBtnText.textContent = 'Verify & Reset';
                verifySpinner.classList.add('hidden');
                verifyBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
                verifyBtn.classList.add('bg-orange-600', 'hover:bg-orange-700');
                
                otpInputs[0]?.focus();
            }, 1000);
        }, 400);
        
        console.error('Password reset OTP verification error:', error);
    }
}

// Resend password reset OTP
async function resendPasswordResetOTP() {
    if (!window.forgotPasswordEmail) {
        showPasswordResetOTPError('Session expired. Please try again.');
        return;
    }
    
    const resendBtn = document.getElementById('resendPasswordResetOtpBtn');
    
    // Set loading state
    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';
    resendBtn.classList.add('text-gray-400', 'cursor-not-allowed');
    resendBtn.classList.remove('text-orange-600', 'hover:text-orange-700', 'underline');
    
    try {
        // Reuse the same SendPasswordResetOTP endpoint
        const result = await sendPasswordResetOTPWithAPI(window.forgotPasswordEmail);
        
        if (result.success) {
            window.currentForgotPasswordOtpId = result.otp_id;
            showPasswordResetOTPResendSuccess();
            
            // Clear OTP inputs
            for (let i = 1; i <= 6; i++) {
                const input = document.getElementById(`passwordResetOtpInput${i}`);
                if (input) {
                    input.value = '';
                }
            }
            
            // Focus first input
            const firstInput = document.getElementById('passwordResetOtpInput1');
            if (firstInput) {
                firstInput.focus();
            }
            
            // Start 5-minute cooldown with strikethrough
            startPasswordResetResendCooldown(300); // 5 minutes = 300 seconds
        } else {
            showPasswordResetOTPError(result.message || 'Failed to resend verification code.');
            resetPasswordResetResendButton();
        }
        
    } catch (error) {
        showPasswordResetOTPError('Failed to resend verification code.');
        resetPasswordResetResendButton();
    }
}

// Timer functions for password reset
function startPasswordResetResendCooldown(seconds) {
    const resendBtn = document.getElementById('resendPasswordResetOtpBtn');
    let timeLeft = seconds;
    
    // Apply strikethrough styling
    resendBtn.disabled = true;
    resendBtn.classList.add('strikethrough-animate', 'active', 'text-gray-400', 'cursor-not-allowed', 'no-underline');
    resendBtn.classList.remove('text-orange-600', 'hover:text-orange-700', 'underline');
    
    const countdown = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        resendBtn.textContent = `Resend Code (${timeString})`;
        
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(countdown);
            resetPasswordResetResendButton();
        }
    }, 1000);
}

function resetPasswordResetResendButton() {
    const resendBtn = document.getElementById('resendPasswordResetOtpBtn');
    
    if (resendBtn) {
        resendBtn.textContent = 'Resend Code';
        resendBtn.disabled = false;
        resendBtn.classList.remove('strikethrough-animate', 'active', 'text-gray-400', 'cursor-not-allowed', 'no-underline');
        resendBtn.classList.add('text-orange-600', 'hover:text-orange-700', 'underline');
    }
}

// Make new functions globally accessible
window.showPasswordResetOTPModal = showPasswordResetOTPModal;
window.closePasswordResetOTPModal = closePasswordResetOTPModal;
window.verifyPasswordResetOTP = verifyPasswordResetOTP;
window.resendPasswordResetOTP = resendPasswordResetOTP;

// Make functions globally accessible
window.showForgotPasswordModal = showForgotPasswordModal;
window.closeForgotPasswordModal = closeForgotPasswordModal;
window.sendPasswordResetInstructions = sendPasswordResetInstructions;
window.goBackToLogin = goBackToLogin;
