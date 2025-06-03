// Configuration - Uses ASP.NET Core backend API

// Select form elements
const form = document.getElementById("registrationForm");
const validationMessages = document.getElementById("validationMessages");
const successMessage = document.getElementById("successMessage");
const errorList = document.getElementById("errorList");
const submitButton = document.getElementById("submitButton");
const buttonText = document.getElementById("buttonText");
const buttonSpinner = document.getElementById("buttonSpinner");

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
        // Remove all non-digit characters and check if exactly 11 digits
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

// Real-time password validation
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

// Password visibility toggles
function setupPasswordToggle(passwordId, toggleId) {
    const passwordField = document.getElementById(passwordId);
    const toggleButton = document.getElementById(toggleId);
    
    toggleButton.addEventListener('click', function() {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        
        // Toggle eye icon (you can enhance this with different icons)
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

setupPasswordToggle('password', 'togglePassword');
setupPasswordToggle('confirm_password', 'toggleConfirmPassword');

// Function to send form data to the API for validation
async function validateWithAPI(formData) {
    console.log('=== API Validation Started ===');
    console.log('Form Data to send:', formData);
    
    try {
        const apiUrl = '/Auth/ValidateRegistration';
        console.log('Making request to:', apiUrl);

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "RequestVerificationToken": document.querySelector('input[name="__RequestVerificationToken"]')?.value || ''
            },
            body: JSON.stringify(formData)
        };
        
        console.log('Request options:', requestOptions);

        const response = await fetch(apiUrl, requestOptions);
        
        console.log('Response received:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        if (!response.ok) {
            console.warn(`API returned ${response.status}: ${response.statusText}`);
            const errorText = await response.text();
            console.log('Error response body:', errorText);
            
            return { 
                success: false, 
                errors: [`API Error ${response.status}: ${response.statusText}`] 
            };
        }

        const result = await response.json();
        console.log('API Response:', result);
        return result;
        
    } catch (error) {
        console.error('API Validation Error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        return { 
            success: false, 
            errors: [`Network Error: ${error.message}`] 
        };
    }
}

// Loading state management
function setLoadingState(loading) {
    if (loading) {
        submitButton.disabled = true;
        buttonText.textContent = "Validating...";
        buttonSpinner.classList.remove("hidden");
        submitButton.classList.add("opacity-75");
    } else {
        submitButton.disabled = false;
        buttonText.textContent = "Continue to Next Step";
        buttonSpinner.classList.add("hidden");
        submitButton.classList.remove("opacity-75");
    }
}

// Handle form submission
submitButton.addEventListener("click", async (event) => {
    event.preventDefault();
    console.log('=== FORM SUBMISSION STARTED ===');
    
    setLoadingState(true);
    hideErrors();

    try {
        // Collect form data
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

        console.log('Form data collected:', formData);

        // Perform local validation first
        console.log('Starting local validation...');
        const localErrors = [];
        localErrors.push(...validateRequiredFields(formData));
        localErrors.push(...validatePasswords(formData.password, formData.confirm_password));
        
        if (localErrors.length > 0) {
            console.log('Local validation failed:', localErrors);
            displayErrors(localErrors);
            setLoadingState(false);
            return;
        }

        console.log('Local validation passed');

        // Try API validation
        console.log('Starting API validation...');
        const validationResult = await validateWithAPI(formData);
        console.log('API validation completed:', validationResult);

        if (!validationResult.success) {
            console.log('API validation failed:', validationResult.errors);
            displayErrors(validationResult.errors || ['Unknown validation error']);
        } else {
            console.log('All validation passed - showing success');
            showSuccess("Registration validation successful!");
            
            // Just show success for now
            setTimeout(() => {
                alert("Form validation completed successfully!");
            }, 1000);
        }
        
    } catch (error) {
        console.error('=== UNEXPECTED ERROR ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        displayErrors([`Unexpected error: ${error.message}`]);
    } finally {
        console.log('=== FORM SUBMISSION ENDED ===');
        setLoadingState(false);
    }
});

// Auto-format contact number to exactly 11 digits
document.getElementById("contact_number").addEventListener("input", function() {
    let value = this.value.replace(/\D/g, ''); // Remove all non-digits
    
    // Limit to 11 digits
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    
    // Format with spacing for readability but store as digits only
    if (value.length >= 4 && value.length <= 7) {
        value = value.replace(/(\d{4})(\d{1,3})/, '$1 $2');
    } else if (value.length >= 8) {
        value = value.replace(/(\d{4})(\d{3})(\d{1,4})/, '$1 $2 $3');
    }
    
    this.value = value;
});

// Auto-format student number to uppercase
document.getElementById("student_number").addEventListener("input", function() {
    this.value = this.value.toUpperCase();
});

// Form field animations on focus
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('transform', 'scale-[1.02]');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('transform', 'scale-[1.02]');
    });
});

// Pre-fill form with test data for faster testing
function prefillTestData() {
    // Only pre-fill in development/testing environment
    // You can remove this or add a condition to check environment
    document.getElementById('first_name').value = 'Juan';
    document.getElementById('last_name').value = 'Dela Cruz';
    document.getElementById('day').value = '15';
    document.getElementById('month').value = '8';
    document.getElementById('year').value = '1999';
    document.getElementById('contact_number').value = '09123456789';
    document.getElementById('student_number').value = 'STU2023001';
    document.getElementById('email').value = 'juan.delacruz@iskolarngbayan.pup.edu.ph';
    document.getElementById('password').value = 'TestPass123!';
    document.getElementById('confirm_password').value = 'TestPass123!';
    document.getElementById('terms').checked = true;
    
    // Trigger password strength check
    checkPasswordStrength('TestPass123!');
    
    console.log('Test data pre-filled for faster testing');
}

// Initialize configuration when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Pre-fill test data for development
    prefillTestData();
});