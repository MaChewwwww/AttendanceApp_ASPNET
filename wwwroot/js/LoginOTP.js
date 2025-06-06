// Global variable for OTP functionality
window.currentLoginOtpId = null;

// Make showOTPModal globally available
window.showOTPModal = showOTPModal;

// OTP Modal Functions
function showOTPModal() {
    console.log('showOTPModal called - using top-level modal');
    
    setTimeout(() => {
        const otpModal = document.getElementById('otpModal');
        
        if (!otpModal) {
            console.log('OTP modal not found, creating fallback');
            createOTPModalFallback();
            return;
        }
        
        console.log('OTP modal found, showing it');
        
        // Show modal
        otpModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Setup OTP inputs immediately
        setTimeout(() => {
            setupOTPInputs();
            
            // Focus first input
            const firstInput = document.getElementById('otpInput1');
            if (firstInput) {
                firstInput.focus();
                console.log('Focused first OTP input');
            }
        }, 100);
        
        // Trigger scale-up animation
        const otpModalContent = document.getElementById('otpModalContent');
        if (otpModalContent) {
            setTimeout(() => {
                otpModalContent.classList.remove('scale-95');
                otpModalContent.classList.add('scale-100');
            }, 10);
        }
        
        // Clear any existing messages
        hideOTPMessages();
        hideOTPResendSuccess();
        
        // Clear OTP inputs
        for (let i = 1; i <= 6; i++) {
            const input = document.getElementById(`otpInput${i}`);
            if (input) {
                input.value = '';
            }
        }
        
        // Reset verify button
        const verifyBtn = document.getElementById('verifyLoginOtpBtn');
        if (verifyBtn) {
            verifyBtn.disabled = true;
            verifyBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            verifyBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        }
        
        const verifyBtnText = document.getElementById('verifyLoginButtonText');
        if (verifyBtnText) {
            verifyBtnText.textContent = 'Verify & Login';
        }
        
        const verifySpinner = document.getElementById('verifyLoginSpinner');
        if (verifySpinner) {
            verifySpinner.classList.add('hidden');
        }
        
    }, 100);
}

// Function to force visibility of all OTP elements
function forceOTPElementsVisible() {
    console.log('Forcing OTP elements to be visible...');
    
    // Force OTP input container visibility
    const otpContainer = document.querySelector('.flex.justify-center.space-x-3');
    if (otpContainer) {
        otpContainer.style.setProperty('display', 'flex', 'important');
        otpContainer.style.setProperty('visibility', 'visible', 'important');
        otpContainer.style.setProperty('opacity', '1', 'important');
        console.log('OTP container forced visible');
    }
    
    // Force all OTP inputs to be visible
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`otpInput${i}`);
        if (input) {
            input.style.setProperty('display', 'block', 'important');
            input.style.setProperty('visibility', 'visible', 'important');
            input.style.setProperty('opacity', '1', 'important');
            input.style.setProperty('width', '3rem', 'important');
            input.style.setProperty('height', '3rem', 'important');
            console.log(`OTP input ${i} forced visible`);
        }
    }
    
    // Force buttons to be visible
    const buttonContainer = document.querySelector('.flex.space-x-4');
    if (buttonContainer) {
        buttonContainer.style.setProperty('display', 'flex', 'important');
        buttonContainer.style.setProperty('visibility', 'visible', 'important');
        buttonContainer.style.setProperty('opacity', '1', 'important');
        console.log('Button container forced visible');
    }
    
    const verifyBtn = document.getElementById('verifyLoginOtpBtn');
    if (verifyBtn) {
        verifyBtn.style.setProperty('display', 'block', 'important');
        verifyBtn.style.setProperty('visibility', 'visible', 'important');
        verifyBtn.style.setProperty('opacity', '1', 'important');
        console.log('Verify button forced visible');
    }
    
    const resendBtn = document.getElementById('resendLoginOtpBtn');
    if (resendBtn) {
        resendBtn.style.setProperty('display', 'inline-block', 'important');
        resendBtn.style.setProperty('visibility', 'visible', 'important');
        resendBtn.style.setProperty('opacity', '1', 'important');
        console.log('Resend button forced visible');
    }
}

