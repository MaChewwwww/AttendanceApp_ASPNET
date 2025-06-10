// Configuration - Uses ASP.NET Core backend API

// Check if form elements exist before declaring (avoid redeclaration)
let form, validationMessages, successMessage, errorList, submitButton, buttonText, buttonSpinner;

// Initialize form elements when DOM loads
function initializeFormElements() {
    form = document.getElementById("registrationForm");
    validationMessages = document.getElementById("validationMessages");
    successMessage = document.getElementById("successMessage");
    errorList = document.getElementById("errorList");
    submitButton = document.getElementById("submitButton");
    buttonText = document.getElementById("buttonText");
    buttonSpinner = document.getElementById("buttonSpinner");
}

// Select form elements
// const form = document.getElementById("registrationForm");
// const validationMessages = document.getElementById("validationMessages");
// const successMessage = document.getElementById("successMessage");
// const errorList = document.getElementById("errorList");
// const submitButton = document.getElementById("submitButton");
// const buttonText = document.getElementById("buttonText");
// const buttonSpinner = document.getElementById("buttonSpinner");

// Utility function to display validation errors
function displayErrors(errors) {
    errorList.innerHTML = "";
    errors.forEach((error) => {
        const li = document.createElement("li");
        li.textContent = error;
        errorList.appendChild(li);
    });
    validationMessages.classList.remove("hidden");
    successMessage.classList.add("hidden");
    
    // Scroll to top to show errors
    validationMessages.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Utility function to hide validation errors
function hideErrors() {
    validationMessages.classList.add("hidden");
    errorList.innerHTML = "";
}

// Utility function to show success message
function showSuccess(message = "Form validation successful!") {
    successMessage.querySelector('p').textContent = message;
    successMessage.classList.remove("hidden");
    validationMessages.classList.add("hidden");
}

// Function to validate passwords locally
function validatePasswords(password, confirmPassword) {
    const errors = [];
    
    if (password !== confirmPassword) {
        errors.push("Passwords do not match. Please ensure both password fields are identical.");
    }
    
    if (password.length < 6) {
        errors.push("Password must be at least 6 characters long.");
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
        errors.push("Password must contain at least one lowercase letter.");
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
        errors.push("Password must contain at least one uppercase letter.");
    }
    
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
        errors.push("Password must contain at least one special character.");
    }
    
    return errors;
}

// Function to validate required fields locally
function validateRequiredFields(formData) {
    const errors = [];
    
    if (!formData.first_name || formData.first_name.trim() === '') {
        errors.push("First Name is required and must not be empty.");
    }
    
    if (!formData.last_name || formData.last_name.trim() === '') {
        errors.push("Last Name is required and must not be empty.");
    }
    
    if (!formData.contact_number || formData.contact_number.trim() === '') {
        errors.push("Contact Number is required and must not be empty.");
    } else {
        const digitsOnly = formData.contact_number.replace(/\D/g, '');
        if (digitsOnly.length !== 11) {
            errors.push("Contact Number must be exactly 11 digits.");
        }
    }
    
    if (!formData.student_number || formData.student_number.trim() === '') {
        errors.push("Student Number is required and must not be empty.");
    }
    
    if (!formData.email || formData.email.trim() === '') {
        errors.push("Email is required and must not be empty.");
    } else if (!formData.email.endsWith('@iskolarngbayan.pup.edu.ph')) {
        errors.push("Email must be a valid @iskolarngbayan.pup.edu.ph address.");
    }
    
    if (!formData.password || formData.password.trim() === '') {
        errors.push("Password is required and must not be empty.");
    }
    
    if (!formData.confirm_password || formData.confirm_password.trim() === '') {
        errors.push("Confirm Password is required and must not be empty.");
    }
    
    if (!formData.terms) {
        errors.push("You must agree to the Terms and Conditions.");
    }
    
    // Validate date of birth
    const day = parseInt(form.day.value);
    const month = parseInt(form.month.value);
    const year = parseInt(form.year.value);
    
    if (!day || !month || !year) {
        errors.push("Complete date of birth is required and must not be empty.");
    } else {
        if (day < 1 || day > 31) errors.push("Day must be between 1 and 31.");
        if (month < 1 || month > 12) errors.push("Month must be between 1 and 12.");
        
        // Validate actual date
        const date = new Date(year, month - 1, day);
        if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
            errors.push("Please enter a valid date.");
        } else {
            // Check if at least 16 years old
            const today = new Date();
            const birthDate = new Date(year, month - 1, day);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            if (age < 16) {
                errors.push("You must be at least 16 years old to register.");
            }
        }
    }
    
    return errors;
}

