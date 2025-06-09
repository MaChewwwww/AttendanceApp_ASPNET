// Student Onboarding Modal JavaScript

// Mock data for demonstration - replace with actual API calls later
const mockPrograms = {
    'bscs': {
        name: 'Bachelor of Science in Computer Science',
        sections: [
            { id: 'bscs-4a', name: 'BSCS 4-A', year: 4 },
            { id: 'bscs-4b', name: 'BSCS 4-B', year: 4 },
            { id: 'bscs-3a', name: 'BSCS 3-A', year: 3 },
            { id: 'bscs-3b', name: 'BSCS 3-B', year: 3 },
            { id: 'bscs-2a', name: 'BSCS 2-A', year: 2 },
            { id: 'bscs-2b', name: 'BSCS 2-B', year: 2 },
            { id: 'bscs-1a', name: 'BSCS 1-A', year: 1 },
            { id: 'bscs-1b', name: 'BSCS 1-B', year: 1 }
        ]
    },
    'bsit': {
        name: 'Bachelor of Science in Information Technology',
        sections: [
            { id: 'bsit-4a', name: 'BSIT 4-A', year: 4 },
            { id: 'bsit-4b', name: 'BSIT 4-B', year: 4 },
            { id: 'bsit-3a', name: 'BSIT 3-A', year: 3 },
            { id: 'bsit-3b', name: 'BSIT 3-B', year: 3 },
            { id: 'bsit-2a', name: 'BSIT 2-A', year: 2 },
            { id: 'bsit-2b', name: 'BSIT 2-B', year: 2 },
            { id: 'bsit-1a', name: 'BSIT 1-A', year: 1 },
            { id: 'bsit-1b', name: 'BSIT 1-B', year: 1 }
        ]
    },
    'bsce': {
        name: 'Bachelor of Science in Computer Engineering',
        sections: [
            { id: 'bsce-4a', name: 'BSCpE 4-A', year: 4 },
            { id: 'bsce-3a', name: 'BSCpE 3-A', year: 3 },
            { id: 'bsce-2a', name: 'BSCpE 2-A', year: 2 },
            { id: 'bsce-1a', name: 'BSCpE 1-A', year: 1 }
        ]
    },
    'bsis': {
        name: 'Bachelor of Science in Information Systems',
        sections: [
            { id: 'bsis-4a', name: 'BSIS 4-A', year: 4 },
            { id: 'bsis-3a', name: 'BSIS 3-A', year: 3 },
            { id: 'bsis-2a', name: 'BSIS 2-A', year: 2 },
            { id: 'bsis-1a', name: 'BSIS 1-A', year: 1 }
        ]
    }
};

const mockCourses = {
    'bscs-4a': [
        { id: 'cs401', code: 'CS 401', name: 'Software Engineering 2', units: 3, instructor: 'Dr. Smith' },
        { id: 'cs402', code: 'CS 402', name: 'Database Systems 2', units: 3, instructor: 'Prof. Johnson' },
        { id: 'cs403', code: 'CS 403', name: 'Computer Networks', units: 3, instructor: 'Dr. Williams' },
        { id: 'cs404', code: 'CS 404', name: 'Artificial Intelligence', units: 3, instructor: 'Prof. Brown' },
        { id: 'cs405', code: 'CS 405', name: 'Capstone Project 2', units: 3, instructor: 'Dr. Davis' }
    ],
    'bscs-4b': [
        { id: 'cs401', code: 'CS 401', name: 'Software Engineering 2', units: 3, instructor: 'Dr. Smith' },
        { id: 'cs402', code: 'CS 402', name: 'Database Systems 2', units: 3, instructor: 'Prof. Anderson' },
        { id: 'cs403', code: 'CS 403', name: 'Computer Networks', units: 3, instructor: 'Dr. Wilson' },
        { id: 'cs404', code: 'CS 404', name: 'Artificial Intelligence', units: 3, instructor: 'Prof. Brown' },
        { id: 'cs405', code: 'CS 405', name: 'Capstone Project 2', units: 3, instructor: 'Dr. Miller' }
    ],
    'bsit-4a': [
        { id: 'it401', code: 'IT 401', name: 'Systems Integration', units: 3, instructor: 'Prof. Garcia' },
        { id: 'it402', code: 'IT 402', name: 'IT Project Management', units: 3, instructor: 'Dr. Martinez' },
        { id: 'it403', code: 'IT 403', name: 'Cybersecurity', units: 3, instructor: 'Prof. Lopez' },
        { id: 'it404', code: 'IT 404', name: 'Cloud Computing', units: 3, instructor: 'Dr. Rodriguez' },
        { id: 'it405', code: 'IT 405', name: 'Capstone Project', units: 3, instructor: 'Prof. Hernandez' }
    ]
};