// Setup OTP inputs with proper event handlers
function setupOTPInputs() {
    console.log('Setting up OTP inputs...');
    
    const otpInputs = [];
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`otpInput${i}`);
        if (input) {
            otpInputs.push(input);
        }
    }
    
    if (otpInputs.length !== 6) {
        console.warn(`Only found ${otpInputs.length} OTP inputs out of 6`);
    }
    
    function checkOTPComplete() {
        const otpValue = otpInputs.map(input => input.value).join('');
        const verifyBtn = document.getElementById('verifyLoginOtpBtn');
        if (verifyBtn) {
            verifyBtn.disabled = otpValue.length !== 6;
        }
    }
    
    // Setup event handlers for each input
    otpInputs.forEach((input, index) => {
        // Clear any existing event listeners by cloning
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        otpInputs[index] = newInput;
        
        // Force visibility again after cloning
        newInput.style.setProperty('display', 'block', 'important');
        newInput.style.setProperty('visibility', 'visible', 'important');
        newInput.style.setProperty('opacity', '1', 'important');
        
        // Add input event handler
        newInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
            
            if (this.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
            
            checkOTPComplete();
        });
        
        // Add keydown event handler
        newInput.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
        
        // Add paste event handler
        newInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const pasteArray = paste.replace(/\D/g, '').split('').slice(0, 6);
            
            otpInputs.forEach(inp => inp.value = '');
            
            pasteArray.forEach((char, pasteIndex) => {
                if (pasteIndex < otpInputs.length) {
                    otpInputs[pasteIndex].value = char;
                }
            });
            
            const nextEmptyIndex = pasteArray.length < 6 ? pasteArray.length : 5;
            if (nextEmptyIndex < otpInputs.length) {
                otpInputs[nextEmptyIndex].focus();
            }
            
            checkOTPComplete();
        });
    });
    
    console.log(`OTP inputs setup completed with ${otpInputs.length} inputs`);
}

function closeOTPModal() {
    const otpModal = document.getElementById('otpModal');
    const otpModalContent = document.getElementById('otpModalContent');
    
    if (otpModal && otpModalContent) {
        // Start closing animation
        otpModalContent.classList.remove('scale-100');
        otpModalContent.classList.add('scale-95');
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
            otpModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 300);
    }
    
    // Clear OTP inputs
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`otpInput${i}`);
        if (input) {
            input.value = '';
        }
    }
    
    // Clear any messages
    hideOTPMessages();
    hideOTPResendSuccess();
    
    // Reset verify button
    const verifyBtn = document.getElementById('verifyLoginOtpBtn');
    if (verifyBtn) {
        verifyBtn.disabled = true;
    }
}

function closeFallbackOTPModal() {
    const fallbackModal = document.getElementById('otpModalFallback');
    
    if (fallbackModal) {
        const fallbackModalContent = document.getElementById('otpModalFallbackContent');
        
        // Apply closing animation if content container exists
        if (fallbackModalContent) {
            fallbackModalContent.classList.remove('scale-100');
            fallbackModalContent.classList.add('scale-95');
            
            // Wait for animation to complete before removing
            setTimeout(() => {
                fallbackModal.remove();
                document.body.style.overflow = 'auto';
            }, 300);
        } else {
            // If no content container, just remove immediately
            fallbackModal.remove();
            document.body.style.overflow = 'auto';
        }
    }
}

