// Student Onboarding Modal JavaScript

// Global variables to store data
let availablePrograms = [];
let availableSections = [];
let availableCourses = [];
let selectedProgramId = null;
let selectedSectionId = null;

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
        
        // Animate form elements (removed infoSection from array)
        setTimeout(() => {
            const onboardingForm = document.getElementById('onboardingForm');
            const programSectionRow = document.getElementById('programSectionRow');
            const modalButtons = document.getElementById('modalButtons');
            
            if (onboardingForm) {
                onboardingForm.classList.remove('translate-y-6', 'opacity-0');
                onboardingForm.classList.add('translate-y-0', 'opacity-100');
            }
            
            // Staggered animation for form sections (removed infoSection)
            const sections = [programSectionRow, modalButtons];
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
        
        // Animate elements out in reverse order (removed infoSection)
        const elementsToHide = [
            'modalButtons', 
            'programSectionRow',
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

// Initialize onboarding form
function initializeOnboardingForm() {
    console.log('Initializing onboarding form...');
    
    // Reset form state
    resetOnboardingForm();
    
    // Load programs on form initialization
    loadAvailablePrograms();
    
    // Add event listeners with proper binding
    const programSelect = document.getElementById('programSelect');
    const sectionSelect = document.getElementById('sectionSelect');
    
    if (programSelect) {
        // Remove any existing listeners first
        programSelect.removeEventListener('change', handleProgramChange);
        // Add new listener
        programSelect.addEventListener('change', handleProgramChange);
        console.log('Program select event listener added');
    } else {
        console.error('Program select element not found');
    }
    
    if (sectionSelect) {
        // Remove any existing listeners first
        sectionSelect.removeEventListener('change', handleSectionChange);
        // Add new listener
        sectionSelect.addEventListener('change', handleSectionChange);
        console.log('Section select event listener added');
    } else {
        console.error('Section select element not found');
    }
}

// Load available programs from API
async function loadAvailablePrograms() {
    const programSelect = document.getElementById('programSelect');
    const programError = document.getElementById('programError');
    
    try {
        // Clear existing options except the first one
        while (programSelect.children.length > 1) {
            programSelect.removeChild(programSelect.lastChild);
        }
        
        // Show loading state
        programSelect.disabled = true;
        programSelect.innerHTML = '<option value="">Loading programs...</option>';
        
        const response = await fetch('/Student/GetAvailablePrograms', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': getAntiForgeryToken()
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.programs && Array.isArray(data.programs) && data.programs.length > 0) {
            availablePrograms = data.programs;
            populateProgramSelect(data.programs);
        } else {
            throw new Error(data.message || 'No programs available or invalid data format');
        }
        
    } catch (error) {
        console.error('Error loading programs:', error);
        programSelect.innerHTML = '<option value="">Error loading programs</option>';
        showError(programError, 'Unable to load programs. Please refresh and try again.');
    } finally {
        programSelect.disabled = false;
    }
}

// Populate program select dropdown
function populateProgramSelect(programs) {
    const programSelect = document.getElementById('programSelect');
    
    // Clear and add default option
    programSelect.innerHTML = '<option value="">Choose your program...</option>';
    
    // Validate programs data
    if (!Array.isArray(programs)) {
        console.error('Programs is not an array:', programs);
        programSelect.innerHTML = '<option value="">Invalid programs data</option>';
        return;
    }
    
    if (programs.length === 0) {
        programSelect.innerHTML = '<option value="">No programs available</option>';
        return;
    }
    
    // Add program options
    programs.forEach((program) => {
        // Check if program has required fields
        if (!program.id && program.id !== 0) {
            return;
        }
        
        if (!program.name) {
            return;
        }
        
        const option = document.createElement('option');
        option.value = program.id.toString();
        
        // Show full name in dropdown, but store acronym for later display
        option.textContent = `${program.name}${program.acronym ? ` (${program.acronym})` : ''}${program.code ? ` - ${program.code}` : ''}`;
        option.setAttribute('data-acronym', program.acronym || program.name);
        option.setAttribute('data-name', program.name);
        
        programSelect.appendChild(option);
    });
}

// Handle program selection change
async function handleProgramChange(event) {
    const rawValue = event.target.value;
    const programId = parseInt(rawValue);
    
    const programError = document.getElementById('programError');
    const sectionSelect = document.getElementById('sectionSelect');
    const coursesContainer = document.getElementById('coursesContainer');
    
    // Hide error messages
    hideError(programError);
    
    // Reset dependent dropdowns
    resetSectionSelect();
    hideCourses();
    updateCompleteButton();
    
    // Validate the program ID
    if (!rawValue || rawValue === "" || isNaN(programId) || programId <= 0) {
        selectedProgramId = null;
        return;
    }
    
    selectedProgramId = programId;
    
    // Update program select to show only acronym after selection - but keep it functional
    const selectedOption = event.target.selectedOptions[0];
    if (selectedOption) {
        const acronym = selectedOption.getAttribute('data-acronym');
        const name = selectedOption.getAttribute('data-name');
        
        // Store original options for potential reset - only if not already stored
        if (!event.target.hasAttribute('data-original-options')) {
            event.target.setAttribute('data-original-options', event.target.innerHTML);
        }
        
        // Remove any existing event listeners to prevent glitches
        const clonedSelect = event.target.cloneNode(false);
        const options = Array.from(event.target.options);
        
        // Clear and rebuild with compact selected option
        event.target.innerHTML = '';
        
        // Add compact selected option
        const compactOption = document.createElement('option');
        compactOption.value = programId.toString();
        compactOption.textContent = acronym || name;
        compactOption.selected = true;
        compactOption.setAttribute('data-acronym', acronym);
        compactOption.setAttribute('data-name', name);
        event.target.appendChild(compactOption);
        
        // Add all other options (hidden until focus)
        options.forEach(option => {
            if (option.value !== programId.toString() && option.value !== '') {
                event.target.appendChild(option.cloneNode(true));
            }
        });
        
        // Add focus handler to show all options
        const showAllOptions = function() {
            const originalOptions = this.getAttribute('data-original-options');
            if (originalOptions) {
                this.innerHTML = originalOptions;
                this.value = programId.toString(); // Maintain selection
            }
        };
        
        // Add blur handler to compact again
        const compactOptions = function() {
            if (this.value === programId.toString()) {
                const selectedOpt = this.selectedOptions[0];
                if (selectedOpt) {
                    const compactText = selectedOpt.getAttribute('data-acronym') || selectedOpt.getAttribute('data-name');
                    // Only compact if we're not in focus
                    if (document.activeElement !== this) {
                        this.innerHTML = '';
                        const compactOpt = document.createElement('option');
                        compactOpt.value = programId.toString();
                        compactOpt.textContent = compactText;
                        compactOpt.selected = true;
                        compactOpt.setAttribute('data-acronym', selectedOpt.getAttribute('data-acronym'));
                        compactOpt.setAttribute('data-name', selectedOpt.getAttribute('data-name'));
                        this.appendChild(compactOpt);
                    }
                }
            }
        };
        
        // Remove existing listeners to prevent duplicates
        event.target.removeEventListener('focus', showAllOptions);
        event.target.removeEventListener('blur', compactOptions);
        
        // Add new listeners
        event.target.addEventListener('focus', showAllOptions);
        event.target.addEventListener('blur', compactOptions);
    }
    
    // Load sections for selected program
    try {
        await loadAvailableSections(programId);
    } catch (error) {
        console.error('Error in handleProgramChange:', error);
        showError(programError, 'Failed to load sections. Please try again.');
    }
}

// Load available sections
async function loadAvailableSections(programId) {
    const sectionSelect = document.getElementById('sectionSelect');
    const sectionLoading = document.getElementById('sectionLoading');
    const sectionError = document.getElementById('sectionError');
    
    try {
        // Double-check programId validation
        const numericProgramId = parseInt(programId);
        if (isNaN(numericProgramId) || numericProgramId <= 0) {
            showError(sectionError, 'Invalid program selection. Please try again.');
            return;
        }
        
        // Show loading state
        showLoading(sectionLoading, 'Loading sections...');
        sectionSelect.disabled = true;
        sectionSelect.innerHTML = '<option value="">Loading sections...</option>';
        hideError(sectionError);
        
        // Construct API URL
        const apiUrl = `/Student/GetAvailableSections/${numericProgramId}`;
        
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': getAntiForgeryToken()
            }
        };
        
        const response = await fetch(apiUrl, requestOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.sections && Array.isArray(data.sections)) {
            if (data.sections.length > 0) {
                availableSections = data.sections;
                populateSectionSelect(data.sections);
                hideError(sectionError);
            } else {
                sectionSelect.innerHTML = '<option value="">No sections available for this program</option>';
                showError(sectionError, 'No sections available for this program.');
            }
        } else {
            const errorMessage = data.message || 'No sections available for this program';
            throw new Error(errorMessage);
        }
        
    } catch (error) {
        console.error('Error loading sections:', error);
        sectionSelect.innerHTML = '<option value="">Error loading sections</option>';
        showError(sectionError, error.message || 'Unable to load sections. Please try selecting a different program.');
    } finally {
        hideLoading(sectionLoading);
        sectionSelect.disabled = false;
    }
}

// Populate section select dropdown
function populateSectionSelect(sections) {
    const sectionSelect = document.getElementById('sectionSelect');
    
    // Clear and add default option
    sectionSelect.innerHTML = '<option value="">Choose your section...</option>';
    
    // Validate sections data
    if (!Array.isArray(sections)) {
        console.error('Sections is not an array:', sections);
        sectionSelect.innerHTML = '<option value="">Invalid sections data</option>';
        return;
    }
    
    if (sections.length === 0) {
        sectionSelect.innerHTML = '<option value="">No sections available</option>';
        return;
    }
    
    // Add section options
    sections.forEach((section) => {
        if (!section.id || !section.name) {
            return;
        }
        
        const option = document.createElement('option');
        option.value = section.id;
        
        // Show full name in dropdown, but store short name for later display
        option.textContent = `${section.name}${section.program_name ? ` - ${section.program_name}` : ''}${section.program_acronym ? ` (${section.program_acronym})` : ''}`;
        option.setAttribute('data-short-name', section.name);
        
        sectionSelect.appendChild(option);
    });
    
    // Enable section select and update styling
    sectionSelect.disabled = false;
    sectionSelect.classList.remove('bg-gray-100', 'text-gray-500');
    sectionSelect.classList.add('bg-white', 'text-gray-900');
}

// Handle section selection change
async function handleSectionChange(event) {
    const sectionId = parseInt(event.target.value);
    const sectionError = document.getElementById('sectionError');
    
    // Hide error messages
    hideError(sectionError);
    hideCourses();
    updateCompleteButton();
    
    if (!sectionId || isNaN(sectionId) || sectionId <= 0) {
        selectedSectionId = null;
        return;
    }
    
    selectedSectionId = sectionId;
    
    // Update section select to show only short name after selection - but keep it functional
    const selectedOption = event.target.selectedOptions[0];
    if (selectedOption) {
        const shortName = selectedOption.getAttribute('data-short-name');
        
        // Store original options for potential reset - only if not already stored
        if (!event.target.hasAttribute('data-original-options')) {
            event.target.setAttribute('data-original-options', event.target.innerHTML);
        }
        
        // Remove any existing event listeners to prevent glitches
        const options = Array.from(event.target.options);
        
        // Clear and rebuild with compact selected option
        event.target.innerHTML = '';
        
        // Add compact selected option
        const compactOption = document.createElement('option');
        compactOption.value = sectionId.toString();
        compactOption.textContent = shortName;
        compactOption.selected = true;
        compactOption.setAttribute('data-short-name', shortName);
        event.target.appendChild(compactOption);
        
        // Add all other options (hidden until focus)
        options.forEach(option => {
            if (option.value !== sectionId.toString() && option.value !== '') {
                event.target.appendChild(option.cloneNode(true));
            }
        });
        
        // Add focus handler to show all options
        const showAllOptions = function() {
            const originalOptions = this.getAttribute('data-original-options');
            if (originalOptions) {
                this.innerHTML = originalOptions;
                this.value = sectionId.toString(); // Maintain selection
            }
        };
        
        // Add blur handler to compact again
        const compactOptions = function() {
            if (this.value === sectionId.toString()) {
                const selectedOpt = this.selectedOptions[0];
                if (selectedOpt) {
                    const compactText = selectedOpt.getAttribute('data-short-name');
                    // Only compact if we're not in focus
                    if (document.activeElement !== this) {
                        this.innerHTML = '';
                        const compactOpt = document.createElement('option');
                        compactOpt.value = sectionId.toString();
                        compactOpt.textContent = compactText;
                        compactOpt.selected = true;
                        compactOpt.setAttribute('data-short-name', compactText);
                        this.appendChild(compactOpt);
                    }
                }
            }
        };
        
        // Remove existing listeners to prevent duplicates
        event.target.removeEventListener('focus', showAllOptions);
        event.target.removeEventListener('blur', compactOptions);
        
        // Add new listeners
        event.target.addEventListener('focus', showAllOptions);
        event.target.addEventListener('blur', compactOptions);
    }
    
    // Load courses for selected section
    await loadAvailableCourses(sectionId);
}

// Load available courses for selected section
async function loadAvailableCourses(sectionId) {
    const coursesContainer = document.getElementById('coursesContainer');
    const coursesLoading = document.getElementById('coursesLoading');
    
    try {
        // Show loading state
        showLoading(coursesLoading, 'Loading assigned courses...');
        
        const response = await fetch(`/Student/GetAvailableCourses/${sectionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': getAntiForgeryToken()
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.courses && Array.isArray(data.courses)) {
            availableCourses = data.courses;
            populateCoursesList(data.courses);
            showCourses();
            updateCompleteButton();
        } else {
            throw new Error(data.message || 'No assigned courses available for this section');
        }
        
    } catch (error) {
        console.error('Error loading assigned courses:', error);
        // Show empty courses section with error message
        availableCourses = [];
        populateCoursesList([]);
        showCourses();
        updateCompleteButton();
    } finally {
        hideLoading(coursesLoading);
    }
}

// Create individual course card element
function createCourseCard(course, index) {
    const courseCard = document.createElement('div');
    courseCard.className = 'bg-white border border-green-200 rounded p-2 hover:shadow-sm transition-all duration-200 transform translate-x-4 opacity-0';
    
    // Extract course information with fallbacks
    const courseName = course.course_name || course.name || 'Unknown Course';
    const courseCode = course.course_code || course.code || 'N/A';
    const facultyName = course.faculty_name || 'Unknown Faculty';
    const room = course.room || 'TBA';
    const semester = course.semester || 'N/A';
    const academicYear = course.academic_year || 'N/A';
    
    courseCard.innerHTML = `
        <div class="flex items-start justify-between mb-1.5">
            <div class="flex-1 min-w-0">
                <h5 class="font-semibold text-gray-800 text-xs truncate">${courseName}</h5>
                <p class="text-green-600 font-medium text-xs">${courseCode}</p>
            </div>
            <div class="flex-shrink-0 ml-1">
                <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <i class="fas fa-circle text-green-500 mr-0.5" style="font-size: 4px;"></i>
                    Active
                </span>
            </div>
        </div>
        
        <div class="space-y-1 text-xs text-gray-600">
            <div class="flex items-center">
                <i class="fas fa-chalkboard-teacher text-green-500 mr-2 w-3 flex-shrink-0"></i>
                <span class="truncate">${facultyName}</span>
            </div>
            
            <div class="flex items-center">
                <i class="fas fa-door-open text-green-500 mr-2 w-3 flex-shrink-0"></i>
                <span class="truncate">${room}</span>
            </div>
            
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <i class="fas fa-calendar-alt text-green-500 mr-2 w-3 flex-shrink-0"></i>
                    <span>${semester}</span>
                </div>
                <div class="flex items-center">
                    <i class="fas fa-clock text-green-500 mr-2 w-3 flex-shrink-0"></i>
                    <span>${academicYear}</span>
                </div>
            </div>
        </div>
    `;
    
    // Animate course card appearance
    setTimeout(() => {
        courseCard.classList.remove('translate-x-4', 'opacity-0');
        courseCard.classList.add('translate-x-0', 'opacity-100');
    }, 50 + (index * 25));
    
    return courseCard;
}

// Populate courses list in the UI
function populateCoursesList(courses) {
    const coursesList = document.getElementById('coursesList');
    
    // Clear existing courses
    coursesList.innerHTML = '';
    
    if (!Array.isArray(courses) || courses.length === 0) {
        coursesList.className = 'col-span-2 flex items-center justify-center max-h-60 overflow-y-auto border border-green-200 rounded bg-white/50 p-2';
        coursesList.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                <i class="fas fa-book-open text-lg mb-2 opacity-50"></i>
                <p class="text-xs font-medium">No assigned courses found</p>
                <p class="text-xs">Please contact your administrator if this seems incorrect.</p>
            </div>
        `;
        return;
    }
    
    // Reset to grid layout
    coursesList.className = 'grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-green-200 rounded bg-white/50 p-2';
    
    // Add course cards
    courses.forEach((course, index) => {
        const courseCard = createCourseCard(course, index);
        coursesList.appendChild(courseCard);
    });
}

// Complete onboarding process
async function completeOnboarding() {
    const completeButton = document.getElementById('completeOnboardingBtn');
    const buttonText = document.getElementById('onboardingButtonText');
    const spinner = document.getElementById('onboardingSpinner');
    const errorDiv = document.getElementById('onboardingError');
    const successDiv = document.getElementById('onboardingSuccess');
    
    // Validate form
    if (!validateOnboardingForm()) {
        return;
    }
    
    try {
        // Show loading state
        completeButton.disabled = true;
        buttonText.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Completing Setup...';
        spinner.classList.remove('hidden');
        hideError(errorDiv);
        hideSuccess(successDiv);
        
        const onboardingData = {
            program_id: selectedProgramId,
            section_id: selectedSectionId
        };
        
        console.log('Submitting onboarding data:', onboardingData);
        
        const response = await fetch('/Student/CompleteOnboarding', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': getAntiForgeryToken()
            },
            body: JSON.stringify(onboardingData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success message
            showSuccess(successDiv, 'Account setup completed successfully!');
            
            // Wait a moment then reload the page to reflect changes
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } else {
            throw new Error(data.message || 'Failed to complete onboarding');
        }
        
    } catch (error) {
        console.error('Error completing onboarding:', error);
        showError(errorDiv, error.message || 'Failed to complete setup. Please try again.');
        
        // Reset button
        completeButton.disabled = false;
        buttonText.innerHTML = '<i class="fas fa-check mr-2"></i>Complete Setup';
        spinner.classList.add('hidden');
    }
}

// Validate onboarding form
function validateOnboardingForm() {
    const programError = document.getElementById('programError');
    const sectionError = document.getElementById('sectionError');
    
    console.log('=== FORM VALIDATION DEBUG ===');
    console.log('selectedProgramId:', selectedProgramId);
    console.log('selectedSectionId:', selectedSectionId);
    console.log('availableCourses.length:', availableCourses.length);
    
    let isValid = true;
    
    // Validate program selection
    if (!selectedProgramId || selectedProgramId <= 0) {
        console.log('Program validation failed');
        showError(programError, 'Please select your program.');
        isValid = false;
    } else {
        hideError(programError);
        console.log('Program validation passed');
    }
    
    // Validate section selection
    if (!selectedSectionId || selectedSectionId <= 0) {
        console.log('Section validation failed');
        showError(sectionError, 'Please select your section.');
        isValid = false;
    } else {
        hideError(sectionError);
        console.log('Section validation passed');
    }
    
    console.log('Form validation result:', isValid);
    console.log('=============================');
    
    return isValid;
}

// Update complete button state
function updateCompleteButton() {
    const completeButton = document.getElementById('completeOnboardingBtn');
    const isFormValid = selectedProgramId && selectedSectionId;
    
    completeButton.disabled = !isFormValid;
}

// Utility functions
function resetOnboardingForm() {
    selectedProgramId = null;
    selectedSectionId = null;
    availablePrograms = [];
    availableSections = [];
    availableCourses = [];
    
    // Reset program select completely
    const programSelect = document.getElementById('programSelect');
    if (programSelect) {
        programSelect.removeAttribute('data-original-options');
        // Remove any attached event listeners by cloning the element
        const newProgramSelect = programSelect.cloneNode(true);
        programSelect.parentNode.replaceChild(newProgramSelect, programSelect);
        // Re-attach the change listener
        newProgramSelect.addEventListener('change', handleProgramChange);
    }
    
    resetSectionSelect();
    hideCourses();
    hideAllErrors();
    hideAllSuccess();
    updateCompleteButton();
}

function resetSectionSelect() {
    const sectionSelect = document.getElementById('sectionSelect');
    if (!sectionSelect) return;
    
    // Reset section select completely
    sectionSelect.removeAttribute('data-original-options');
    sectionSelect.innerHTML = '<option value="">First, select your program...</option>';
    sectionSelect.disabled = true;
    sectionSelect.classList.remove('bg-white', 'text-gray-900');
    sectionSelect.classList.add('bg-gray-100', 'text-gray-500');
    
    // Remove any attached event listeners by cloning the element
    const newSectionSelect = sectionSelect.cloneNode(true);
    sectionSelect.parentNode.replaceChild(newSectionSelect, sectionSelect);
    // Re-attach the change listener
    newSectionSelect.addEventListener('change', handleSectionChange);
}

function showCourses() {
    const coursesContainer = document.getElementById('coursesContainer');
    if (!coursesContainer) return;
    
    coursesContainer.classList.remove('hidden');
    
    // Animate show
    setTimeout(() => {
        coursesContainer.classList.remove('translate-x-4', 'opacity-0');
        coursesContainer.classList.add('translate-x-0', 'opacity-100');
    }, 100);
}

function hideCourses() {
    const coursesContainer = document.getElementById('coursesContainer');
    if (!coursesContainer) return;
    
    coursesContainer.classList.add('hidden');
    coursesContainer.classList.add('translate-x-4', 'opacity-0');
    coursesContainer.classList.remove('translate-x-0', 'opacity-100');
}

function showLoading(element, message) {
    if (element) {
        element.innerHTML = `<i class="fas fa-spinner fa-spin mr-1"></i>${message}`;
        element.classList.remove('hidden');
    }
}

function hideLoading(element) {
    if (element) {
        element.classList.add('hidden');
    }
}

function showError(element, message) {
    if (element) {
        element.classList.remove('hidden');
        element.style.opacity = '0';
        element.style.transform = 'scale(0.95)';
        
        // Update the message
        const messageElement = element.querySelector('p');
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        // Animate in
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
            element.style.transition = 'all 0.3s ease-out';
        }, 10);
    }
}