// Password strength checker
function checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('passwordStrength');
    const strengthBars = [
        document.getElementById('strength1'),
        document.getElementById('strength2'),
        document.getElementById('strength3'),
        document.getElementById('strength4')
    ];
    const strengthText = document.getElementById('strengthText');
    
    if (password.length === 0) {
        strengthIndicator.classList.add('hidden');
        return;
    }
    
    strengthIndicator.classList.remove('hidden');
    
    let strength = 0;
    const checks = [
        password.length >= 8,
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
        /\d/.test(password),
        /[^A-Za-z0-9]/.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    
    // Reset all bars
    strengthBars.forEach(bar => {
        bar.className = 'h-2 w-1/4 rounded bg-gray-200';
    });
    
    // Fill bars based on strength
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    
    for (let i = 0; i < Math.min(strength, 4); i++) {
        strengthBars[i].className = `h-2 w-1/4 rounded ${colors[Math.min(i, 3)]}`;
    }
    
    strengthText.textContent = texts[Math.min(strength, 4)];
    strengthText.className = `text-xs mt-1 ${strength < 2 ? 'text-red-600' : strength < 4 ? 'text-yellow-600' : 'text-green-600'}`;
}

// Loading state management
function setLoadingState(loading) {
    if (!submitButton) return;
    
    if (loading) {
        submitButton.disabled = true;
        if (buttonText) buttonText.textContent = "Validating...";
        if (buttonSpinner) buttonSpinner.classList.remove("hidden");
        submitButton.classList.add("opacity-75");
    } else {
        submitButton.disabled = false;
        if (buttonText) buttonText.textContent = "Continue to Next Step";
        if (buttonSpinner) buttonSpinner.classList.add("hidden");
        submitButton.classList.remove("opacity-75");
    }
}

// Function to send form data to the API for validation
async function validateWithAPI(formData) {
    try {
        const apiUrl = '/Auth/ValidateRegistration';
        
        // Get anti-forgery token
        const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;
        
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(formData)
        };
        
        // Only add the token if it exists
        if (token) {
            requestOptions.headers["RequestVerificationToken"] = token;
        }

        const response = await fetch(apiUrl, requestOptions);
        const responseText = await response.text();

        if (!response.ok) {
            return { 
                success: false, 
                errors: [`API Error ${response.status}: ${response.statusText} - ${responseText}`] 
            };
        }

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (jsonError) {
            return { success: false, errors: ['Invalid response format from server'] };
        }
        
        // Handle your Python API's response format
        if (result.success !== undefined) {
            return { 
                success: result.success, 
                errors: result.errors || [],
                message: result.message || ''
            };
        } else if (result.is_valid !== undefined) {
            return { 
                success: result.is_valid, 
                errors: result.errors || [],
                message: result.message || ''
            };
        } else {
            return { success: false, errors: ['Unexpected response format'] };
        }
        
    } catch (error) {
        return { 
            success: false, 
            errors: [`Network Error: ${error.message}`] 
        };
    }
}

// Function to validate face image with API
async function validateFaceWithAPI(faceImageData) {
    try {
        const apiUrl = '/Auth/ValidateFaceImage';
        
        // Get anti-forgery token
        const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;
        
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                face_image: faceImageData
            })
        };
        
        // Only add the token if it exists
        if (token) {
            requestOptions.headers["RequestVerificationToken"] = token;
        }

        const response = await fetch(apiUrl, requestOptions);
        const responseText = await response.text();

        if (!response.ok) {
            return { 
                success: false, 
                message: `API Error ${response.status}: ${response.statusText}` 
            };
        }

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (jsonError) {
            return { success: false, message: 'Invalid response format from server' };
        }
        
        return {
            success: result.success || false,
            message: result.message || 'Face validation completed'
        };
        
    } catch (error) {
        return { 
            success: false, 
            message: `Network Error: ${error.message}` 
        };
    }
}