// Create OTP Modal Fallback
function createOTPModalFallback() {
    const modalHTML = `
    <div id="otpModalFallback" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 transition-opacity duration-300">
        <div id="otpModalFallbackContent" class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white transform transition-transform duration-300 scale-95">
            <!-- Modal Header -->
            <div class="text-center mb-6">
                <div class="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">Email Verification</h3>
                <p class="text-gray-600 text-sm">Enter the 6-digit verification code sent to your email</p>
            </div>

            <!-- Fallback Error Message -->
            <div id="fallbackErrorMessage" class="hidden mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
                <div class="flex items-center">
                    <svg class="w-4 h-4 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                    </svg>
                    <p class="text-sm font-medium text-red-800"></p>
                </div>
            </div>

            <!-- Fallback Resend Success Message -->
            <div id="fallbackResendSuccessMessage" class="hidden mb-4 rounded-lg bg-blue-50 border border-blue-200 p-3 animate-pulse">
                <div class="flex items-center">
                    <svg class="w-4 h-4 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    <p class="text-sm font-medium text-blue-800">New verification code sent successfully!</p>
                </div>
            </div>

            <!-- OTP Input Section -->
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-3 text-center">Enter Verification Code</label>
                
                <!-- OTP Input Fields with improved paste handling -->
                <div class="flex justify-center space-x-2 mb-4">
                    <input type="text" id="otpInputFallback1" maxlength="1" autocomplete="off" inputmode="numeric" class="w-10 h-10 text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 text-lg font-semibold" />
                    <input type="text" id="otpInputFallback2" maxlength="1" autocomplete="off" inputmode="numeric" class="w-10 h-10 text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 text-lg font-semibold" />
                    <input type="text" id="otpInputFallback3" maxlength="1" autocomplete="off" inputmode="numeric" class="w-10 h-10 text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 text-lg font-semibold" />
                    <input type="text" id="otpInputFallback4" maxlength="1" autocomplete="off" inputmode="numeric" class="w-10 h-10 text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 text-lg font-semibold" />
                    <input type="text" id="otpInputFallback5" maxlength="1" autocomplete="off" inputmode="numeric" class="w-10 h-10 text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 text-lg font-semibold" />
                    <input type="text" id="otpInputFallback6" maxlength="1" autocomplete="off" inputmode="numeric" class="w-10 h-10 text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 text-lg font-semibold" />
                </div>
                
                <!-- Resend OTP for fallback -->
                <div class="text-center">
                    <button id="resendFallbackOtpBtn" onclick="resendFallbackOTP()" class="text-blue-600 hover:text-blue-700 text-sm font-medium underline transition-colors disabled:text-gray-400 disabled:line-through disabled:no-underline disabled:cursor-not-allowed">
                        Resend Code
                    </button>
                </div>
            </div>

            <!-- Modal Buttons -->
            <div class="flex space-x-3">
                <button onclick="closeFallbackOTPModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium text-sm">Cancel</button>
                <button id="verifyFallbackOtpBtn" onclick="verifyFallbackOTP()" disabled class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50">
                    <span id="verifyFallbackButtonText">Verify & Login</span>
                </button>
            </div>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.style.overflow = 'hidden';
    
    // Get references to the newly created elements
    const fallbackModal = document.getElementById('otpModalFallback');
    const fallbackModalContent = document.getElementById('otpModalFallbackContent');
    
    // Show the modal with animation
    if (fallbackModalContent) {
        // Trigger scale-up animation after a brief delay
        setTimeout(() => {
            fallbackModalContent.classList.remove('scale-95');
            fallbackModalContent.classList.add('scale-100');
        }, 10);
    }
    
    // Setup fallback OTP inputs
    setupFallbackOTPInputs();
    
    // Focus first input
    setTimeout(() => {
        const firstInput = document.getElementById('otpInputFallback1');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
}

// Fallback error functions
function showFallbackOTPError(message) {
    const errorMessage = document.getElementById('fallbackErrorMessage');
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
}

function hideFallbackOTPMessages() {
    const errorMessage = document.getElementById('fallbackErrorMessage');
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
    
    const successMessage = document.getElementById('fallbackResendSuccessMessage');
    if (successMessage) {
        successMessage.classList.add('hidden');
    }
}

// Enhanced verifyFallbackOTP function
function verifyFallbackOTP() {
    const otpInputs = [];
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`otpInputFallback${i}`);
        if (input) {
            otpInputs.push(input);
        }
    }
    
    const otpCode = otpInputs.map(input => input.value).join('');
    
    if (otpCode.length !== 6) {
        showFallbackOTPError('Please enter the complete 6-digit verification code.');
        return;
    }
    
    if (!window.currentLoginOtpId) {
        showFallbackOTPError('OTP session expired. Please try logging in again.');
        return;
    }
    
    // Clear any existing messages
    hideFallbackOTPMessages();
    
    // Set loading state
    const verifyBtn = document.getElementById('verifyFallbackOtpBtn');
    const verifyBtnText = document.getElementById('verifyFallbackButtonText');
    
    if (verifyBtn) verifyBtn.disabled = true;
    if (verifyBtnText) verifyBtnText.textContent = 'Verifying...';
    
    // Call the same verification function
    verifyLoginOTPWithAPI(window.currentLoginOtpId, otpCode)
        .then(result => {
            if (result.success) {
                if (verifyBtnText) verifyBtnText.textContent = 'Login Successful!';
                
                // Store authentication data if provided
                if (result.token) {
                    // You can store token here if needed
                }
                if (result.user) {
                    // You can store user data here if needed
                }
                
                setTimeout(() => {
                    closeFallbackOTPModal();
                    // Use the redirect_url from API response or default based on role
                    const redirectUrl = result.redirect_url || '/Student/Dashboard';
                    window.location.href = redirectUrl;
                }, 2000);
            } else {
                // Show specific error message
                const errorMessage = result.message || 'Invalid verification code. Please check your code and try again.';
                showFallbackOTPError(errorMessage);
                
                if (verifyBtn) verifyBtn.disabled = false;
                if (verifyBtnText) verifyBtnText.textContent = 'Verify & Login';
                
                // Clear inputs and add visual feedback
                otpInputs.forEach(input => {
                    input.value = '';
                    input.style.borderColor = '#ef4444'; // Red border
                });
                
                // Remove red border after 3 seconds
                setTimeout(() => {
                    otpInputs.forEach(input => {
                        input.style.borderColor = '';
                    });
                }, 3000);
                
                otpInputs[0]?.focus();
            }
        })
        .catch(error => {
            showFallbackOTPError('Verification failed due to a network error. Please check your connection and try again.');
            if (verifyBtn) verifyBtn.disabled = false;
            if (verifyBtnText) verifyBtnText.textContent = 'Verify & Login';
            
            otpInputs.forEach(input => input.value = '');
            otpInputs[0]?.focus();
        });
}

// API verification function
async function verifyLoginOTPWithAPI(otpId, otpCode) {
    try {
        const apiUrl = '/Auth/VerifyLoginOTP';
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
                user: null,
                token: null
            };
        }
        
        return {
            success: result.success || false,
            message: result.message || 'Verification failed',
            user: result.user || null,
            token: result.token || null
        };
        
    } catch (error) {
        return { 
            success: false, 
            message: "Network error. Please check your connection and try again.",
            user: null,
            token: null
        };
    }
}

// Main verification function
async function verifyLoginOTP() {
    const otpInputs = [];
    for (let i = 1; i <= 6; i++) {
        otpInputs.push(document.getElementById(`otpInput${i}`));
    }
    
    const otpCode = otpInputs.map(input => input.value).join('');
    
    if (otpCode.length !== 6) {
        showOTPError('Please enter the complete 6-digit verification code.');
        return;
    }
    
    if (!window.currentLoginOtpId) {
        showOTPError('OTP session expired. Please try logging in again.');
        return;
    }
    
    // Clear any existing messages
    hideOTPMessages();
    
    // Set loading state
    const verifyBtn = document.getElementById('verifyLoginOtpBtn');
    const verifyBtnText = document.getElementById('verifyLoginButtonText');
    const verifySpinner = document.getElementById('verifyLoginSpinner');
    
    verifyBtn.disabled = true;
    verifyBtnText.textContent = 'Verifying...';
    verifySpinner.classList.remove('hidden');
    
    try {
        const result = await verifyLoginOTPWithAPI(window.currentLoginOtpId, otpCode);
        
        if (result.success) {
            showOTPSuccess('Login successful! Redirecting to dashboard...');
            verifyBtnText.textContent = 'Login Successful!';
            
            // Store authentication token if provided
            if (result.token) {
                // You can store the token here if needed
            }
            
            // Store user information if needed
            if (result.user) {
                // You can store user data here if needed
            }
            
            // Wait for user to see success message then redirect
            setTimeout(() => {
                closeOTPModal();
                // Use the redirect_url from API response or default based on role
                const redirectUrl = result.redirect_url || '/Student/Dashboard';
                window.location.href = redirectUrl;
            }, 2000);
            
        } else {
            // Show specific error message from API
            const errorMessage = result.message || 'Invalid verification code. Please check your code and try again.';
            showOTPError(errorMessage);
            
            // Reset button state
            verifyBtn.disabled = false;
            verifyBtnText.textContent = 'Verify & Login';
            verifySpinner.classList.add('hidden');
            
            // Clear OTP inputs for retry
            otpInputs.forEach(input => {
                input.value = '';
                input.classList.remove('border-red-500');
                input.classList.add('border-gray-300');
            });
            
            // Add red border to indicate error
            setTimeout(() => {
                otpInputs.forEach(input => {
                    input.classList.remove('border-gray-300');
                    input.classList.add('border-red-500');
                });
                
                // Remove red border after 3 seconds
                setTimeout(() => {
                    otpInputs.forEach(input => {
                        input.classList.remove('border-red-500');
                        input.classList.add('border-gray-300');
                    });
                }, 3000);
            }, 100);
            
            // Focus first input for retry
            otpInputs[0].focus();
        }
        
    } catch (error) {
        showOTPError('Verification failed due to a network error. Please check your connection and try again.');
        
        // Reset button state
        verifyBtn.disabled = false;
        verifyBtnText.textContent = 'Verify & Login';
        verifySpinner.classList.add('hidden');
        
        // Clear inputs and focus first
        otpInputs.forEach(input => input.value = '');
        otpInputs[0].focus();
    }
}

// OTP message functions
function showOTPSuccess(message) {
    const successMessage = document.getElementById('otpSuccessMessage');
    if (successMessage) {
        const successText = successMessage.querySelector('p');
        if (successText) {
            successText.textContent = message;
        }
        successMessage.classList.remove('hidden');
    }
    
    // Hide error message
    const errorMessage = document.getElementById('otpErrorMessage');
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
}

function hideOTPMessages() {
    const errorMessage = document.getElementById('otpErrorMessage');
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
    
    const successMessage = document.getElementById('otpSuccessMessage');
    if (successMessage) {
        successMessage.classList.add('hidden');
    }
}

function showOTPError(message) {
    const errorMessage = document.getElementById('otpErrorMessage');
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
    const successMessage = document.getElementById('otpSuccessMessage');
    if (successMessage) {
        successMessage.classList.add('hidden');
    }
    
    // Hide resend success message
    const resendSuccessMessage = document.getElementById('otpResendSuccessMessage');
    if (resendSuccessMessage) {
        resendSuccessMessage.classList.add('hidden');
    }
}

// Enhanced OTP input setup with better paste handling
function setupEnhancedOTPInputs() {
    const otpInputs = [];
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`otpInput${i}`);
        if (input) {
            otpInputs.push(input);
        }
    }
    
    if (otpInputs.length !== 6) {
        setupOTPInputs();
        return;
    }
    
    function checkOTPComplete() {
        const otpValue = otpInputs.map(input => input.value).join('');
        const verifyBtn = document.getElementById('verifyLoginOtpBtn');
        if (verifyBtn) {
            verifyBtn.disabled = otpValue.length !== 6;
        }
    }
    
    // Enhanced setup for each input
    otpInputs.forEach((input, index) => {
        // Clear any existing listeners
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        otpInputs[index] = newInput;
        
        newInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
            
            if (this.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
            
            checkOTPComplete();
        });
        
        newInput.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
        
        // Enhanced paste event handling
        newInput.addEventListener('paste', function(e) {
            e.preventDefault();
            
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const pasteArray = paste.replace(/\D/g, '').split('').slice(0, 6);
            
            // Clear all inputs first
            otpInputs.forEach(inp => inp.value = '');
            
            // Fill inputs with pasted data
            pasteArray.forEach((char, pasteIndex) => {
                if (pasteIndex < otpInputs.length) {
                    otpInputs[pasteIndex].value = char;
                }
            });
            
            // Focus the next empty input or the last one
            const nextEmptyIndex = pasteArray.length < 6 ? pasteArray.length : 5;
            if (nextEmptyIndex < otpInputs.length) {
                otpInputs[nextEmptyIndex].focus();
            }
            
            checkOTPComplete();
        });
    });
}

// Enhanced fallback OTP input setup
function setupFallbackOTPInputs() {
    const otpInputs = [];
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`otpInputFallback${i}`);
        if (input) {
            otpInputs.push(input);
        }
    }
    
    function checkOTPComplete() {
        const otpValue = otpInputs.map(input => input.value).join('');
        const verifyBtn = document.getElementById('verifyFallbackOtpBtn');
        if (verifyBtn) {
            verifyBtn.disabled = otpValue.length !== 6;
        }
    }
    
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
            checkOTPComplete();
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
        
        // Enhanced paste for fallback
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const pasteArray = paste.replace(/\D/g, '').split('').slice(0, 6);
            
            otpInputs.forEach(inp => inp.value = '');
            
            pasteArray.forEach((char, pasteIndex) => {
                if (pasteIndex < otpInputs.length) {
                    otpInputs[pasteIndex].value = char;
                }
            });
            
            const nextEmptyIndex = pasteArray.length < 6 ? pasteArray.length : 5;
            if (nextEmptyIndex < otpInputs.length) {
                otpInputs[nextEmptyIndex].focus();
            }
            
            checkOTPComplete();
        });
    });
}

// Success message functions
function showOTPResendSuccess(message = 'New verification code sent successfully!') {
    const successMessage = document.getElementById('otpResendSuccessMessage');
    if (successMessage) {
        const successText = successMessage.querySelector('p');
        if (successText) {
            successText.textContent = message;
        }
        successMessage.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideOTPResendSuccess();
        }, 5000);
    }
}

function hideOTPResendSuccess() {
    const successMessage = document.getElementById('otpResendSuccessMessage');
    if (successMessage) {
        successMessage.classList.add('hidden');
    }
}

function showFallbackResendSuccess(message = 'New verification code sent successfully!') {
    const successMessage = document.getElementById('fallbackResendSuccessMessage');
    if (successMessage) {
        const successText = successMessage.querySelector('p');
        if (successText) {
            successText.textContent = message;
        }
        successMessage.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 5000);
    }
}

// Resend functions
async function resendLoginOTP() {
    if (!window.loginEmail) {
        showOTPError('Session expired. Please try logging in again.');
        return;
    }
    
    const resendBtn = document.getElementById('resendLoginOtpBtn');
    
    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';
    resendBtn.classList.add('line-through', 'no-underline', 'text-gray-400');
    resendBtn.classList.remove('text-blue-600', 'hover:text-blue-700', 'underline');
    
    try {
        // Use the global sendLoginOTP function
        const result = await window.sendLoginOTP(window.loginEmail);
        
        if (result.success) {
            window.currentLoginOtpId = result.otp_id;
            
            showOTPResendSuccess('New verification code sent successfully!');
            
            // Start 5-minute cooldown timer
            startResendCooldown(300);
            
        } else {
            showOTPError(result.message || 'Failed to resend verification code.');
            resetResendButton();
        }
        
    } catch (error) {
        showOTPError('Failed to resend verification code.');
        resetResendButton();
    }
}

function resendFallbackOTP() {
    if (!window.loginEmail) {
        alert('Session expired. Please try logging in again.');
        return;
    }
    
    const resendBtn = document.getElementById('resendFallbackOtpBtn');
    
    resendBtn.disabled = true;
    resendBtn.textContent = 'Sending...';
    resendBtn.classList.add('line-through', 'no-underline', 'text-gray-400');
    resendBtn.classList.remove('text-blue-600', 'hover:text-blue-700', 'underline');
    
    // Use the global sendLoginOTP function
    window.sendLoginOTP(window.loginEmail)
        .then(result => {
            if (result.success) {
                window.currentLoginOtpId = result.otp_id;
                
                showFallbackResendSuccess('New verification code sent successfully!');
                
                startFallbackResendCooldown(300);
                
            } else {
                alert(result.message || 'Failed to resend verification code.');
                resetFallbackResendButton();
            }
        })
        .catch(error => {
            alert('Failed to resend verification code.');
            resetFallbackResendButton();
        });
}

// Fallback setup function
function setupOTPInputs() {
    const otpInputs = [];
    let allInputsFound = true;
    
    for (let i = 1; i <= 6; i++) {
        const input = document.getElementById(`otpInput${i}`);
        if (input) {
            otpInputs.push(input);
        } else {
            allInputsFound = false;
        }
    }
    
    if (!allInputsFound) {
        return;
    }
    
    function getOTPValue() {
        return otpInputs.map(input => input.value).join('');
    }
    
    function checkOTPComplete() {
        const otpValue = getOTPValue();
        const verifyBtn = document.getElementById('verifyLoginOtpBtn');
        if (verifyBtn) {
            verifyBtn.disabled = otpValue.length !== 6;
        }
    }
    
    // Remove any existing event listeners first to prevent duplicates
    otpInputs.forEach((input, index) => {
        // Clone the node to remove all event listeners
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        otpInputs[index] = newInput; // Update reference
    });
    
    // Auto-focus and move to next input
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            // Only allow numbers
            this.value = this.value.replace(/[^0-9]/g, '');
            
            // Move to next input if current is filled
            if (this.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
            
            // Check if all inputs are filled
            checkOTPComplete();
        });
        
        input.addEventListener('keydown', function(e) {
            // Move to previous input on backspace
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
        
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const pasteArray = paste.split('').filter(char => /[0-9]/.test(char));
            
            pasteArray.forEach((char, pasteIndex) => {
                if (index + pasteIndex < otpInputs.length) {
                    otpInputs[index + pasteIndex].value = char;
                }
            });
            
            checkOTPComplete();
        });
    });
}

// Timer functions
function startResendCooldown(seconds) {
    const resendBtn = document.getElementById('resendLoginOtpBtn');
    let timeLeft = seconds;
    
    resendBtn.disabled = true;
    resendBtn.classList.add('line-through', 'no-underline', 'text-gray-400', 'cursor-not-allowed');
    resendBtn.classList.remove('text-blue-600', 'hover:text-blue-700', 'underline');
    
    const countdown = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const timeString = minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`;
        
        resendBtn.textContent = `Resend Code (${timeString})`;
        resendBtn.disabled = true;
        
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(countdown);
            resetResendButton();
        }
    }, 1000);
}