function hideError(element) {
    if (element && !element.classList.contains('hidden')) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.95)';
        element.style.transition = 'all 0.3s ease-out';
        
        setTimeout(() => {
            element.classList.add('hidden');
        }, 300);
    }
}

function showSuccess(element, message) {
    if (element) {
        const textElement = element.querySelector('p') || element;
        if (textElement.tagName === 'P') {
            textElement.textContent = message;
        } else {
            element.innerHTML = `<i class="fas fa-check-circle mr-1"></i>${message}`;
        }
        element.classList.remove('hidden');
        element.classList.add('scale-100', 'opacity-100');
        element.classList.remove('scale-95', 'opacity-0');
    }
}

function hideSuccess(element) {
    if (element) {
        element.classList.add('hidden');
        element.classList.add('scale-95', 'opacity-0');
        element.classList.remove('scale-100', 'opacity-100');
    }
}

function hideAllErrors() {
    const errors = ['programError', 'sectionError', 'onboardingError'];
    errors.forEach(id => {
        const element = document.getElementById(id);
        if (element) hideError(element);
    });
}

function hideAllSuccess() {
    const successElement = document.getElementById('onboardingSuccess');
    if (successElement) hideSuccess(successElement);
}

function getAntiForgeryToken() {
    const tokenInput = document.querySelector('input[name="__RequestVerificationToken"]');
    return tokenInput ? tokenInput.value : '';
}

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
    }
}

