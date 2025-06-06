// Global variables for login functionality
let loginEmail = '';
let isOTPBeingSent = false; // Add flag to prevent duplicate calls

// Make loginEmail accessible globally
window.loginEmail = '';

// Ensure functions are available globally and re-attachable
window.performLogin = async function() {
    // Prevent multiple simultaneous login attempts
    if (isOTPBeingSent) {
        console.log('OTP sending already in progress, ignoring duplicate call');
        return;
    }
    
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const loginButton = document.getElementById('loginButton');
    const loginButtonText = document.getElementById('loginButtonText');
    
    if (!emailInput || !passwordInput || !loginButton || !loginButtonText) {
        console.error('Login form elements not found');
        showLoginError('Login form not properly loaded. Please refresh the page.');
        return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Store email globally for OTP use
    window.loginEmail = email;
    
    // Client-side validation
    if (!email || !password) {
        showLoginError('Please enter both email and password.');
        return;
    }
    
    // Basic email format validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        showLoginError('Please enter a valid email address.');
        return;
    }
    
    // Check PUP domain
    if (!email.endsWith('@iskolarngbayan.pup.edu.ph')) {
        showLoginError('Please use your PUP email address (@iskolarngbayan.pup.edu.ph).');
        return;
    }
    
    // Set loading state and flag
    isOTPBeingSent = true;
    loginButton.disabled = true;
    loginButtonText.textContent = 'Validating...';
    hideMessages();
    
    try {
        // First validate credentials
        const validationResult = await validateLoginWithAPI({ email, password });
        
        if (validationResult.success) {
            // Credentials are valid - send OTP
            loginButtonText.textContent = 'Sending verification code...';
            
            const otpResult = await sendLoginOTP(email);
            
            if (otpResult.success) {
                window.currentLoginOtpId = otpResult.otp_id;
                
                // Show success and then OTP modal
                showOTPSendingComplete();
                
                setTimeout(() => {
                    if (typeof window.showOTPModal === 'function') {
                        window.showOTPModal();
                    }
                }, 2000);
                
            } else {
                showLoginError(otpResult.message || 'Failed to send verification code. Please try again.');
            }
            
        } else {
            // Show validation errors
            const errorMessages = validationResult.errors && validationResult.errors.length > 0 
                ? validationResult.errors.join(' ') 
                : validationResult.message || 'Invalid email or password.';
            
            showLoginError(errorMessages);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('Login failed due to a network error. Please check your connection and try again.');
    } finally {
        // Reset button state and flag
        isOTPBeingSent = false;
        loginButton.disabled = false;
        loginButtonText.textContent = 'Sign In';
    }
};

// API function to validate login credentials
async function validateLoginWithAPI(loginData) {
    try {
        const apiUrl = '/Auth/ValidateLogin';
        const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value || '';
        
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "RequestVerificationToken": token
            },
            body: JSON.stringify(loginData)
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
                errors: []
            };
        }
        
        return {
            success: result.success || false,
            message: result.message || 'Validation failed',
            errors: result.errors || []
        };
        
    } catch (error) {
        return { 
            success: false, 
            message: "Network error. Please check your connection and try again.",
            errors: []
        };
    }
}

// Make the sendLoginOTP function globally accessible with duplicate prevention
window.sendLoginOTP = async function(email) {
    // Additional check to prevent duplicate calls
    if (isOTPBeingSent && window.currentLoginOtpId) {
        console.log('OTP already being sent or exists, skipping duplicate call');
        return {
            success: true,
            message: 'OTP already sent',
            otp_id: window.currentLoginOtpId
        };
    }
    
    try {
        const apiUrl = '/Auth/SendLoginOTP';
        const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value || '';
        
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

        console.log('Sending OTP request to:', apiUrl);
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
        
        console.log('OTP response:', result);
        
        return {
            success: result.success || false,
            message: result.message || 'Failed to send verification code',
            otp_id: result.otp_id || null
        };
        
    } catch (error) {
        console.error('SendLoginOTP error:', error);
        return { 
            success: false, 
            message: "Network error. Please check your connection and try again.",
            otp_id: null
        };
    }
};

// Message functions
function showLoginError(message) {
    const errorMessage = document.getElementById('loginErrorMessage');
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
    const successMessage = document.getElementById('loginSuccessMessage');
    if (successMessage) {
        successMessage.classList.add('hidden');
    }
}

function showLoginSuccess(message) {
    const successMessage = document.getElementById('loginSuccessMessage');
    if (successMessage) {
        const successText = document.getElementById('loginSuccessText');
        if (successText) {
            successText.textContent = message;
        }
        successMessage.classList.remove('hidden');
    }
    
    // Hide error message
    const errorMessage = document.getElementById('loginErrorMessage');
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
}

function hideMessages() {
    const errorMessage = document.getElementById('loginErrorMessage');
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
    
    const successMessage = document.getElementById('loginSuccessMessage');
    if (successMessage) {
        successMessage.classList.add('hidden');
    }
}

function showOTPSendingComplete() {
    const successIcon = document.getElementById('loginSuccessIcon');
    const successSpinner = document.getElementById('loginSuccessSpinner');
    const successText = document.getElementById('loginSuccessText');
    
    if (successIcon && successSpinner && successText) {
        // Hide spinner and show check icon
        successSpinner.classList.add('hidden');
        successIcon.classList.remove('hidden');
        
        // Update text
        successText.textContent = 'Verification code sent successfully! Check your email.';
    }
}

// Make sure other functions are globally accessible
window.togglePassword = function() {
    const passwordField = document.getElementById('loginPassword');
    if (passwordField) {
        const type = passwordField.type === 'password' ? 'text' : 'password';
        passwordField.type = type;
    }
};

window.goToRegister = function() {
    if (typeof showRegister === 'function') {
        showRegister();
    }
};