// Create Step 2 HTML content
function createStep2HTML() {
    return `
        <div class="p-6 h-full animate-slide-in-right">
            <!-- Progress Indicator -->
            <div class="mb-6">
                <div class="flex items-center justify-center space-x-2">
                    <div class="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">✓</div>
                    <div class="w-12 h-1 bg-blue-600 rounded"></div>
                    <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">2</div>
                    <div class="w-12 h-1 bg-gray-300 rounded"></div>
                    <div class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 text-xs font-semibold">3</div>
                    <div class="w-12 h-1 bg-gray-300 rounded"></div>
                    <div class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 text-xs font-semibold">4</div>
                </div>
                <div class="text-center mt-2 text-xs text-gray-600">Step 2: Face Recognition Setup</div>
            </div>

            <!-- Success Message -->
            <div id="step2SuccessMessage" class="hidden mb-4 rounded-lg bg-green-50 border border-green-200 p-3 animate-slide-down">
                <div class="flex items-center">
                    <svg class="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    <p class="text-sm font-medium text-green-800">Face photo captured and validated successfully!</p>
                </div>
            </div>

            <!-- Face Recognition Section -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                <div class="text-center">
                    <div class="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                    </div>
                    <h2 class="text-xl font-bold text-gray-800 mb-2">Face Recognition Setup</h2>
                    <p class="text-gray-600 text-sm mb-6">
                        Take a clear photo of your face for secure attendance tracking
                    </p>
                </div>

                <!-- Photo Preview -->
                <div class="bg-white rounded-lg p-4 mb-4">
                    <div id="photoPreview" class="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div class="text-center">
                            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                            </svg>
                            <p class="text-gray-500 text-sm mb-2">No photo captured yet</p>
                            <p class="text-gray-400 text-xs">Click the button below to take your photo</p>
                        </div>
                    </div>
                </div>

                <!-- Capture Button -->
                <button id="capturePhotoBtn" class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                    <svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                    </svg>
                    Take Photo
                </button>
            </div>

            <!-- Important Notes -->
            <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-6">
                <div class="flex items-start">
                    <svg class="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <div>
                        <h4 class="text-sm font-medium text-yellow-800 mb-2">Important Notes:</h4>
                        <ul class="text-xs text-yellow-700 space-y-1">
                            <li>• This photo will be used for facial recognition during attendance</li>
                            <li>• Make sure your face is clearly visible and well-lit</li>
                            <li>• Avoid wearing sunglasses or face coverings</li>
                            <li>• You can retake the photo if you're not satisfied</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex space-x-3">
                <button id="backToStep1Button" class="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm">
                    <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"></path>
                    </svg>
                    Back to Step 1
                </button>
                <button id="continueToFinalButton" class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    <span id="continueButtonText">Continue to Next Step</span>
                    <svg id="continueSpinner" class="hidden animate-spin -mr-1 ml-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg class="inline ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

// Function to show success message in step 2
function showStep2SuccessMessage(message) {
    const successMessage = document.getElementById('step2SuccessMessage');
    if (successMessage) {
        // Find the paragraph element or create one if it doesn't exist
        let messageP = successMessage.querySelector('p');
        if (!messageP) {
            messageP = document.createElement('p');
            messageP.className = 'text-sm font-medium text-green-800';
            successMessage.querySelector('.flex').appendChild(messageP);
        }
        messageP.textContent = message;
        successMessage.classList.remove('hidden');
    }
    
    // Hide any error messages
    const errorMessage = document.getElementById('step2ErrorMessage');
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
}

// Function to show error message in step 2
function showStep2ErrorMessage(message) {
    // Create error message element if it doesn't exist
    let errorMessage = document.getElementById('step2ErrorMessage');
    if (!errorMessage) {
        const errorHTML = `
            <div id="step2ErrorMessage" class="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 animate-slide-down">
                <div class="flex items-center">
                    <svg class="w-4 h-4 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                    </svg>
                    <p class="text-sm font-medium text-red-800"></p>
                </div>
            </div>
        `;
        
        // Insert after progress indicator
        const progressIndicator = document.querySelector('.mb-6');
        if (progressIndicator) {
            progressIndicator.insertAdjacentHTML('afterend', errorHTML);
            errorMessage = document.getElementById('step2ErrorMessage');
        }
    }
    
    if (errorMessage) {
        errorMessage.querySelector('p').textContent = message;
        errorMessage.classList.remove('hidden');
    }
    
    // Hide success message
    const successMessage = document.getElementById('step2SuccessMessage');
    if (successMessage) {
        successMessage.classList.add('hidden');
    }
}

// Initialize Step 2 functionality
function initializeStep2() {
    let capturedPhoto = null;
    
    // Smooth scroll to top when step 2 initializes with delay
    setTimeout(() => {
        scrollToTopOfSection();
    }, 300);
    
    // Create camera modal
    createCameraModal();
    
    // Photo capture functionality with face validation
    const captureBtn = document.getElementById('capturePhotoBtn');
    if (captureBtn) {
        captureBtn.addEventListener('click', function() {
            openCameraModal(async function(photoData) {
                // Show loading state on capture button
                const captureBtn = document.getElementById('capturePhotoBtn');
                const originalBtnText = captureBtn.innerHTML;
                captureBtn.innerHTML = `
                    <svg class="animate-spin w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Validating Face...
                `;
                captureBtn.disabled = true;
                
                try {
                    // Validate face image with API
                    const faceValidationResult = await validateFaceWithAPI(photoData);
                    
                    if (faceValidationResult.success) {
                        capturedPhoto = photoData;
                        displayCapturedPhoto(photoData);
                        document.getElementById('continueToFinalButton').disabled = false;
                        showStep2SuccessMessage(faceValidationResult.message || 'Face photo captured and validated successfully!');
                        
                        // Reset capture button to retake state
                        captureBtn.innerHTML = `
                            <svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"></path>
                            </svg>
                            Retake Photo
                        `;
                        captureBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                        captureBtn.classList.add('bg-orange-600', 'hover:bg-orange-700');
                        captureBtn.disabled = false;
                    } else {
                        showStep2ErrorMessage(faceValidationResult.message || 'Face validation failed. Please try again with a clearer photo.');
                        // Reset capture button to allow retry
                        captureBtn.innerHTML = originalBtnText;
                        captureBtn.disabled = false;
                    }
                } catch (error) {
                    showStep2ErrorMessage('Face validation failed. Please try again.');
                    // Reset capture button to allow retry
                    captureBtn.innerHTML = originalBtnText;
                    captureBtn.disabled = false;
                }
                
                // Smooth scroll to top to show result message
                setTimeout(() => {
                    scrollToTopOfSection();
                }, 200);
            });
        });
    } else {
        console.error('Capture button not found!');
    }
    
    // Back to step 1
    document.getElementById('backToStep1Button').addEventListener('click', function() {
        sessionStorage.removeItem('registrationData');
        
        // Smooth scroll to top before reloading
        scrollToTopOfSection();
        
        setTimeout(() => {
            window.location.reload();
        }, 600);
    });
    
    // Complete registration
    document.getElementById('continueToFinalButton').addEventListener('click', function() {
        if (!capturedPhoto) {
            showStep2ErrorMessage('Please take a photo before continuing.');
            return;
        }
        
        // Set loading state for step 2 button
        const continueBtn = this;
        const buttonText = document.getElementById('continueButtonText');
        const spinner = document.getElementById('continueSpinner');
        
        continueBtn.disabled = true;
        if (buttonText) buttonText.textContent = 'Processing...';
        if (spinner) spinner.classList.remove('hidden');
        
        // Remove any existing processing glow and add it fresh
        continueBtn.classList.remove('processing-glow');
        setTimeout(() => continueBtn.classList.add('processing-glow'), 100);
        
        // Show initial processing message
        showStep2SuccessMessage('Preparing to send verification code...');
        
        // Wait a moment before starting the OTP process
        setTimeout(async () => {
            await sendOTPAndProceed(capturedPhoto);
        }, 500);
    });
}

// Function to send OTP and proceed to step 3
async function sendOTPAndProceed(photoData) {
    const continueBtn = document.getElementById('continueToFinalButton');
    const buttonText = document.getElementById('continueButtonText');
    const spinner = document.getElementById('continueSpinner');
    
    try {
        const registrationData = JSON.parse(sessionStorage.getItem('registrationData') || '{}');
        
        // Store face image for potential resend
        sessionStorage.setItem('faceImage', photoData);
        
        // Show processing message
        showStep2SuccessMessage('Sending verification code to your email...');
        
        // Send OTP
        const otpResult = await sendRegistrationOTP(registrationData, photoData);
        
        if (otpResult.success) {
            // Store OTP ID for verification
            if (otpResult.otp_id) {
                sessionStorage.setItem('otpId', otpResult.otp_id);
            }
            
            showStep2SuccessMessage('Verification code sent! Redirecting to verification step...');
            
            // Update button to show success
            if (buttonText) buttonText.textContent = 'Code Sent Successfully!';
            if (continueBtn) {
                continueBtn.classList.remove('from-blue-600', 'to-indigo-600');
                continueBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            }
            
            // Redirect to step 3 after showing success
            setTimeout(() => {
                window.location.href = '/Auth/RegisterStep3';
            }, 2000);
            
        } else {
            showStep2ErrorMessage(otpResult.message || 'Failed to send verification code. Please try again.');
            resetStep2Button();
        }
        
    } catch (error) {
        console.error('OTP sending failed:', error);
        showStep2ErrorMessage('Failed to send OTP. Please try again.');
        resetStep2Button();
    }
}

// Helper function to reset step 2 button state
function resetStep2Button() {
    const continueBtn = document.getElementById('continueToFinalButton');
    const buttonText = document.getElementById('continueButtonText');
    const spinner = document.getElementById('continueSpinner');
    
    if (continueBtn) {
        continueBtn.disabled = false;
        continueBtn.classList.remove('processing-glow', 'bg-green-600', 'hover:bg-green-700');
        continueBtn.classList.add('bg-gradient-to-r', 'from-blue-600', 'to-indigo-600', 'hover:from-blue-700', 'hover:to-indigo-700');
    }
    
    if (buttonText) buttonText.textContent = 'Continue to Next Step';
    if (spinner) spinner.classList.add('hidden');
    
    // Scroll to show error message
    setTimeout(() => {
        scrollToTopOfSection();
    }, 400);
}

// Function to send OTP for registration
async function sendRegistrationOTP(registrationData, faceImage) {
    try {
        const apiUrl = '/Auth/SendRegistrationOTP';
        
        const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;
        
        const requestData = {
            registration_data: registrationData,
            face_image: faceImage
        };
        
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(requestData)
        };
        
        if (token) {
            requestOptions.headers["RequestVerificationToken"] = token;
        }

        const response = await fetch(apiUrl, requestOptions);
        const responseText = await response.text();

        if (!response.ok) {
            return { 
                success: false, 
                message: `API Error ${response.status}: ${response.statusText}` 
            };
        }

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (jsonError) {
            return { success: false, message: 'Invalid response format from server' };
        }
        
        return {
            success: result.success || false,
            message: result.message || 'OTP sending completed',
            otp_id: result.otp_id || null
        };
        
    } catch (error) {
        return { 
            success: false, 
            message: `Network Error: ${error.message}` 
        };
    }
}

// Function to transition to Step 2 content
function transitionToStep2() {
    const registerSection = document.getElementById('registerSection');
    const currentContent = registerSection.querySelector('.h-full');
    
    currentContent.classList.add('animate-slide-out-right');
    
    setTimeout(() => {
        currentContent.innerHTML = createStep2HTML();
        currentContent.classList.remove('animate-slide-out-right');
        
        // Smooth scroll to top after content change with delay
        setTimeout(() => {
            scrollToTopOfSection();
        }, 100); // Small delay to ensure content is rendered
        
        initializeStep2();
    }, 200);
}

// Function to scroll to top of the current section
function scrollToTopOfSection() {
    // Scroll the register section content to top smoothly
    const registerSection = document.getElementById('registerSection');
    const registerContent = registerSection.querySelector('.h-full');
    
    if (registerContent) {
        registerContent.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Also scroll main modal container to top smoothly
    const mainModal = document.querySelector('.w-full.max-w-6xl.h-\\[700px\\]');
    if (mainModal) {
        mainModal.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Smooth scroll window to ensure modal is in view
    const modalContainer = document.querySelector('.flex.items-center.justify-center.min-h-screen');
    if (modalContainer) {
        modalContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
        });
    }
}

// Create camera modal
function createCameraModal() {
    if (document.getElementById('cameraModal')) return;
    
    const modalHTML = `
        <div id="cameraModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold text-gray-900">Take Your Photo</h3>
                            <button id="closeCameraModal" class="text-gray-400 hover:text-gray-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <div class="mb-4">
                            <video id="cameraVideo" class="w-full h-64 bg-gray-100 rounded-lg" autoplay playsinline></video>
                            <canvas id="cameraCanvas" class="hidden"></canvas>
                        </div>
                        
                        <div class="flex space-x-3">
                            <button id="captureBtn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                Capture Photo
                            </button>
                            <button id="cancelCameraBtn" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Camera modal functions
let cameraStream = null;
let cameraCallback = null;

function openCameraModal(callback) {
    cameraCallback = callback;
    document.getElementById('cameraModal').classList.remove('hidden');
    
    // Smooth scroll modal content to top when camera opens
    const cameraModalContent = document.querySelector('#cameraModal .bg-white');
    if (cameraModalContent) {
        cameraModalContent.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            cameraStream = stream;
            document.getElementById('cameraVideo').srcObject = stream;
        })
        .catch(err => {
            console.error('Camera error:', err);
            alert('Unable to access camera. Using test photo.');
            callback('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAAEAAQMBEQACEQEDEQH/xAAUAAEAAAAAAAAAAAAAAAAAAAAA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdAA==');
            closeCameraModal();
        });
}

