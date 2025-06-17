// Faculty Attendance Modal JavaScript
class FacultyAttendanceModal {
    constructor() {
        this.modal = document.getElementById('facultyMarkAttendanceModal');
        this.heatWarningModal = document.getElementById('facultyHeatWarningModal');
        this.successModal = document.getElementById('facultyAttendanceSuccessModal');
        this.video = document.getElementById('facultyAttendanceVideo');
        this.canvas = document.getElementById('facultyAttendanceCanvas');
        this.stream = null;
        this.isHeatWarningActive = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkWeatherConditions();
    }

    setupEventListeners() {
        // Mark attendance button click handler
        const markAttendanceButtons = document.querySelectorAll('[data-action="mark-attendance"]');
        markAttendanceButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('Faculty mark attendance clicked');
                this.handleMarkAttendanceClick();
            });
        });

        // Mark Faculty Attendance button in modal
        document.getElementById('markFacultyAttendanceBtn')?.addEventListener('click', () => {
            this.submitFacultyAttendance();
        });

        // Close modals
        document.getElementById('closeFacultyAttendanceModal')?.addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('closeFacultyHeatWarningBtn')?.addEventListener('click', () => {
            this.hideHeatWarningModal();
        });

        document.getElementById('closeFacultySuccessModalBtn')?.addEventListener('click', () => {
            this.hideSuccessModal();
        });

        // Cancel button
        document.getElementById('cancelFacultyAttendanceBtn')?.addEventListener('click', () => {
            this.hideModal();
        });

        // View Faculty Attendance button
        document.getElementById('viewFacultyAttendanceBtn')?.addEventListener('click', () => {
            // Navigate to faculty attendance page
            window.location.href = '/Faculty/Attendance';
        });

        // Modal backdrop clicks
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hideModal();
        });

        this.heatWarningModal?.addEventListener('click', (e) => {
            if (e.target === this.heatWarningModal) this.hideHeatWarningModal();
        });

        this.successModal?.addEventListener('click', (e) => {
            if (e.target === this.successModal) this.hideSuccessModal();
        });

        // Escape key handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!this.heatWarningModal?.classList.contains('hidden')) {
                    this.hideHeatWarningModal();
                } else if (!this.modal?.classList.contains('hidden')) {
                    this.hideModal();
                } else if (!this.successModal?.classList.contains('hidden')) {
                    this.hideSuccessModal();
                }
            }
        });
    }

    async handleMarkAttendanceClick() {
        console.log('Faculty handleMarkAttendanceClick called');
        
        // First check heat conditions
        const isHeatSafe = await this.checkHeatConditions();
        
        console.log(`Faculty heat conditions safe: ${isHeatSafe}`);
        
        if (!isHeatSafe) {
            this.showHeatWarningModal();
            return;
        }

        // Check faculty attendance validation before showing modal
        console.log('Faculty checking attendance validation...');
        const canSubmit = await this.validateFacultyAttendanceSubmission();
        
        console.log(`Faculty validation result: canSubmit = ${canSubmit}`);
        
        if (!canSubmit) {
            // Validation failed, error message already shown by validateFacultyAttendanceSubmission
            console.log('Faculty validation failed - not showing modal');
            return;
        }

        // If heat is safe and validation passes, show the attendance modal
        console.log('Faculty validation passed - showing modal');
        // Add a small delay to ensure the success notification is visible before showing modal
        setTimeout(() => {
            this.showModal();
        }, 1000); // Wait 1 second after success notification
    }

    async validateFacultyAttendanceSubmission() {
        try {
            console.log('Faculty validating attendance submission eligibility...');
            
            // Get the current class info to determine assigned course ID
            const currentClassInfo = this.getCurrentClassInfoForValidation();
            
            if (!currentClassInfo || !currentClassInfo.assignedCourseId) {
                this.showError('No current class available for attendance submission');
                return false;
            }
            
            console.log(`Faculty validating for assigned course ID: ${currentClassInfo.assignedCourseId}`);
            
            // Call the validation endpoint
            const validationData = {
                assignedCourseId: parseInt(currentClassInfo.assignedCourseId)
            };
            
            const response = await fetch('/Faculty/ValidateFacultyAttendanceSubmission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(validationData)
            });
            
            if (!response.ok) {
                throw new Error(`Validation request failed: ${response.status}`);
            }
            
            const validationResult = await response.json();
            console.log('Faculty validation result:', validationResult);
            console.log('Full validation result object:', JSON.stringify(validationResult, null, 2));
            
            // Log all properties in the response
            console.log('All properties in validationResult:');
            Object.keys(validationResult).forEach(key => {
                console.log(`  ${key}: ${validationResult[key]} (type: ${typeof validationResult[key]})`);
            });
            
            // Check for canSubmit property (should now be camelCase from controller)
            const canSubmit = validationResult.canSubmit;
            console.log('Final canSubmit value:', canSubmit, 'type:', typeof canSubmit);
            
            // Check if validation failed
            if (canSubmit !== true) {
                const message = validationResult.message || 'Cannot submit faculty attendance at this time';
                this.showError(message);
                return false;
            }
            
            // Store validation info for later use
            this.validationInfo = validationResult;
            
            // Show success message if validation passes
            const message = validationResult.message;
            if (message) {
                console.log('Showing SUCCESS notification for validation message:', message);
                this.showSuccessNotification(message);
            } else {
                console.log('Validation successful but no message to display');
                this.showSuccessNotification('Validation successful - you can mark attendance');
            }
            
            console.log('Faculty attendance validation successful - proceeding to show modal');
            return true;
            
        } catch (error) {
            console.error('Faculty attendance validation error:', error);
            this.showError('Failed to validate attendance submission. Please try again.');
            return false;
        }
    }

    showSuccessNotification(message) {
        // Remove any existing notifications first to avoid conflicts
        const existingNotifications = document.querySelectorAll('.fixed.top-4.right-4');
        existingNotifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });

        // Create success notification with proper styling
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle text-green-600 mr-2"></i>
                <div>
                    <div class="font-medium text-green-800">Validation Successful</div>
                    <div class="text-sm text-green-700">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-green-600 hover:text-green-800">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 4 seconds (longer for success messages)
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
        
        console.log('SUCCESS notification displayed:', message);
    }

    showError(message) {
        // Remove any existing notifications first to avoid conflicts
        const existingNotifications = document.querySelectorAll('.fixed.top-4.right-4');
        existingNotifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });

        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-circle text-red-600 mr-2"></i>
                <div>
                    <div class="font-medium text-red-800">Faculty Attendance Error</div>
                    <div class="text-sm text-red-700">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-red-600 hover:text-red-800">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 8 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 8000);
        
        console.log('ERROR notification displayed:', message);
    }

    getCurrentClassInfoForValidation() {
        try {
            // First try to get from dashboard data attributes
            const currentClassCard = document.querySelector('[data-current-class="true"]');
            if (currentClassCard) {
                const assignedCourseId = currentClassCard.getAttribute('data-assigned-course-id');
                const courseName = currentClassCard.getAttribute('data-course-name');
                
                console.log('Faculty class data from attributes:', {
                    assignedCourseId, courseName
                });
                
                if (assignedCourseId && assignedCourseId !== 'null' && assignedCourseId !== '0') {
                    return {
                        assignedCourseId: assignedCourseId,
                        courseName: courseName
                    };
                }
            }
            
            // Then try dashboard data JSON
            const dashboardDataElement = document.getElementById('faculty-dashboard-data');
            const hasRealData = document.getElementById('has-real-data')?.textContent === 'true';
            
            if (hasRealData && dashboardDataElement) {
                try {
                    const facultyData = JSON.parse(dashboardDataElement.textContent);
                    
                    // Try to get current class
                    const currentClass = facultyData?.ScheduleSummary?.CurrentClass || 
                                        facultyData?.scheduleSummary?.currentClass ||
                                        facultyData?.CurrentClass;
                    
                    if (currentClass && currentClass.AssignedCourseId) {
                        console.log('Faculty class data from JSON:', currentClass);
                        return {
                            assignedCourseId: currentClass.AssignedCourseId,
                            courseName: currentClass.CourseName || currentClass.courseName
                        };
                    }
                } catch (parseError) {
                    console.error('Error parsing faculty dashboard data for validation:', parseError);
                }
            }
            
            console.log('Faculty: No valid current class found for validation');
            return null;
        } catch (error) {
            console.error('Error getting current class info for validation:', error);
            return null;
        }
    }

    async checkWeatherConditions() {
        try {
            const maxFeelsLike = this.getMaxFeelsLikeFromPage();
            
            if (maxFeelsLike !== null) {
                if (maxFeelsLike >= 42) {
                    this.isHeatWarningActive = true;
                    this.updateHeatIndexDisplay(maxFeelsLike);
                    this.showHeatNotification();
                } else {
                    this.isHeatWarningActive = false;
                }
            }
        } catch (error) {
            console.error('Error checking weather conditions:', error);
        }
    }

    async checkHeatConditions() {
        try {
            console.log('Faculty checking heat conditions...');
            
            const maxFeelsLike = this.getMaxFeelsLikeFromPage();
            
            console.log(`Faculty MaxFeelsLike from page: ${maxFeelsLike}`);
            
            if (maxFeelsLike === null) {
                console.log('Faculty MaxFeelsLike is null, allowing attendance');
                return true;
            }
            
            if (maxFeelsLike >= 42) {
                console.log(`Faculty Heat conditions unsafe - MaxFeelsLike ${maxFeelsLike}°C (threshold: 42°C)`);
                this.updateHeatIndexDisplay(maxFeelsLike);
                return false;
            }
            
            console.log(`Faculty Heat conditions safe - MaxFeelsLike ${maxFeelsLike}°C`);
            return true;
        } catch (error) {
            console.error('Faculty error checking heat conditions:', error);
            return true; // Allow attendance if we can't check
        }
    }

    getMaxFeelsLikeFromPage() {
        try {
            console.log('Faculty getting MaxFeelsLike from page...');
            
            // First try to get from weather data JSON
            const weatherDataElement = document.getElementById('weather-data');
            if (weatherDataElement) {
                console.log('Faculty found weather-data element');
                try {
                    const weatherData = JSON.parse(weatherDataElement.textContent);
                    console.log('Faculty weather data:', weatherData);
                    
                    if (weatherData.maxFeelsLike && weatherData.weatherDataAvailable) {
                        const maxFeelsLike = parseFloat(weatherData.maxFeelsLike);
                        console.log(`Faculty MaxFeelsLike from weather data: ${maxFeelsLike}°C`);
                        return maxFeelsLike;
                    } else {
                        console.log('Faculty weather data does not have maxFeelsLike or weather not available');
                        console.log(`Faculty maxFeelsLike: ${weatherData.maxFeelsLike}, weatherDataAvailable: ${weatherData.weatherDataAvailable}`);
                    }
                } catch (parseError) {
                    console.error('Faculty error parsing weather data:', parseError);
                }
            } else {
                console.log('Faculty weather-data element not found');
            }

            // Try to get MaxFeelsLike from ViewBag data (server-side rendered)
            if (typeof window !== 'undefined' && window.ViewBag && window.ViewBag.MaxFeelsLike) {
                const maxFeelsLike = parseFloat(window.ViewBag.MaxFeelsLike);
                console.log(`Faculty MaxFeelsLike from ViewBag: ${maxFeelsLike}°C`);
                return maxFeelsLike;
            }

            // Try to get from DOM elements with data attributes
            const maxFeelsLikeElements = [
                document.querySelector('[data-max-feels-like]'),
                document.querySelector('#maxFeelsLike'),
                document.querySelector('.max-feels-like-value'),
                // Also check the temperature forecast card
                document.querySelector('.text-2xl.font-bold.text-orange-600')
            ];

            for (const element of maxFeelsLikeElements) {
                if (element) {
                    let value = element.textContent || element.getAttribute('data-max-feels-like');
                    // Remove °C if present
                    if (value && typeof value === 'string') {
                        value = value.replace('°C', '').trim();
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                            console.log(`Faculty MaxFeelsLike from DOM element: ${numValue}°C`);
                            return numValue;
                        }
                    }
                }
            }

            // Try to extract from the dashboard's temperature forecast card
            const tempForecastCard = document.querySelector('.text-2xl.font-bold.text-orange-600');
            if (tempForecastCard) {
                const text = tempForecastCard.textContent;
                const match = text.match(/(\d+(?:\.\d+)?)°C/);
                if (match) {
                    const maxFeelsLike = parseFloat(match[1]);
                    console.log(`Faculty MaxFeelsLike from forecast card: ${maxFeelsLike}°C`);
                    return maxFeelsLike;
                }
            }

            // Fallback to current heat index if MaxFeelsLike not available
            console.log('Faculty MaxFeelsLike not found, trying heat index fallback');
            return this.getHeatIndexFromPage();
        } catch (error) {
            console.error('Faculty error getting MaxFeelsLike:', error);
            return null;
        }
    }

    getHeatIndexFromPage() {
        try {
            console.log('Faculty getting heat index from page...');
            
            // Try to get from weather data JSON first
            const weatherDataElement = document.getElementById('weather-data');
            if (weatherDataElement) {
                try {
                    const weatherData = JSON.parse(weatherDataElement.textContent);
                    console.log('Faculty weather data for heat index:', weatherData);
                    
                    if (weatherData.heatIndex && weatherData.weatherDataAvailable) {
                        const heatIndex = parseFloat(weatherData.heatIndex);
                        console.log(`Faculty heat index from weather data: ${heatIndex}°C`);
                        return heatIndex;
                    }
                } catch (parseError) {
                    console.error('Faculty error parsing weather data for heat index:', parseError);
                }
            }

            // Try to get heat index from ViewBag data
            if (typeof window !== 'undefined' && window.ViewBag && window.ViewBag.HeatIndex) {
                const heatIndex = parseFloat(window.ViewBag.HeatIndex);
                console.log(`Faculty heat index from ViewBag: ${heatIndex}°C`);
                return heatIndex;
            }

            // Try to get from DOM elements
            const heatIndexElements = [
                document.querySelector('[data-heat-index]'),
                document.querySelector('#heatIndex'),
                document.querySelector('.heat-index-value')
            ];

            for (const element of heatIndexElements) {
                if (element) {
                    const value = parseFloat(element.textContent || element.getAttribute('data-heat-index'));
                    if (!isNaN(value)) {
                        console.log(`Faculty heat index from DOM: ${value}°C`);
                        return value;
                    }
                }
            }

            // Try to calculate from temperature and humidity if available
            console.log('Faculty trying to calculate heat index from temperature and humidity');
            return this.calculateHeatIndexFromWeatherData();
        } catch (error) {
            console.error('Faculty error getting heat index:', error);
            return null;
        }
    }

    calculateHeatIndexFromWeatherData() {
        try {
            console.log('Faculty calculating heat index from weather data...');
            
            // Try to get from weather data JSON first
            const weatherDataElement = document.getElementById('weather-data');
            if (weatherDataElement) {
                try {
                    const weatherData = JSON.parse(weatherDataElement.textContent);
                    console.log('Faculty weather data for calculation:', weatherData);
                    
                    if (weatherData.temperature && weatherData.humidity && weatherData.weatherDataAvailable) {
                        const temp = parseFloat(weatherData.temperature);
                        const humidity = parseFloat(weatherData.humidity);
                        
                        console.log(`Faculty calculation inputs - temp: ${temp}°C, humidity: ${humidity}%`);
                        
                        if (!isNaN(temp) && !isNaN(humidity)) {
                            // Simple heat index calculation (basic formula)
                            const heatIndex = temp + (0.5 * humidity);
                            console.log(`Faculty calculated heat index: ${heatIndex}°C`);
                            return heatIndex;
                        }
                    }
                } catch (parseError) {
                    console.error('Faculty error parsing weather data for calculation:', parseError);
                }
            }

            // Fallback to DOM elements
            const tempElement = document.querySelector('[data-temperature]') || 
                              document.querySelector('#temperature');
            const humidityElement = document.querySelector('[data-humidity]') || 
                                  document.querySelector('#humidity');

            let temp = null;
            let humidity = null;

            if (tempElement) {
                temp = parseFloat(tempElement.textContent || tempElement.getAttribute('data-temperature'));
                console.log(`Faculty temp from DOM: ${temp}`);
            }
            if (humidityElement) {
                humidity = parseFloat(humidityElement.textContent || humidityElement.getAttribute('data-humidity'));
                console.log(`Faculty humidity from DOM: ${humidity}`);
            }

            // Try ViewBag as fallback
            if (temp === null && typeof window !== 'undefined' && window.ViewBag && window.ViewBag.Temperature) {
                temp = parseFloat(window.ViewBag.Temperature);
                console.log(`Faculty temp from ViewBag: ${temp}`);
            }
            if (humidity === null && typeof window !== 'undefined' && window.ViewBag && window.ViewBag.Humidity) {
                humidity = parseFloat(window.ViewBag.Humidity);
                console.log(`Faculty humidity from ViewBag: ${humidity}`);
            }

            if (temp !== null && humidity !== null && !isNaN(temp) && !isNaN(humidity)) {
                // Simple heat index calculation (basic formula)
                const heatIndex = temp + (0.5 * humidity);
                console.log(`Faculty calculated heat index from fallback: ${heatIndex}°C`);
                return heatIndex;
            }

            console.log('Faculty unable to calculate heat index - missing data');
            return null;
        } catch (error) {
            console.error('Faculty error calculating heat index:', error);
            return null;
        }
    }

    updateHeatIndexDisplay(heatIndex) {
        const heatIndexElement = document.getElementById('facultyCurrentHeatIndex');
        if (heatIndexElement) {
            heatIndexElement.textContent = `${Math.round(heatIndex)}°C`;
        }
    }

    showHeatNotification() {
        // Create a subtle notification that attendance is suspended
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-thermometer-full text-red-600 mr-2"></i>
                <div>
                    <div class="font-medium">Faculty Attendance Suspended</div>
                    <div class="text-sm">Due to extreme heat conditions</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    showModal() {
        if (!this.modal) {
            console.error('Faculty modal element not found!');
            return;
        }
        
        console.log('Faculty showing modal - element found:', !!this.modal);
        console.log('Faculty modal current classes:', this.modal.className);
        
        // Show modal with flexbox positioning
        this.modal.classList.remove('hidden');
        
        console.log('Faculty modal classes after show:', this.modal.className);
        
        // Animate modal appearance
        setTimeout(() => {
            const content = this.modal.querySelector('div > div');
            if (content) {
                console.log('Faculty animating modal content');
                content.classList.remove('scale-95');
                content.classList.add('scale-100');
            } else {
                console.error('Faculty modal content element not found');
            }
        }, 10);

        // Load current class info and populate the modal
        this.loadCurrentClassInfo();
        
        // Initialize camera
        this.initializeCamera();
    }

    hideModal() {
        if (!this.modal) return;
        
        console.log('Faculty hiding modal');
        const content = this.modal.querySelector('div > div');
        if (content) {
            content.classList.remove('scale-100');
            content.classList.add('scale-95');
        }
        
        setTimeout(() => {
            this.modal.classList.add('hidden');
        }, 200);

        // Stop camera stream and reset states
        this.stopCamera();
    }

    showHeatWarningModal() {
        if (!this.heatWarningModal) return;
        
        console.log('Faculty showing heat warning modal');
        
        // Update heat index display
        const heatIndexElement = document.getElementById('facultyCurrentHeatIndex');
        if (heatIndexElement && this.maxFeelsLike !== null) {
            heatIndexElement.textContent = `${Math.round(this.maxFeelsLike)}°C`;
        }
        
        this.heatWarningModal.classList.remove('hidden');
        
        // Animate modal appearance
        setTimeout(() => {
            const content = this.heatWarningModal.querySelector('div > div');
            if (content) {
                content.classList.remove('scale-95');
                content.classList.add('scale-100');
            }
        }, 10);
    }

    hideHeatWarningModal() {
        if (!this.heatWarningModal) return;
        
        console.log('Faculty hiding heat warning modal');
        const content = this.heatWarningModal.querySelector('div > div');
        if (content) {
            content.classList.remove('scale-100');
            content.classList.add('scale-95');
        }
        
        setTimeout(() => {
            this.heatWarningModal.classList.add('hidden');
        }, 200);
    }

    showSuccessModal(classInfo) {
        if (!this.successModal) return;
        
        // Update success modal content
        this.updateSuccessModalContent(classInfo);
        
        this.successModal.classList.remove('hidden');
        
        // Animate modal appearance
        setTimeout(() => {
            const content = this.successModal.querySelector('div > div');
            if (content) {
                content.classList.remove('scale-95');
                content.classList.add('scale-100');
            }
        }, 10);
    }

    hideSuccessModal() {
        if (!this.successModal) return;
        
        console.log('Faculty hiding success modal');
        const content = this.successModal.querySelector('div > div');
        if (content) {
            content.classList.remove('scale-100');
            content.classList.add('scale-95');
        }
        
        setTimeout(() => {
            this.successModal.classList.add('hidden');
        }, 200);
    }

    stopCamera() {
        console.log('Faculty stopping camera...');
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.video) {
            this.video.srcObject = null;
        }
        
        // Reset camera started flag
        this.cameraStarted = false;
        
        // Show loading overlay again for next time
        const loadingOverlay = document.getElementById('facultyCameraLoading');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
            loadingOverlay.innerHTML = `
                <div class="text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p class="text-sm text-gray-600">Starting camera...</p>
                </div>
            `;
        }
        
        // Reset button states
        const submitButton = document.getElementById('markFacultyAttendanceBtn');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = `
                <svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                </svg>
                Mark Present
            `;
        }
    }

    initializeCamera() {
        console.log('Faculty initializing camera...');
        
        if (!this.video) {
            console.error('Faculty video element not found');
            return;
        }

        // Stop any existing streams first
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        const loadingOverlay = document.getElementById('facultyCameraLoading');
        console.log('Faculty loading overlay element found:', !!loadingOverlay);

        // Show loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }

        // Disable submit button until camera is ready
        const submitButton = document.getElementById('markFacultyAttendanceBtn');
        if (submitButton) {
            submitButton.disabled = true;
        }

        navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: 640, 
                height: 480,
                facingMode: 'user'
            } 
        })
        .then(stream => {
            console.log('Faculty camera stream obtained');
            this.stream = stream;
            this.video.srcObject = stream;
            
            // Wait for video to actually start playing before hiding overlay
            this.video.addEventListener('loadedmetadata', () => {
                console.log('Faculty video metadata loaded');
                this.video.play().then(() => {
                    console.log('Faculty video playing, hiding loading overlay');
                    if (loadingOverlay) {
                        loadingOverlay.classList.add('hidden');
                    }
                    if (submitButton) {
                        submitButton.disabled = false;
                    }
                }).catch(error => {
                    console.error('Faculty video play error:', error);
                });
            });

            // Fallback: hide overlay after a short delay even if events don't fire
            setTimeout(() => {
                if (loadingOverlay && !loadingOverlay.classList.contains('hidden')) {
                    console.log('Faculty fallback: hiding loading overlay after timeout');
                    loadingOverlay.classList.add('hidden');
                }
                if (submitButton) {
                    submitButton.disabled = false;
                }
            }, 3000);
        })
        .catch(error => {
            console.error('Faculty camera error:', error);
            if (loadingOverlay) {
                loadingOverlay.innerHTML = `
                    <div class="text-center">
                        <i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
                        <p class="text-sm text-red-600">Camera access denied or unavailable</p>
                        <p class="text-xs text-gray-500 mt-1">Please allow camera access to mark attendance</p>
                    </div>
                `;
            }
            if (submitButton) {
                submitButton.disabled = false;
            }
        });
    }

    populateClassInfo(classInfo) {
        if (!classInfo) return;
        
        console.log('Populating faculty class info:', classInfo);
        
        // Get the class info container
        const classInfoContainer = document.getElementById('currentFacultyInfo');
        if (!classInfoContainer) return;
        
        const currentDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Use Pascal case property names (C# convention) with fallbacks to camelCase
        const courseName = classInfo.CourseName || classInfo.courseName || 'Natural Language Processing';
        const courseCode = classInfo.CourseCode || classInfo.courseCode || 'CS-4203';
        const sectionName = classInfo.SectionName || classInfo.sectionName || '4-2';
        const room = classInfo.Room || classInfo.room || 'Lecture Hall 1';
        const startTime = classInfo.StartTime || classInfo.startTime || '11:00';
        const endTime = classInfo.EndTime || classInfo.endTime || '19:00';
        const status = (classInfo.Status || classInfo.status || 'ongoing').toLowerCase();

        // Populate the modal with structured class information
        classInfoContainer.innerHTML = `
            <h4 class="font-medium text-gray-900 mb-2">
                ${status === 'ongoing' ? 'Current Class' : 
                  status === 'upcoming' ? 'Next Class' : 'Class Information'}
            </h4>
            <div class="space-y-1 text-sm text-gray-600">
                <div id="facultyClassName"><strong>${courseName}</strong> (${courseCode})</div>
                <div id="facultyClassTime">
                    <i class="fas fa-clock mr-1"></i>${startTime} - ${endTime}
                </div>
                <div id="facultyClassSection">
                    <i class="fas fa-users mr-1"></i>Section ${sectionName}
                </div>
                <div id="facultyClassRoom">
                    <i class="fas fa-map-marker-alt mr-1"></i>Room ${room}
                </div>
            </div>
        `;
        
        console.log('Faculty class info populated successfully');
    }

    loadCurrentClassInfo() {
        try {
            console.log('Faculty loading current class info...');
            
            // First try to get from dashboard data attributes
            const currentClassCard = document.querySelector('[data-current-class="true"]');
            if (currentClassCard) {
                const courseName = currentClassCard.getAttribute('data-course-name');
                const courseCode = currentClassCard.getAttribute('data-course-code');
                const sectionName = currentClassCard.getAttribute('data-section-name');
                const room = currentClassCard.getAttribute('data-room');
                const startTime = currentClassCard.getAttribute('data-start-time');
                const endTime = currentClassCard.getAttribute('data-end-time');
                const status = currentClassCard.getAttribute('data-status');
                
                console.log('Found class data from attributes:', {
                    courseName, courseCode, sectionName, room, startTime, endTime, status
                });
                
                if (courseName && courseName !== 'null') {
                    const classInfo = {
                        CourseName: courseName,
                        CourseCode: courseCode,
                        SectionName: sectionName,
                        Room: room,
                        StartTime: startTime,
                        EndTime: endTime,
                        Status: status || 'ongoing'
                    };
                    this.populateClassInfo(classInfo);
                    return;
                }
            }
            
            // Then try dashboard data JSON
            const dashboardDataElement = document.getElementById('faculty-dashboard-data');
            const hasRealData = document.getElementById('has-real-data')?.textContent === 'true';
            
            console.log('Dashboard data element found:', !!dashboardDataElement);
            console.log('Has real data:', hasRealData);
            
            if (hasRealData && dashboardDataElement) {
                try {
                    const facultyData = JSON.parse(dashboardDataElement.textContent);
                    console.log('Faculty data parsed:', facultyData);
                    
                    // Try multiple property path variations
                    const currentClass = facultyData?.ScheduleSummary?.CurrentClass || 
                                        facultyData?.scheduleSummary?.currentClass ||
                                        facultyData?.CurrentClass;
                    const nextClass = facultyData?.ScheduleSummary?.NextClass || 
                                     facultyData?.scheduleSummary?.nextClass ||
                                     facultyData?.NextClass;
                    
                    console.log('Current class from data:', currentClass);
                    console.log('Next class from data:', nextClass);
                    
                    const classToShow = currentClass || nextClass;
                    
                    if (classToShow) {
                        console.log('Using class for display:', classToShow);
                        this.populateClassInfo(classToShow);
                        return;
                    }
                } catch (parseError) {
                    console.error('Error parsing faculty dashboard data:', parseError);
                }
            }
            
            // Final fallback - show personal attendance
            console.log('No current class found, showing personal attendance');
            this.showPersonalAttendanceInfo();
            
        } catch (error) {
            console.error('Error loading current class info:', error);
            this.showPersonalAttendanceInfo();
        }
    }

    showPersonalAttendanceInfo() {
        const classInfoContainer = document.getElementById('currentFacultyInfo');
        if (!classInfoContainer) return;
        
        const currentDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Show personal attendance info when no class is available
        classInfoContainer.innerHTML = `
            <h4 class="font-medium text-gray-900 mb-2">Today's Date</h4>
            <div class="text-sm text-gray-600 mb-3">${currentDate}</div>
            <div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 class="font-medium text-yellow-800 mb-1">
                    <i class="fas fa-info-circle mr-1"></i>
                    Personal Attendance
                </h5>
                <p class="text-sm text-yellow-700">
                    No current class in session - marking personal attendance
                </p>
            </div>
        `;
    }

    // Remove the old updateCurrentClassDisplay method as we now use populateClassInfo
    // ...existing code...

    async submitFacultyAttendance() {
        try {
            const submitButton = document.getElementById('markFacultyAttendanceBtn');
            if (!submitButton) return;

            // Disable button and show loading
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 008-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
            `;

            // Get current class info for the submission
            const currentClassInfo = this.getCurrentClassInfo();
            
            // Simulate attendance submission (replace with actual API call when endpoint is ready)
            await this.simulateAttendanceSubmission(currentClassInfo);

            // Hide the attendance modal
            this.hideModal();

            // Show success modal
            this.showSuccessModal(currentClassInfo);

        } catch (error) {
            console.error('Error submitting faculty attendance:', error);
            
            // Re-enable button
            const submitButton = document.getElementById('markFacultyAttendanceBtn');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = `
                    <svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                `;
            }

            // Show error message
            this.showError('Failed to submit attendance. Please try again.');
        }
    }

    getCurrentClassInfo() {
        try {
            const dashboardDataElement = document.getElementById('faculty-dashboard-data');
            const hasRealData = document.getElementById('has-real-data')?.textContent === 'true';
            
            if (hasRealData && dashboardDataElement) {
                const facultyData = JSON.parse(dashboardDataElement.textContent);
                return facultyData?.scheduleSummary?.currentClass;
            }
            
            // Return null if no current class
            return null;
        } catch (error) {
            console.error('Error getting current class info:', error);
            return null;
        }
    }

    async simulateAttendanceSubmission(classInfo) {
        // Simulate API call delay
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Faculty attendance submitted successfully');
                resolve({
                    success: true,
                    message: 'Attendance recorded successfully',
                    data: {
                        status: 'present',
                        timestamp: new Date().toISOString(),
                        class: classInfo
                    }
                });
            }, 2000); // 2 second delay to simulate network request
        });
    }

    updateSuccessModalContent(classInfo) {
        const now = new Date();
        
        // Update faculty details
        document.getElementById('successFacultyName').textContent = this.getFacultyName();
        document.getElementById('successDepartmentName').textContent = this.getFacultyDepartment();
        document.getElementById('facultySuccessTime').textContent = now.toLocaleTimeString();
        document.getElementById('facultySuccessDate').textContent = now.toLocaleDateString();
        
        // Update current class info
        if (classInfo) {
            document.getElementById('successCurrentClass').textContent = 
                `${classInfo.courseName} - ${classInfo.sectionName}`;
        } else {
            document.getElementById('successCurrentClass').textContent = 'Personal Attendance';
        }
        
        // Update submission time
        document.getElementById('facultySubmissionTime').textContent = 
            `Recorded at ${now.toLocaleTimeString()}`;
    }

    getFacultyName() {
        if (typeof window !== 'undefined' && window.ViewBag) {
            const firstName = window.ViewBag.FirstName || '';
            const lastName = window.ViewBag.LastName || '';
            return `${firstName} ${lastName}`.trim();
        }
        return 'Faculty Member';
    }

    getFacultyDepartment() {
        if (typeof window !== 'undefined' && window.ViewBag && window.ViewBag.Department) {
            return window.ViewBag.Department;
        }
        return 'Department';
    }

    getFacultyEmployeeId() {
        if (typeof window !== 'undefined' && window.ViewBag && window.ViewBag.EmployeeNumber) {
            return `Employee ID: ${window.ViewBag.EmployeeNumber}`;
        }
        return 'Employee ID: N/A';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if modal elements exist before initializing
    const facultyModal = document.getElementById('facultyMarkAttendanceModal');
    const facultyHeatModal = document.getElementById('facultyHeatWarningModal');
    const facultySuccessModal = document.getElementById('facultyAttendanceSuccessModal');
    
    if (!facultyModal || !facultyHeatModal || !facultySuccessModal) {
        console.error('Some faculty modal elements are missing! Cannot initialize faculty attendance modal.');
        return;
    }
    
    window.facultyAttendanceModal = new FacultyAttendanceModal();
    
    // Debug: Check if ViewBag data is available
    if (window.ViewBag) {
        console.log('Faculty ViewBag data available:', {
            FirstName: window.ViewBag.FirstName,
            LastName: window.ViewBag.LastName,
            Department: window.ViewBag.Department,
            EmployeeNumber: window.ViewBag.EmployeeNumber
        });
    } else {
        console.log('Faculty ViewBag data not available on window object');
    }
    
    // Debug: Check weather data
    const weatherData = document.getElementById('weather-data');
    if (weatherData) {
        try {
            const data = JSON.parse(weatherData.textContent);
            console.log('Faculty weather data available:', data);
        } catch (e) {
            console.error('Faculty error parsing weather data:', e);
        }
    }
    
    // Debug: Check faculty dashboard data
    const facultyDashboardData = document.getElementById('faculty-dashboard-data');
    if (facultyDashboardData) {
        try {
            const data = JSON.parse(facultyDashboardData.textContent);
            console.log('Faculty dashboard data available:', data);
        } catch (e) {
            console.error('Faculty error parsing dashboard data:', e);
        }
    } else {
        console.log('No faculty dashboard data element found');
    }
});
        