// Global variables
let selectedProgram = '';
let selectedSection = '';
let availableCourses = [];

// Show onboarding modal
function showOnboardingModal() {
    console.log('showOnboardingModal called');
    
    const modal = document.getElementById('onboardingModal');
    const modalContent = document.getElementById('onboardingModalContent');
    
    if (!modal) {
        console.error('Onboarding modal element not found');
        return;
    }
    
    if (!modalContent) {
        console.error('Onboarding modal content element not found');
        return;
    }
    
    console.log('Showing onboarding modal...');
    
    // Add blur effect to layout elements
    addLayoutBlur();
    
    // Prevent body scroll and outside interactions
    document.body.style.overflow = 'hidden';
    document.body.style.pointerEvents = 'none';
    
    // Show modal
    modal.classList.remove('hidden');
    modal.style.pointerEvents = 'auto'; // Allow modal interactions
    
    // Start entrance animation sequence
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
        
        // Animate modal icon
        const modalIcon = document.getElementById('modalIcon');
        if (modalIcon) {
            modalIcon.classList.remove('scale-0');
            modalIcon.classList.add('scale-100');
        }
        
        // Animate title and description
        setTimeout(() => {
            const modalTitle = document.getElementById('modalTitle');
            const modalDescription = document.getElementById('modalDescription');
            
            if (modalTitle) {
                modalTitle.classList.remove('translate-y-4', 'opacity-0');
                modalTitle.classList.add('translate-y-0', 'opacity-100');
            }
            
            if (modalDescription) {
                modalDescription.classList.remove('translate-y-4', 'opacity-0');
                modalDescription.classList.add('translate-y-0', 'opacity-100');
            }
        }, 200);
        
        // Animate form elements
        setTimeout(() => {
            const onboardingForm = document.getElementById('onboardingForm');
            const programSection = document.getElementById('programSection');
            const sectionSelection = document.getElementById('sectionSelectionDiv');
            const modalButtons = document.getElementById('modalButtons');
            const infoSection = document.getElementById('infoSection');
            
            if (onboardingForm) {
                onboardingForm.classList.remove('translate-y-6', 'opacity-0');
                onboardingForm.classList.add('translate-y-0', 'opacity-100');
            }
            
            // Staggered animation for form sections
            const sections = [programSection, sectionSelection, modalButtons, infoSection];
            sections.forEach((section, index) => {
                if (section) {
                    setTimeout(() => {
                        section.classList.remove('translate-x-4', 'opacity-0', 'translate-y-4');
                        section.classList.add('translate-x-0', 'opacity-100', 'translate-y-0');
                    }, index * 100);
                }
            });
        }, 400);
        
    }, 50);
    
    // Initialize form
    initializeOnboardingForm();
    
    // Add event listeners to prevent outside clicks
    modal.addEventListener('click', handleModalBackdropClick);
    
    console.log('Onboarding modal shown successfully');
}

// Close onboarding modal
function closeOnboardingModal() {
    const modal = document.getElementById('onboardingModal');
    const modalContent = document.getElementById('onboardingModalContent');
    
    if (modal && modalContent) {
        console.log('Closing onboarding modal...');
        
        // Add exit animation
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
        
        // Animate elements out in reverse order
        const elementsToHide = [
            'infoSection',
            'modalButtons', 
            'sectionSelectionDiv',
            'programSection',
            'onboardingForm',
            'modalDescription',
            'modalTitle',
            'modalIcon'
        ];
        
        elementsToHide.forEach((elementId, index) => {
            const element = document.getElementById(elementId);
            if (element) {
                setTimeout(() => {
                    element.classList.add('translate-y-4', 'opacity-0');
                    if (elementId === 'modalIcon') {
                        element.classList.add('scale-0');
                    }
                }, index * 50);
            }
        });
        
        // Remove blur effect from layout elements
        removeLayoutBlur();
        
        // Hide modal after animation completes
        setTimeout(() => {
            modal.classList.add('hidden');
            
            // Restore body scroll and interactions
            document.body.style.overflow = '';
            document.body.style.pointerEvents = '';
            
            // Reset all animations for next time
            resetModalAnimations();
            resetOnboardingForm();
            
            // Remove event listener
            modal.removeEventListener('click', handleModalBackdropClick);
        }, 500);
        
        console.log('Onboarding modal closed');
    }
}