function closeCameraModal() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    document.getElementById('cameraModal').classList.add('hidden');
}

function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
    if (cameraCallback) {
        cameraCallback(dataURL);
    }
    closeCameraModal();
}

function displayCapturedPhoto(photoData) {
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = `<img src="${photoData}" class="w-full h-full object-cover rounded-lg" alt="Captured photo">`;
    
    const captureBtn = document.getElementById('capturePhotoBtn');
    captureBtn.innerHTML = `
        <svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"></path>
        </svg>
        Retake Photo
    `;
    captureBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    captureBtn.classList.add('bg-orange-600', 'hover:bg-orange-700');
}

// Global function to reset registration form
window.resetRegistrationForm = function() {
    sessionStorage.removeItem('registrationData');
    sessionStorage.removeItem('faceImage'); // Clear stored face image
    sessionStorage.removeItem('otpId'); // Clear OTP ID
    localStorage.removeItem('otpCooldownEnd'); // Clear cooldown
    
    if (form) {
        form.reset();
        hideErrors();
        const successMessage = document.getElementById('successMessage');
        if (successMessage) successMessage.classList.add('hidden');
        
        const passwordStrength = document.getElementById('passwordStrength');
        if (passwordStrength) passwordStrength.classList.add('hidden');
        
        const confirmPassword = document.getElementById('confirm_password');
        if (confirmPassword) {
            confirmPassword.classList.remove('border-red-300', 'border-green-300');
        }
        
        // Reset password field styling
        const passwordField = document.getElementById('password');
        if (passwordField) {
            passwordField.classList.remove('border-red-300', 'border-green-300');
        }
        
        setLoadingState(false);
        
        // Reset all form field styling
        const allInputs = form.querySelectorAll('input, select, textarea');
        allInputs.forEach(input => {
            input.classList.remove('border-red-300', 'border-green-300', 'bg-red-50', 'bg-green-50');
            input.classList.add('border-gray-300');
        });
        
        // Smooth scroll to top after reset with delay
        setTimeout(() => {
            scrollToTopOfSection();
        }, 100);
        
        console.log('Registration form completely reset');
    }
};