function resetModalAnimations() {
    const elementsToReset = [
        { id: 'onboardingModalContent', classes: ['scale-95', 'opacity-0'] },
        { id: 'modalIcon', classes: ['scale-0'] },
        { id: 'modalTitle', classes: ['translate-y-4', 'opacity-0'] },
        { id: 'modalDescription', classes: ['translate-y-4', 'opacity-0'] },
        { id: 'onboardingForm', classes: ['translate-y-6', 'opacity-0'] },
        { id: 'programSectionRow', classes: ['translate-x-4', 'opacity-0'] },
        { id: 'modalButtons', classes: ['translate-y-4', 'opacity-0'] }
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

function addLayoutBlur() {
    const dashboardContainer = document.getElementById('dashboardContainer');
    
    // Add blur class to dashboard container to affect all dashboard elements
    if (dashboardContainer) {
        dashboardContainer.classList.add('onboarding-modal-open');
    }
    
    // Add body class to prevent scroll
    document.body.classList.add('overflow-hidden');
    
    console.log('Layout blur effects added');
}

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

// Show logout confirmation modal
function showLogoutConfirmation() {
    const modal = document.getElementById('logoutConfirmationModal');
    const modalContent = document.getElementById('logoutModalContent');
    
    if (!modal || !modalContent) {
        // Fallback to browser confirm if modal elements not found
        if (confirm('Are you sure you want to cancel setup? This will log you out and you\'ll need to complete setup later.')) {
            cancelOnboarding();
        }
        return;
    }
    
    // Ensure modal is properly set up for interaction
    modal.style.pointerEvents = 'auto';
    modal.style.zIndex = '10001';
    modalContent.style.pointerEvents = 'auto';
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Start entrance animation
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 50);
    
    // Add click event listener to modal backdrop
    modal.addEventListener('click', function(event) {
        // Close modal if clicking on backdrop (not content)
        if (event.target === modal) {
            hideLogoutConfirmation();
        }
    });
}

// Hide logout confirmation modal
function hideLogoutConfirmation() {
    const modal = document.getElementById('logoutConfirmationModal');
    const modalContent = document.getElementById('logoutModalContent');
    
    if (!modal || !modalContent) return;
    
    // Add exit animation
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    
    // Hide modal after animation
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.style.zIndex = '';
        modal.style.pointerEvents = '';
        modalContent.style.pointerEvents = '';
    }, 300);
}