// Handle modal backdrop clicks
function handleModalBackdropClick(event) {
    const modalContent = document.getElementById('onboardingModalContent');
    
    // Only close if clicking directly on the modal backdrop, not on the content
    if (event.target === event.currentTarget && !modalContent.contains(event.target)) {
        // Prevent closing by backdrop click for onboarding modal
        // Instead, add a gentle shake animation to indicate modal is required
        const modalContentElement = document.getElementById('onboardingModalContent');
        if (modalContentElement) {
            modalContentElement.style.animation = 'none';
            modalContentElement.style.animation = 'modalShake 0.5s ease-in-out';
            setTimeout(() => {
                modalContentElement.style.animation = '';
            }, 500);
        }
        
        // You can uncomment the line below if you want to allow backdrop closing
        // closeOnboardingModal();
    }
}

// Reset modal animations to initial state
function resetModalAnimations() {
    const elementsToReset = [
        { id: 'onboardingModalContent', classes: ['scale-95', 'opacity-0'] },
        { id: 'modalIcon', classes: ['scale-0'] },
        { id: 'modalTitle', classes: ['translate-y-4', 'opacity-0'] },
        { id: 'modalDescription', classes: ['translate-y-4', 'opacity-0'] },
        { id: 'onboardingForm', classes: ['translate-y-6', 'opacity-0'] },
        { id: 'programSection', classes: ['translate-x-4', 'opacity-0'] },
        { id: 'sectionSelectionDiv', classes: ['translate-x-4', 'opacity-0'] },
        { id: 'modalButtons', classes: ['translate-y-4', 'opacity-0'] },
        { id: 'infoSection', classes: ['translate-y-4', 'opacity-0'] }
    ];
    
    elementsToReset.forEach(({ id, classes }) => {
        const element = document.getElementById(id);
        if (element) {
            // Remove all transform and opacity classes
            element.classList.remove(
                'scale-100', 'scale-95', 'scale-0',
                'opacity-100', 'opacity-0',
                'translate-y-0', 'translate-y-4', 'translate-y-6',
                'translate-x-0', 'translate-x-4'
            );
            // Add initial state classes
            element.classList.add(...classes);
        }
    });
}

// Add blur effect to layout elements
function addLayoutBlur() {
    const dashboardContainer = document.getElementById('dashboardContainer');
    const dashboardSidebar = document.getElementById('dashboardSidebar');
    const dashboardNavbar = document.getElementById('dashboardNavbar');
    const dashboardMain = document.getElementById('dashboardMain');
    
    // Add blur class to dashboard container to affect all dashboard elements
    if (dashboardContainer) {
        dashboardContainer.classList.add('onboarding-modal-open');
    }
    
    // Add body class to prevent scroll
    document.body.classList.add('overflow-hidden');
    
    console.log('Layout blur effects added');
}

// Remove blur effect from layout elements
function removeLayoutBlur() {
    const dashboardContainer = document.getElementById('dashboardContainer');
    
    // Remove blur class from dashboard container
    if (dashboardContainer) {
        dashboardContainer.classList.remove('onboarding-modal-open');
    }
    
    // Restore body scroll
    document.body.classList.remove('overflow-hidden');
    
    console.log('Layout blur effects removed');
}