// Enhanced function to completely reset all registration state
window.resetAllRegistrationState = function() {
    // Call the form reset
    if (window.resetRegistrationForm) {
        window.resetRegistrationForm();
    }
    
    // Clear any camera modal state
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    const cameraModal = document.getElementById('cameraModal');
    if (cameraModal) {
        cameraModal.classList.add('hidden');
    }
    
    // Reset step 1 button
    const step1Button = document.getElementById('submitButton');
    if (step1Button) {
        step1Button.disabled = false;
        step1Button.classList.remove('opacity-75');
        
        const step1ButtonText = document.getElementById('buttonText');
        const step1Spinner = document.getElementById('buttonSpinner');
        
        if (step1ButtonText) step1ButtonText.textContent = 'Continue to Next Step';
        if (step1Spinner) step1Spinner.classList.add('hidden');
    }
    
    // Reset step 2 photo preview
    const photoPreview = document.getElementById('photoPreview');
    if (photoPreview) {
        photoPreview.innerHTML = `
            <div class="text-center">
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                </svg>
                <p class="text-gray-500 text-sm mb-2">No photo captured yet</p>
                <p class="text-gray-400 text-xs">Click the button below to take your photo</p>
            </div>
        `;
    }
    
    // Reset capture button
    const captureBtn = document.getElementById('capturePhotoBtn');
    if (captureBtn) {
        captureBtn.innerHTML = `
            <svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
            </svg>
            Take Photo
        `;
        captureBtn.classList.remove('bg-orange-600', 'hover:bg-orange-700');
        captureBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        captureBtn.disabled = false;
    }
    
    // Reset step 2 continue button completely
    const continueBtn = document.getElementById('continueToFinalButton');
    if (continueBtn) {
        continueBtn.disabled = true; // Should be disabled until photo is taken
        continueBtn.classList.remove('processing-glow', 'bg-green-600', 'hover:bg-green-700');
        continueBtn.classList.add('bg-gradient-to-r', 'from-blue-600', 'to-indigo-600', 'hover:from-blue-700', 'hover:to-indigo-700');
        
        const continueButtonText = document.getElementById('continueButtonText');
        const continueSpinner = document.getElementById('continueSpinner');
        
        if (continueButtonText) continueButtonText.textContent = 'Continue to Next Step';
        if (continueSpinner) continueSpinner.classList.add('hidden');
    }
    
    // Reset step 3 OTP inputs
    const otpInputs = document.querySelectorAll('[id^="otp"]');
    otpInputs.forEach(input => {
        if (input) {
            input.value = '';
            input.classList.remove('border-red-500', 'border-green-500');
            input.classList.add('border-gray-300');
        }
    });
    
    // Reset step 3 verify button
    const verifyBtn = document.getElementById('verifyOtpBtn');
    if (verifyBtn) {
        verifyBtn.disabled = true;
        verifyBtn.classList.remove('bg-green-600', 'hover:bg-green-700', 'processing-glow');
        verifyBtn.classList.add('bg-green-600', 'hover:bg-green-700'); // Default green for verify button
        
        const verifyText = document.getElementById('verifyButtonText');
        const verifySpinner = document.getElementById('verifySpinner');
        
        if (verifyText) verifyText.textContent = 'Verify & Complete Registration';
        if (verifySpinner) verifySpinner.classList.add('hidden');
    }
    
    // Hide all step messages
    const step2Success = document.getElementById('step2SuccessMessage');
    const step2Error = document.getElementById('step2ErrorMessage');
    if (step2Success) step2Success.classList.add('hidden');
    if (step2Error) step2Error.classList.add('hidden');
    
    console.log('All registration state and buttons completely reset');
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize form elements first
    initializeFormElements();
    
    // Only proceed if we're on step 1 (form exists)
    if (!form) {
        return;
    }
    
    // Check if we should reset to step 1 due to completion
    const registrationCompleted = localStorage.getItem('registrationCompleted');
    if (registrationCompleted) {
        localStorage.removeItem('registrationCompleted');
        
        // Reset everything to step 1 state
        window.resetAllRegistrationState();
        
        console.log('Registration was completed, form reset to step 1');
    }

    // Password field event listeners
    if (document.getElementById("password")) {
        document.getElementById("password").addEventListener("input", function() {
            checkPasswordStrength(this.value);
            
            const confirmPassword = document.getElementById("confirm_password").value;
            if (confirmPassword && this.value !== confirmPassword) {
                document.getElementById("confirm_password").classList.add("border-red-300");
            } else if (confirmPassword) {
                document.getElementById("confirm_password").classList.remove("border-red-300");
                document.getElementById("confirm_password").classList.add("border-green-300");
            }
        });
    }

    if (document.getElementById("confirm_password")) {
        document.getElementById("confirm_password").addEventListener("input", function() {
            const password = document.getElementById("password").value;
            
            if (this.value && password !== this.value) {
                this.classList.add("border-red-300");
                this.classList.remove("border-green-300");
            } else if (this.value && password === this.value) {
                this.classList.remove("border-red-300");
                this.classList.add("border-green-300");
            } else {
                this.classList.remove("border-red-300", "border-green-300");
            }
        });
    }

    // Password visibility toggles
    function setupPasswordToggle(passwordId, toggleId) {
        const passwordField = document.getElementById(passwordId);
        const toggleButton = document.getElementById(toggleId);
        
        if (passwordField && toggleButton) {
            toggleButton.addEventListener('click', function() {
                const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordField.setAttribute('type', type);
                
                this.innerHTML = type === 'password' ? 
                    `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>` :
                    `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                    </svg>`;
            });
        }
    }

    setupPasswordToggle('password', 'togglePassword');
    setupPasswordToggle('confirm_password', 'toggleConfirmPassword');

    // Auto-format contact number
    const contactField = document.getElementById("contact_number");
    if (contactField) {
        contactField.addEventListener("input", function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            
            if (value.length >= 4 && value.length <= 7) {
                value = value.replace(/(\d{4})(\d{1,3})/, '$1 $2');
            } else if (value.length >= 8) {
                value = value.replace(/(\d{4})(\d{3})(\d{1,4})/, '$1 $2 $3');
            }
            
            this.value = value;
        });
    }

    // Auto-format student number
    const studentField = document.getElementById("student_number");
    if (studentField) {
        studentField.addEventListener("input", function() {
            this.value = this.value.toUpperCase();
        });
    }

    // Form submission
    if (submitButton) {
        submitButton.addEventListener("click", async (event) => {
            event.preventDefault();
            
            setLoadingState(true);
            hideErrors();

            try {
                const year = form.year.value.trim();
                const month = form.month.value.trim().padStart(2, "0");
                const day = form.day.value.trim().padStart(2, "0");

                const formData = {
                    first_name: form.first_name.value.trim(),
                    last_name: form.last_name.value.trim(),
                    birthday: `${year}-${month}-${day}`,
                    contact_number: form.contact_number.value.trim(),
                    student_number: form.student_number.value.trim(),
                    email: form.email.value.trim(),
                    password: form.password.value.trim(),
                    confirm_password: form.confirm_password.value.trim(),
                    terms: form.terms.checked,
                };

                // Local validation first (including confirm_password and terms that API doesn't check)
                const localErrors = [];
                localErrors.push(...validateRequiredFields(formData));
                localErrors.push(...validatePasswords(formData.password, formData.confirm_password));
                
                if (localErrors.length > 0) {
                    displayErrors(localErrors);
                    setTimeout(() => {
                        scrollToTopOfSection();
                    }, 100);
                    return;
                }

                // API validation (server-side + database checks)
                const validationResult = await validateWithAPI(formData);

                if (!validationResult.success) {
                    displayErrors(validationResult.errors || ['Unknown validation error']);
                    setTimeout(() => {
                        scrollToTopOfSection();
                    }, 100);
                } else {
                    showSuccess(validationResult.message || "Registration validation successful!");
                    sessionStorage.setItem('registrationData', JSON.stringify(formData));
                    
                    setTimeout(() => {
                        scrollToTopOfSection();
                    }, 100);
                    
                    setTimeout(() => {
                        transitionToStep2();
                    }, 1200);
                }
                
            } catch (error) {
                displayErrors([`Unexpected error: ${error.message}`]);
                setTimeout(() => {
                    scrollToTopOfSection();
                }, 100);
            } finally {
                setLoadingState(false);
            }
        });
    }

    // Camera modal event listeners
    document.addEventListener('click', function(e) {
        if (e.target.id === 'captureBtn') {
            capturePhoto();
        } else if (e.target.id === 'cancelCameraBtn' || e.target.id === 'closeCameraModal') {
            closeCameraModal();
        } else if (e.target.id === 'cameraModal') {
            closeCameraModal();
        }
    });

    // Pre-fill test data (keep this for easier testing)
    if (document.getElementById('first_name')) {
        document.getElementById('first_name').value = 'Juan';
        document.getElementById('last_name').value = 'Dela Cruz';
        document.getElementById('day').value = '15';
        document.getElementById('month').value = '8';
        document.getElementById('year').value = '1999';
        document.getElementById('contact_number').value = '09123456789';
        document.getElementById('student_number').value = '2023-CM0001';
        document.getElementById('email').value = 'johnmathewcparocha@iskolarngbayan.pup.edu.ph';
        document.getElementById('password').value = 'TestPass123!';
        document.getElementById('confirm_password').value = 'TestPass123!';
        document.getElementById('terms').checked = true;
        checkPasswordStrength('TestPass123!');
    }
});