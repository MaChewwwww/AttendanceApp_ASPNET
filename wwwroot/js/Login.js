// Global variables for login functionality
let loginEmail = '';

// Make loginEmail accessible globally
Object.defineProperty(window, 'loginEmail', {
    get: function() { return loginEmail; },
    set: function(value) { loginEmail = value; }
});

// Global functions
function togglePassword() {
    const passwordField = document.getElementById('loginPassword');
    const type = passwordField.type === 'password' ? 'text' : 'password';
    passwordField.type = type;
}

function goToRegister() {
    window.location.href = '/Auth/Register';
}

// Message display functions
function showLoginError(message) {
    const errorMessage = document.getElementById('loginErrorMessage');
    if (errorMessage) {
        const errorText = errorMessage.querySelector('p');
        if (errorText) errorText.textContent = message;
        errorMessage.classList.remove('hidden');
    }
    
    setTimeout(() => {
        errorMessage?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

function showLoginSuccess() {
    const successMessage = document.getElementById('loginSuccessMessage');
    const successIcon = document.getElementById('loginSuccessIcon');
    const successSpinner = document.getElementById('loginSuccessSpinner');
    const successText = document.getElementById('loginSuccessText');
    
    if (successMessage) {
        successMessage.classList.remove('hidden');
    }
    
    // Show spinner and hide checkmark icon during OTP sending
    if (successIcon) {
        successIcon.classList.add('hidden');
    }
    if (successSpinner) {
        successSpinner.classList.remove('hidden');
    }
    if (successText) {
        successText.innerHTML = 'Validation successful! <span class="animate-pulse">Sending login OTP code...</span>';
    }
}

function showOTPSendingComplete() {
    const successIcon = document.getElementById('loginSuccessIcon');
    const successSpinner = document.getElementById('loginSuccessSpinner');
    const successText = document.getElementById('loginSuccessText');
    
    // Hide spinner and show checkmark icon when OTP sending is complete
    if (successSpinner) {
        successSpinner.classList.add('hidden');
    }
    if (successIcon) {
        successIcon.classList.remove('hidden');
    }
    if (successText) {
        successText.innerHTML = 'OTP sent successfully! Please check your email.';
    }
}

function hideMessages() {
    const errorMessage = document.getElementById('loginErrorMessage');
    const successMessage = document.getElementById('loginSuccessMessage');
    
    if (errorMessage) errorMessage.classList.add('hidden');
    if (successMessage) successMessage.classList.add('hidden');
}

function resetLoginButton() {
    setTimeout(() => {
        const loginButton = document.getElementById('loginButton');
        const loginButtonText = document.getElementById('loginButtonText');
        
        if (loginButton) {
            loginButton.disabled = false;
            loginButton.classList.remove('bg-green-600', 'hover:bg-green-700');
            loginButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
        }
        if (loginButtonText) loginButtonText.textContent = 'Sign In';
    }, 1000);
}

// API validation function
async function validateLoginWithAPI(loginData) {
    try {
        const apiUrl = '/Auth/ValidateLogin';
        const token = document.querySelector('input[name="__RequestVerificationToken"]').value;
        
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
        
        if (!response.ok) {
            const errorText = await response.text();
            return { 
                success: false, 
                errors: [`Server Error ${response.status}: ${response.statusText}`] 
            };
        }

        const responseText = await response.text();
        const result = JSON.parse(responseText);
        
        return {
            success: result.success || false,
            message: result.message || '',
            errors: result.errors || []
        };
        
    } catch (error) {
        return { 
            success: false, 
            errors: [`Network Error: ${error.message}`] 
        };
    }
}

// Send Login OTP - make this function globally accessible
window.sendLoginOTP = async function(email) {
    try {
        const apiUrl = '/Auth/SendLoginOTP';
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
        const result = JSON.parse(responseText);
        
        return {
            success: result.success || false,
            message: result.message || '',
            otp_id: result.otp_id || null
        };
        
    } catch (error) {
        return { 
            success: false, 
            message: `Network Error: ${error.message}` 
        };
    }
};

// MAIN LOGIN FUNCTION
async function performLogin() {
    const loginButton = document.getElementById('loginButton');
    const loginButtonText = document.getElementById('loginButtonText');
    
    // Set loading state
    loginButton.disabled = true;
    loginButtonText.textContent = 'Signing In...';
    
    // Hide previous messages
    hideMessages();
    
    try {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        // Store for OTP process and make it globally accessible
        loginEmail = email;
        window.loginEmail = email;
        
        // Client-side validation
        if (!email || !password) {
            showLoginError('Please enter both email and password.');
            resetLoginButton();
            return;
        }
        
        // Validate with API first
        const validationResult = await validateLoginWithAPI({ email, password });
        
        if (validationResult.success) {
            // Validation successful - now send OTP
            showLoginSuccess();
            loginButtonText.textContent = 'Sending OTP...';
            
            // Send OTP
            const otpResult = await window.sendLoginOTP(email);
            
            if (otpResult.success) {
                window.currentLoginOtpId = otpResult.otp_id;
                
                // Show completion state
                showOTPSendingComplete();
                
                // Show OTP modal after a brief delay to show completion
                setTimeout(() => {
                    try {
                        showOTPModal();
                    } catch (modalError) {
                        showLoginError('Failed to show verification dialog. Please try again.');
                        resetLoginButton();
                        return;
                    }
                }, 800);
                
                resetLoginButton();
            } else {
                showLoginError(otpResult.message || 'Failed to send verification code. Please try again.');
                resetLoginButton();
            }
            
        } else {
            // Failed validation
            const errorMessages = validationResult.errors && validationResult.errors.length > 0 
                ? validationResult.errors.join(' ') 
                : validationResult.message || 'Login validation failed.';
            
            showLoginError(errorMessages);
            resetLoginButton();
        }
        
    } catch (error) {
        showLoginError('Login failed. Please try again.');
        resetLoginButton();
    }
}