// Initialize onboarding form
function initializeOnboardingForm() {
    const programSelect = document.getElementById('programSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    
    // Add event listeners
    if (programSelect) {
        programSelect.addEventListener('change', handleProgramChange);
    }
    
    if (sectionSelect) {
        sectionSelect.addEventListener('change', handleSectionChange);
    }
    
    // Reset form state
    resetOnboardingForm();
    
    console.log('Onboarding form initialized');
}

// Handle program selection change
function handleProgramChange() {
    const programSelect = document.getElementById('programSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    const coursesContainer = document.getElementById('coursesContainer');
    const sectionLoading = document.getElementById('sectionLoading');
    
    selectedProgram = programSelect.value;
    
    if (selectedProgram) {
        // Show loading state
        sectionLoading.classList.remove('hidden');
        sectionSelect.disabled = true;
        sectionSelect.classList.add('bg-gray-100');
        
        // Hide courses container
        coursesContainer.classList.add('hidden');
        
        // Simulate API delay
        setTimeout(() => {
            populateSections(selectedProgram);
            sectionLoading.classList.add('hidden');
            sectionSelect.disabled = false;
            sectionSelect.classList.remove('bg-gray-100');
        }, 800);
        
        console.log('Program selected:', selectedProgram);
    } else {
        // Reset sections and courses
        resetSections();
        coursesContainer.classList.add('hidden');
    }
    
    validateForm();
}

// Handle section selection change
function handleSectionChange() {
    const sectionSelect = document.getElementById('sectionSelect');
    const coursesContainer = document.getElementById('coursesContainer');
    const coursesLoading = document.getElementById('coursesLoading');
    
    selectedSection = sectionSelect.value;
    
    if (selectedSection) {
        // Show courses container and loading state
        coursesContainer.classList.remove('hidden');
        coursesLoading.classList.remove('hidden');
        
        // Simulate API delay
        setTimeout(() => {
            populateCourses(selectedSection);
            coursesLoading.classList.add('hidden');
        }, 600);
        
        console.log('Section selected:', selectedSection);
    } else {
        coursesContainer.classList.add('hidden');
    }
    
    validateForm();
}

// Populate sections based on selected program
function populateSections(programId) {
    const sectionSelect = document.getElementById('sectionSelect');
    
    if (!mockPrograms[programId]) {
        console.error('Program not found:', programId);
        return;
    }
    
    const sections = mockPrograms[programId].sections;
    
    // Clear existing options
    sectionSelect.innerHTML = '<option value="">Choose your section...</option>';
    
    // Add sections
    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section.id;
        option.textContent = section.name;
        sectionSelect.appendChild(option);
    });
    
    console.log('Sections populated for program:', programId);
}

// Populate courses based on selected section
function populateCourses(sectionId) {
    const coursesList = document.getElementById('coursesList');
    
    if (!mockCourses[sectionId]) {
        coursesList.innerHTML = '<p class="text-gray-500 text-sm">No courses available for this section.</p>';
        availableCourses = [];
        return;
    }
    
    const courses = mockCourses[sectionId];
    availableCourses = courses;
    
    // Clear existing content
    coursesList.innerHTML = '';
    
    // Add courses
    courses.forEach((course, index) => {
        const courseDiv = document.createElement('div');
        courseDiv.className = 'flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors';
        courseDiv.style.animationDelay = `${index * 0.1}s`;
        courseDiv.classList.add('animate-fade-in');
        
        courseDiv.innerHTML = `
            <div class="flex items-center">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <i class="fas fa-book text-blue-600 text-sm"></i>
                </div>
                <div>
                    <h4 class="font-medium text-gray-900 text-sm">${course.code} - ${course.name}</h4>
                    <p class="text-xs text-gray-500">${course.units} units • ${course.instructor}</p>
                </div>
            </div>
            <div class="text-right">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <i class="fas fa-check mr-1"></i>
                    Enrolled
                </span>
            </div>
        `;
        
        coursesList.appendChild(courseDiv);
    });
    
    console.log('Courses populated for section:', sectionId);
}

// Reset sections dropdown
function resetSections() {
    const sectionSelect = document.getElementById('sectionSelect');
    sectionSelect.innerHTML = '<option value="">First, select your program...</option>';
    sectionSelect.disabled = true;
    sectionSelect.classList.add('bg-gray-100');
    selectedSection = '';
}

// Reset onboarding form
function resetOnboardingForm() {
    // Reset selections
    selectedProgram = '';
    selectedSection = '';
    availableCourses = [];
    
    // Reset form elements
    const programSelect = document.getElementById('programSelect');
    const coursesContainer = document.getElementById('coursesContainer');
    
    if (programSelect) {
        programSelect.value = '';
    }
    
    resetSections();
    coursesContainer.classList.add('hidden');
    
    // Hide error messages
    hideAllErrors();
    
    // Reset button state
    const completeBtn = document.getElementById('completeOnboardingBtn');
    if (completeBtn) {
        completeBtn.disabled = true;
    }
    
    console.log('Onboarding form reset');
}

// Validate form
function validateForm() {
    const completeBtn = document.getElementById('completeOnboardingBtn');
    const isValid = selectedProgram && selectedSection;
    
    if (completeBtn) {
        completeBtn.disabled = !isValid;
    }
    
    return isValid;
}

// Hide all error messages
function hideAllErrors() {
    const errorElements = [
        'programError',
        'sectionError',
        'onboardingError'
    ];
    
    errorElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    });
}

// Show error message
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        if (elementId === 'onboardingError') {
            const errorText = document.getElementById('onboardingErrorText');
            if (errorText) {
                errorText.textContent = message;
            }
        }
        element.classList.remove('hidden');
    }
}