// Confirm logout action
function confirmLogout() {
    // Disable buttons to prevent double-clicks
    const confirmButton = event.target;
    const cancelButton = confirmButton.parentElement.querySelector('button:first-child');
    
    confirmButton.disabled = true;
    cancelButton.disabled = true;
    
    // Update button text to show processing
    confirmButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Logging out...';
    
    // Hide the confirmation modal first
    hideLogoutConfirmation();
    
    // Then proceed with logout
    setTimeout(() => {
        cancelOnboarding();
    }, 300);
}

// Cancel onboarding and logout (updated to use AuthController)
function cancelOnboarding() {
    try {
        // Close the onboarding modal first
        closeOnboardingModal();
        
        // Small delay then logout
        setTimeout(() => {
            // Use AuthController logout endpoint
            fetch('/Auth/Logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'RequestVerificationToken': getAntiForgeryToken()
                }
            }).then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = data.redirect_url || '/Auth/Login?logout=true';
                } else {
                    // Fallback redirect
                    window.location.href = '/Auth/Login?logout=true';
                }
            }).catch(() => {
                // Fallback - just redirect
                window.location.href = '/Auth/Login?logout=true';
            });
        }, 500);
    } catch (error) {
        console.error('Error during cancel logout:', error);
        // Fallback - just redirect
        window.location.href = '/Auth/Login?logout=true';
    }
}

