// Global variables for new password functionality
window.currentPasswordResetSessionId = null;
window.newPasswordEmail = '';

// Show new password modal
function showNewPasswordModal() {
    const modal = document.getElementById('newPasswordModal');
    const modalContent = document.getElementById('newPasswordModalContent');
    
    if (!modal) {
        createNewPasswordModal();
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
    hideNewPasswordMessages();
    resetNewPasswordForm();
    
    // Focus new password input
    setTimeout(() => {
        const newPasswordInput = document.getElementById('newPassword');
        if (newPasswordInput) {
            newPasswordInput.focus();
        }
    }, 200);
}

function closeNewPasswordModal() {
    const modal = document.getElementById('newPasswordModal');
    const modalContent = document.getElementById('newPasswordModalContent');
    
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
    resetNewPasswordForm();
    hideNewPasswordMessages();
    window.currentPasswordResetSessionId = null;
    window.newPasswordEmail = '';
}

// Create new password modal HTML
function createNewPasswordModal() {
    const modalHTML = `
    <div id="newPasswordModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 transition-opacity duration-300">
        <div id="newPasswordModalContent" class="relative top-20 mx-auto p-8 border w-full max-w-md shadow-2xl rounded-xl bg-white transform transition-transform duration-300 scale-95">
            <!-- Modal Header -->
            <div class="text-center mb-8">
                <div class="mx-auto w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-6">
                    <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-3">Set New Password</h3>
                <p class="text-gray-600 text-base">
                    Create a strong password for your account
                </p>
                <p class="text-gray-500 text-sm mt-2">
                    ${window.newPasswordEmail || window.forgotPasswordEmail}
                </p>
            </div>

            <!-- Error Message -->
            <div id="newPasswordErrorMessage" class="hidden mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                    </svg>
                    <p class="text-base font-medium text-red-800"></p>
                </div>
            </div>

            <!-- Success Message -->
            <div id="newPasswordSuccessMessage" class="hidden mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    <p class="text-base font-medium text-green-800">Password updated successfully! You can now login with your new password.</p>
                </div>
            </div>

            <!-- New Password Form -->
            <div id="newPasswordForm" class="space-y-6">
                <div>
                    <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div class="relative">
                        <input type="password" id="newPassword" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors pr-10" 
                               placeholder="Enter your new password">
                        <button type="button" onclick="toggleNewPassword()" class="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                    </div>
                    <!-- Password strength indicator -->
                    <div class="mt-2">
                        <div class="flex space-x-1">
                            <div id="strength-bar-1" class="h-1 flex-1 bg-gray-200 rounded"></div>
                            <div id="strength-bar-2" class="h-1 flex-1 bg-gray-200 rounded"></div>
                            <div id="strength-bar-3" class="h-1 flex-1 bg-gray-200 rounded"></div>
                            <div id="strength-bar-4" class="h-1 flex-1 bg-gray-200 rounded"></div>
                        </div>
                        <p id="strength-text" class="text-xs text-gray-500 mt-1">Password strength</p>
                    </div>
                </div>
                
                <div>
                    <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <div class="relative">
                        <input type="password" id="confirmNewPassword" required
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors pr-10" 
                               placeholder="Confirm your new password">
                        <button type="button" onclick="toggleConfirmNewPassword()" class="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Modal Buttons -->
            <div class="flex space-x-4 mt-8">
                <button onclick="closeNewPasswordModal()" class="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors font-medium text-base">
                    Cancel
                </button>
                <button id="updatePasswordBtn" onclick="updatePassword()" disabled 
                        class="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed">
                    <span id="updatePasswordButtonText">Update Password</span>
                    <svg id="updatePasswordSpinner" class="hidden animate-spin -mr-1 ml-2 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </button>
            </div>
            
            <!-- Password Requirements -->
            <div class="mt-6 bg-green-50 rounded-lg p-4 border border-green-200">
                <div class="flex items-start">
                    <svg class="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                    </svg>
                    <div>
                        <h4 class="text-sm font-medium text-green-800 mb-2">Password Requirements:</h4>
                        <ul class="text-sm text-green-700 space-y-1">
                            <li id="req-length" class="flex items-center">
                                <span class="w-4 h-4 mr-2">•</span>
                                At least 6 characters long
                            </li>
                            <li id="req-uppercase" class="flex items-center">
                                <span class="w-4 h-4 mr-2">•</span>
                                One uppercase letter (A-Z)
                            </li>
                            <li id="req-lowercase" class="flex items-center">
                                <span class="w-4 h-4 mr-2">•</span>
                                One lowercase letter (a-z)
                            </li>
                            <li id="req-number" class="flex items-center">
                                <span class="w-4 h-4 mr-2">•</span>
                                One number (0-9)
                            </li>
                            <li id="req-special" class="flex items-center">
                                <span class="w-4 h-4 mr-2">•</span>
                                One special character (!@#$%^&*)
                            </li>
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
    const modal = document.getElementById('newPasswordModal');
    const modalContent = document.getElementById('newPasswordModalContent');
    
    // Show the modal with animation
    if (modalContent) {
        // Trigger scale-up animation after a brief delay
        setTimeout(() => {
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }, 10);
    }
    
    // Focus new password input
    setTimeout(() => {
        const newPasswordInput = document.getElementById('newPassword');
        if (newPasswordInput) {
            newPasswordInput.focus();
        }
    }, 100);
    
    // Setup password validation
    setupPasswordValidation();
}

// Password toggle functions
function toggleNewPassword() {
    const passwordField = document.getElementById('newPassword');
    const type = passwordField.type === 'password' ? 'text' : 'password';
    passwordField.type = type;
}

function toggleConfirmNewPassword() {
    const passwordField = document.getElementById('confirmNewPassword');
    const type = passwordField.type === 'password' ? 'text' : 'password';
    passwordField.type = type;
}

// Message functions for new password
function showNewPasswordError(message) {
    const errorMessage = document.getElementById('newPasswordErrorMessage');
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
    const successMessage = document.getElementById('newPasswordSuccessMessage');
    if (successMessage) successMessage.classList.add('hidden');
}

function showNewPasswordSuccess(message = 'Password updated successfully!') {
    const successMessage = document.getElementById('newPasswordSuccessMessage');
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
    const errorMessage = document.getElementById('newPasswordErrorMessage');
    if (errorMessage) errorMessage.classList.add('hidden');
}

function hideNewPasswordMessages() {
    const errorMessage = document.getElementById('newPasswordErrorMessage');
    const successMessage = document.getElementById('newPasswordSuccessMessage');
    
    if (errorMessage) errorMessage.classList.add('hidden');
    if (successMessage) successMessage.classList.add('hidden');
}

// Form functions for new password
function resetNewPasswordForm() {
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmNewPassword');
    const updateBtn = document.getElementById('updatePasswordBtn');
    const updateBtnText = document.getElementById('updatePasswordButtonText');
    const updateSpinner = document.getElementById('updatePasswordSpinner');
    
    if (newPasswordInput) {
        newPasswordInput.value = '';
        newPasswordInput.type = 'password';
    }
    if (confirmPasswordInput) {
        confirmPasswordInput.value = '';
        confirmPasswordInput.type = 'password';
    }
    
    if (updateBtn) updateBtn.disabled = true;
    if (updateBtnText) updateBtnText.textContent = 'Update Password';
    if (updateSpinner) updateSpinner.classList.add('hidden');
    
    // Reset password strength indicators
    resetPasswordStrength();
    resetPasswordRequirements();
}

// Password validation and strength checking
function setupPasswordValidation() {
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmNewPassword');
    const updateBtn = document.getElementById('updatePasswordBtn');
    
    if (!newPasswordInput || !confirmPasswordInput || !updateBtn) return;
    
    function validateForm() {
        const password = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        const isPasswordValid = validatePassword(password);
        const passwordsMatch = password === confirmPassword && password.length > 0;
        
        updateBtn.disabled = !(isPasswordValid && passwordsMatch);
        
        // Update confirm password field styling
        if (confirmPassword.length > 0) {
            if (passwordsMatch) {
                confirmPasswordInput.classList.remove('border-red-400');
                confirmPasswordInput.classList.add('border-green-400');
            } else {
                confirmPasswordInput.classList.remove('border-green-400');
                confirmPasswordInput.classList.add('border-red-400');
            }
        } else {
            confirmPasswordInput.classList.remove('border-red-400', 'border-green-400');
        }
    }
    
    newPasswordInput.addEventListener('input', function() {
        updatePasswordStrength(this.value);
        updatePasswordRequirements(this.value);
        validateForm();
    });
    
    confirmPasswordInput.addEventListener('input', validateForm);
}

function validatePassword(password) {
    const minLength = password.length >= 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    
    return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
}

function updatePasswordStrength(password) {
    const strengthBars = ['strength-bar-1', 'strength-bar-2', 'strength-bar-3', 'strength-bar-4'];
    const strengthText = document.getElementById('strength-text');
    
    // Reset all bars
    strengthBars.forEach(id => {
        const bar = document.getElementById(id);
        if (bar) {
            bar.className = 'h-1 flex-1 bg-gray-200 rounded';
        }
    });
    
    if (password.length === 0) {
        if (strengthText) strengthText.textContent = 'Password strength';
        return;
    }
    
    let score = 0;
    let strengthLabel = '';
    let colorClass = '';
    
    // Calculate strength score
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;
    
    // Determine strength level and colors
    if (score <= 1) {
        strengthLabel = 'Very Weak';
        colorClass = 'bg-red-500';
    } else if (score === 2) {
        strengthLabel = 'Weak';
        colorClass = 'bg-red-400';
    } else if (score === 3) {
        strengthLabel = 'Fair';
        colorClass = 'bg-yellow-400';
    } else if (score === 4) {
        strengthLabel = 'Good';
        colorClass = 'bg-green-400';
    } else {
        strengthLabel = 'Strong';
        colorClass = 'bg-green-500';
    }
    
    // Update strength bars
    for (let i = 0; i < Math.min(score, 4); i++) {
        const bar = document.getElementById(strengthBars[i]);
        if (bar) {
            bar.className = `h-1 flex-1 ${colorClass} rounded`;
        }
    }
    
    // Update strength text
    if (strengthText) {
        strengthText.textContent = `Password strength: ${strengthLabel}`;
        strengthText.className = `text-xs mt-1 ${
            score <= 1 ? 'text-red-600' : 
            score === 2 ? 'text-red-500' :
            score === 3 ? 'text-yellow-600' :
            'text-green-600'
        }`;
    }
}

function updatePasswordRequirements(password) {
    const requirements = [
        { id: 'req-length', test: password.length >= 6 },
        { id: 'req-uppercase', test: /[A-Z]/.test(password) },
        { id: 'req-lowercase', test: /[a-z]/.test(password) },
        { id: 'req-number', test: /[0-9]/.test(password) },
        { id: 'req-special', test: /[!@#$%^&*]/.test(password) }
    ];
    
    requirements.forEach(req => {
        const element = document.getElementById(req.id);
        if (element) {
            const icon = element.querySelector('span');
            if (req.test) {
                element.classList.remove('text-green-700');
                element.classList.add('text-green-800');
                if (icon) icon.innerHTML = '✓';
            } else {
                element.classList.remove('text-green-800');
                element.classList.add('text-green-700');
                if (icon) icon.innerHTML = '•';
            }
        }
    });
}

function resetPasswordStrength() {
    const strengthBars = ['strength-bar-1', 'strength-bar-2', 'strength-bar-3', 'strength-bar-4'];
    const strengthText = document.getElementById('strength-text');
    
    strengthBars.forEach(id => {
        const bar = document.getElementById(id);
        if (bar) {
            bar.className = 'h-1 flex-1 bg-gray-200 rounded';
        }
    });
    
    if (strengthText) {
        strengthText.textContent = 'Password strength';
        strengthText.className = 'text-xs text-gray-500 mt-1';
    }
}

function resetPasswordRequirements() {
    const requirementIds = ['req-length', 'req-uppercase', 'req-lowercase', 'req-number', 'req-special'];
    
    requirementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.remove('text-green-800');
            element.classList.add('text-green-700');
            const icon = element.querySelector('span');
            if (icon) icon.innerHTML = '•';
        }
    });
}

// API function to reset password with token
async function resetPasswordWithAPI(resetToken, newPassword) {
    try {
        const apiUrl = '/Auth/ResetPassword';
        const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value || '';
        
        const requestData = {
            reset_token: resetToken,
            new_password: newPassword
        };
        
        console.log('=== RESET PASSWORD DEBUG ===');
        console.log('Reset token:', resetToken);
        console.log('New password length:', newPassword.length);
        console.log('============================');
        
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
            console.error('Failed to parse API response:', responseText);
            return { 
                success: false, 
                message: "Invalid server response. Please try again."
            };
        }
        
        return {
            success: result.success || false,
            message: result.message || 'Password reset failed'
        };
        
    } catch (error) {
        console.error('Reset password API error:', error);
        return { 
            success: false, 
            message: "Network error. Please check your connection and try again."
        };
    }
}

// Update password function
async function updatePassword() {
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmNewPassword');
    
    if (!newPasswordInput || !confirmPasswordInput) return;
    
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Client-side validation
    if (!newPassword || !confirmPassword) {
        showNewPasswordError('Please fill in all password fields.');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNewPasswordError('Passwords do not match. Please try again.');
        return;
    }
    
    if (!validatePassword(newPassword)) {
        showNewPasswordError('Password does not meet the requirements. Please check the requirements below.');
        return;
    }
    
    // Check if we have the reset token
    if (!window.currentPasswordResetSessionId) {
        showNewPasswordError('Password reset session expired. Please start the process again.');
        setTimeout(() => {
            closeNewPasswordModal();
            setTimeout(() => {
                if (typeof window.showForgotPasswordModal === 'function') {
                    window.showForgotPasswordModal();
                } else {
                    window.location.href = '/Auth/Login';
                }
            }, 300);
        }, 2000);
        return;
    }
    
    // Set loading state
    const updateBtn = document.getElementById('updatePasswordBtn');
    const updateBtnText = document.getElementById('updatePasswordButtonText');
    const updateSpinner = document.getElementById('updatePasswordSpinner');
    
    updateBtn.disabled = true;
    updateBtnText.textContent = 'Updating...';
    updateSpinner.classList.remove('hidden');
    hideNewPasswordMessages();
    
    // Add loading effect to inputs
    newPasswordInput.disabled = true;
    confirmPasswordInput.disabled = true;
    newPasswordInput.classList.add('processing-glow');
    confirmPasswordInput.classList.add('processing-glow');
    
    try {
        // Call the API to reset password
        const result = await resetPasswordWithAPI(window.currentPasswordResetSessionId, newPassword);
        
        if (result.success) {
            // Enhanced success flow
            
            // Step 1: Input success animation
            setTimeout(() => {
                newPasswordInput.classList.remove('processing-glow');
                confirmPasswordInput.classList.remove('processing-glow');
                newPasswordInput.classList.add('border-green-400', 'bg-green-50');
                confirmPasswordInput.classList.add('border-green-400', 'bg-green-50');
                newPasswordInput.style.borderColor = '#34d399';
                confirmPasswordInput.style.borderColor = '#34d399';
                newPasswordInput.style.backgroundColor = '#f0fdf4';
                confirmPasswordInput.style.backgroundColor = '#f0fdf4';
            }, 300);
            
            // Step 2: Button success animation
            setTimeout(() => {
                updateBtnText.textContent = 'Updated!';
                updateSpinner.classList.add('hidden');
                updateBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
                updateBtn.classList.add('bg-green-500', 'hover:bg-green-600');
                
                // Add success icon to button
                const successIcon = document.createElement('span');
                successIcon.innerHTML = '✓';
                successIcon.style.cssText = `
                    display: inline-block;
                    margin-left: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    animation: bounceIn 0.6s ease-out;
                `;
                updateBtnText.appendChild(successIcon);
                
                // Button pulse effect
                updateBtn.style.animation = 'successPulse 0.8s ease-out';
            }, 600);
            
            // Step 3: Success message with confetti
            setTimeout(() => {
                showNewPasswordSuccess(result.message || 'Password updated successfully! You can now login with your new password.');
                
                // Add confetti effect
                if (typeof createSuccessParticles === 'function') {
                    createSuccessParticles();
                }
            }, 900);
            
            // Step 4: Redirect to login
            setTimeout(() => {
                closeNewPasswordModal();
                
                // Clear all password reset data
                window.currentPasswordResetSessionId = null;
                window.newPasswordEmail = '';
                window.currentForgotPasswordOtpId = null;
                window.forgotPasswordEmail = '';
                
                // Show success message in a modal and redirect to login, with a slight delay and animations
                setTimeout(() => {
                    const modal = document.createElement('div');
                    modal.id = 'passwordSuccessModal';
                    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fadeIn';
                    modal.innerHTML = `
                        <div id="successModalContent" class="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center scale-90 opacity-0 transition-all duration-400 relative">
                            <!-- Close Icon -->
                            <button id="successModalClose" aria-label="Close" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none focus:outline-none">
                                &times;
                            </button>
                            <div class="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-green-100 rounded-full animate-bounceIn">
                                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-2 animate-fadeInDown">Password Updated!</h3>
                            <p class="text-gray-600 mb-6 animate-fadeInDown" style="animation-delay:0.1s;">Your password was updated successfully. Please login with your new password.</p>
                        </div>
                    `;
                    document.body.appendChild(modal);
                    document.body.style.overflow = 'hidden';

                    // Animate modal content in
                    setTimeout(() => {
                        const content = document.getElementById('successModalContent');
                        if (content) {
                            content.classList.remove('scale-90', 'opacity-0');
                            content.classList.add('scale-100', 'opacity-100');
                        }
                    }, 10);

                    // Function to close modal and redirect
                    function closeSuccessModal() {
                        const content = document.getElementById('successModalContent');
                        if (content) {
                            content.classList.remove('scale-100', 'opacity-100');
                            content.classList.add('scale-90', 'opacity-0');
                        }
                        setTimeout(() => {
                            if (modal.parentNode) modal.parentNode.removeChild(modal);
                            document.body.style.overflow = 'auto';
                            if (typeof window.showLogin === 'function') {
                                window.showLogin();
                            } else {
                                window.location.href = '/Auth/Login';
                            }
                        }, 350);
                    }

                    // Close on close icon click
                    document.getElementById('successModalClose').onclick = closeSuccessModal;

                    // Auto-close after 3.5 seconds
                    setTimeout(closeSuccessModal, 3500);

                }, 400); // 400ms delay before showing the modal

                // Add keyframes for custom animations if not already present
                if (!document.getElementById('success-modal-animations')) {
                    const style = document.createElement('style');
                    style.id = 'success-modal-animations';
                    style.innerHTML = `
                        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px);} to { opacity: 1; transform: translateY(0);} }
                        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }
                        @keyframes bounceIn {
                            0% { transform: scale(0.7); opacity: 0; }
                            60% { transform: scale(1.05); opacity: 1; }
                            80% { transform: scale(0.95);}
                            100% { transform: scale(1);}
                        }
                        .animate-fadeIn { animation: fadeIn 0.4s both; }
                        .animate-fadeInDown { animation: fadeInDown 0.5s both; }
                        .animate-fadeInUp { animation: fadeInUp 0.5s both; }
                        .animate-bounceIn { animation: bounceIn 0.7s both; }
                        .scale-90 { transform: scale(0.9); }
                        .scale-100 { transform: scale(1); }
                        .opacity-0 { opacity: 0; }
                        .opacity-100 { opacity: 1; }
                        .transition-all { transition: all 0.4s cubic-bezier(.4,0,.2,1); }
                        .duration-400 { transition-duration: 0.4s; }
                    `;
                    document.head.appendChild(style);
                }
                
                // If we're in the auth layout, switch to login tab
                if (typeof window.showLogin === 'function') {
                    window.showLogin();
                } else {
                    // Fallback: redirect to login page
                    window.location.href = '/Auth/Login';
                }
            }, 2500);
            
        } else {
            // Handle API errors
            const errorMessage = result.message || 'Failed to update password. Please try again.';
            
            // Different styling based on error type
            if (errorMessage.includes('expired') || errorMessage.includes('session')) {
                updateBtnText.textContent = 'Session Expired';
                updateBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
                updateBtn.classList.add('bg-yellow-600', 'hover:bg-yellow-700');
            } else if (errorMessage.includes('validation') || errorMessage.includes('requirements')) {
                updateBtnText.textContent = 'Invalid Password';
                updateBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
                updateBtn.classList.add('bg-orange-600', 'hover:bg-orange-700');
            } else {
                updateBtnText.textContent = 'Update Failed';
                updateBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
                updateBtn.classList.add('bg-red-600', 'hover:bg-red-700');
            }
            
            setTimeout(() => {
                showNewPasswordError(errorMessage);
                
                // Reset form state after error
                setTimeout(() => {
                    newPasswordInput.disabled = false;
                    confirmPasswordInput.disabled = false;
                    newPasswordInput.classList.remove('processing-glow', 'border-green-400', 'bg-green-50');
                    confirmPasswordInput.classList.remove('processing-glow', 'border-green-400', 'bg-green-50');
                    newPasswordInput.style.borderColor = '';
                    confirmPasswordInput.style.borderColor = '';
                    newPasswordInput.style.backgroundColor = '';
                    confirmPasswordInput.style.backgroundColor = '';
                    
                    updateBtn.disabled = false;
                    updateBtnText.textContent = 'Update Password';
                    updateSpinner.classList.add('hidden');
                    updateBtn.classList.remove('bg-red-600', 'hover:bg-red-700', 'bg-yellow-600', 'hover:bg-yellow-700', 'bg-orange-600', 'hover:bg-orange-700');
                    updateBtn.classList.add('bg-green-600', 'hover:bg-green-700');
                    updateBtn.style.animation = '';
                    
                    // Focus first input for retry
                    newPasswordInput.focus();
                }, 1500);
            }, 400);
        }
        
    } catch (error) {
        // Network error handling
        updateBtnText.textContent = 'Connection Error';
        updateBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
        updateBtn.classList.add('bg-red-600', 'hover:bg-red-700');
        
        setTimeout(() => {
            showNewPasswordError('Failed to update password due to a network error. Please check your connection and try again.');
            
            // Reset everything after network error
            setTimeout(() => {
                newPasswordInput.disabled = false;
                confirmPasswordInput.disabled = false;
                newPasswordInput.classList.remove('processing-glow');
                confirmPasswordInput.classList.remove('processing-glow');
                
                updateBtn.disabled = false;
                updateBtnText.textContent = 'Update Password';
                updateSpinner.classList.add('hidden');
                updateBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
                updateBtn.classList.add('bg-green-600', 'hover:bg-green-700');
                
                newPasswordInput.focus();
            }, 1000);
        }, 400);
        
        console.error('Password update error:', error);
    }
}

// Make functions globally accessible
window.showNewPasswordModal = showNewPasswordModal;
window.closeNewPasswordModal = closeNewPasswordModal;
window.toggleNewPassword = toggleNewPassword;
window.toggleConfirmNewPassword = toggleConfirmNewPassword;
window.updatePassword = updatePassword;