// Complete onboarding process
function completeOnboarding() {
    console.log('Starting onboarding completion...');
    
    // Validate form
    if (!validateForm()) {
        if (!selectedProgram) {
            showError('programError', 'Please select your program.');
        }
        if (!selectedSection) {
            showError('sectionError', 'Please select your section.');
        }
        return;
    }
    
    // Hide errors
    hideAllErrors();
    
    // Show loading state
    const button = document.getElementById('completeOnboardingBtn');
    const buttonText = document.getElementById('onboardingButtonText');
    const spinner = document.getElementById('onboardingSpinner');
    
    if (button && buttonText && spinner) {
        button.disabled = true;
        buttonText.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Completing Setup...';
        spinner.classList.remove('hidden');
    }
    
    // Simulate API call
    setTimeout(() => {
        // TODO: Replace with actual API call
        const onboardingData = {
            program: selectedProgram,
            section: selectedSection,
            courses: availableCourses.map(course => course.id)
        };
        
        console.log('Onboarding data to submit:', onboardingData);
        
        // Simulate success
        showOnboardingSuccess();
        
        // Close modal and refresh page after delay
        setTimeout(() => {
            closeOnboardingModal();
            window.location.reload();
        }, 2000);
        
    }, 2000);
}

// Show onboarding success
function showOnboardingSuccess() {
    const successElement = document.getElementById('onboardingSuccess');
    const button = document.getElementById('completeOnboardingBtn');
    const buttonText = document.getElementById('onboardingButtonText');
    const spinner = document.getElementById('onboardingSpinner');
    
    if (successElement) {
        successElement.classList.remove('hidden');
    }
    
    if (button && buttonText && spinner) {
        spinner.classList.add('hidden');
        buttonText.innerHTML = '<i class="fas fa-check mr-2"></i>Setup Complete!';
        button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        button.classList.add('bg-green-600', 'hover:bg-green-700');
    }
}

// Add CSS for shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
    }
    
    @keyframes modalShake {
        0%, 100% { transform: translateX(0) scale(1); }
        25% { transform: translateX(-5px) scale(1.01); }
        75% { transform: translateX(5px) scale(1.01); }
    }
    
    @keyframes modalBounceIn {
        0% { 
            opacity: 0;
            transform: scale(0.3) translateY(50px);
        }
        50% { 
            opacity: 0.8;
            transform: scale(1.05) translateY(-10px);
        }
        100% { 
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    
    .modal-bounce-in {
        animation: modalBounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    /* Prevent text selection and interactions on blurred elements */
    .onboarding-modal-open * {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }
    
    /* Allow text selection and interactions only within modal */
    #onboardingModal * {
        user-select: auto;
        -webkit-user-select: auto;
        -moz-user-select: auto;
        -ms-user-select: auto;
    }
`;
document.head.appendChild(style);

// Prevent keyboard navigation outside modal when it's open
document.addEventListener('keydown', function(event) {
    const modal = document.getElementById('onboardingModal');
    if (modal && !modal.classList.contains('hidden')) {
        // Allow only Tab, Shift+Tab, Enter, and Escape within modal
        if (event.key === 'Escape') {
            // Prevent escape from closing modal - show shake instead
            handleModalBackdropClick({ target: modal, currentTarget: modal });
            event.preventDefault();
            return;
        }
        
        if (event.key === 'Tab') {
            // Keep tab navigation within modal
            const modalContent = document.getElementById('onboardingModalContent');
            const focusableElements = modalContent.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        }
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('OnboardingModal.js DOM loaded');
    
    // Test if modal elements exist
    const modal = document.getElementById('onboardingModal');
    const modalContent = document.getElementById('onboardingModalContent');
    
    if (modal) {
        console.log('Onboarding modal element found');
    } else {
        console.error('Onboarding modal element NOT found');
    }
    
    if (modalContent) {
        console.log('Onboarding modal content element found');
    } else {
        console.error('Onboarding modal content element NOT found');
    }
    
    // Make sure functions are globally available immediately
    window.showOnboardingModal = showOnboardingModal;
    window.closeOnboardingModal = closeOnboardingModal;
    window.completeOnboarding = completeOnboarding;
    
    console.log('Onboarding functions made globally available');
});

// Also make functions available immediately (fallback)
window.showOnboardingModal = showOnboardingModal;
window.closeOnboardingModal = closeOnboardingModal;
window.completeOnboarding = completeOnboarding;

console.log('OnboardingModal.js loaded successfully');