// Add CSS for better modal behavior
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
    #onboardingModal *, #logoutConfirmationModal * {
        user-select: auto;
        -webkit-user-select: auto;
        -moz-user-select: auto;
        -ms-user-select: auto;
        pointer-events: auto;
    }
    
    /* Smooth dropdown transitions */
    #programSelect, #sectionSelect {
        transition: all 0.2s ease-in-out;
    }
    
    /* Ensure logout confirmation modal is always on top and clickable */
    #logoutConfirmationModal {
        z-index: 10001 !important;
        pointer-events: auto !important;
    }
    
    #logoutConfirmationModal * {
        pointer-events: auto !important;
    }
    
    /* Ensure buttons in logout modal are clickable */
    #logoutConfirmationModal button {
        pointer-events: auto !important;
        cursor: pointer !important;
    }
    
    #logoutConfirmationModal button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    #logoutConfirmationModal button:disabled {
        opacity: 0.6;
        cursor: not-allowed !important;
        transform: none;
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
    
    // Make sure functions are globally available immediately
    window.showOnboardingModal = showOnboardingModal;
    window.closeOnboardingModal = closeOnboardingModal;
    window.completeOnboarding = completeOnboarding;
    window.cancelOnboarding = cancelOnboarding;
    window.showLogoutConfirmation = showLogoutConfirmation;
    window.hideLogoutConfirmation = hideLogoutConfirmation;
    window.confirmLogout = confirmLogout;
    
    console.log('Onboarding functions made globally available');
});

// Also make functions available immediately (fallback)
window.showOnboardingModal = showOnboardingModal;
window.closeOnboardingModal = closeOnboardingModal;
window.completeOnboarding = completeOnboarding;
window.cancelOnboarding = cancelOnboarding;
window.showLogoutConfirmation = showLogoutConfirmation;
window.hideLogoutConfirmation = hideLogoutConfirmation;
window.confirmLogout = confirmLogout;

console.log('OnboardingModal.js loaded successfully');