function resetResendButton() {
    const resendBtn = document.getElementById('resendLoginOtpBtn');
    
    resendBtn.textContent = 'Resend Code';
    resendBtn.disabled = false;
    resendBtn.classList.remove('line-through', 'no-underline', 'text-gray-400', 'cursor-not-allowed');
    resendBtn.classList.add('text-blue-600', 'hover:text-blue-700', 'underline');
}

function startFallbackResendCooldown(seconds) {
    const resendBtn = document.getElementById('resendFallbackOtpBtn');
    let timeLeft = seconds;
    
    resendBtn.disabled = true;
    resendBtn.classList.add('line-through', 'no-underline', 'text-gray-400', 'cursor-not-allowed');
    resendBtn.classList.remove('text-blue-600', 'hover:text-blue-700', 'underline');
    
    const countdown = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const timeString = minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`;
        
        resendBtn.textContent = `Resend Code (${timeString})`;
        resendBtn.disabled = true;
        
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(countdown);
            resetFallbackResendButton();
        }
    }, 1000);
}

function resetFallbackResendButton() {
    const resendBtn = document.getElementById('resendFallbackOtpBtn');
    
    if (resendBtn) {
        resendBtn.textContent = 'Resend Code';
        resendBtn.disabled = false;
        resendBtn.classList.remove('line-through', 'no-underline', 'text-gray-400', 'cursor-not-allowed');
        resendBtn.classList.add('text-blue-600', 'hover:text-blue-700', 'underline');
    }
}
