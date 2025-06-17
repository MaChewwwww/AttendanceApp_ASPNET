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
            btn.addEventListener('click', () => this.handleMarkAttendanceClick());
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
        // First check heat conditions
        const isHeatSafe = await this.checkHeatConditions();
        
        if (!isHeatSafe) {
            this.showHeatWarningModal();
            return;
        }

        // If heat is safe, show the attendance modal
        this.showModal();
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
            const maxFeelsLike = this.getMaxFeelsLikeFromPage();
            
            if (maxFeelsLike === null) {
                return true;
            }
            
            if (maxFeelsLike >= 42) {
                this.updateHeatIndexDisplay(maxFeelsLike);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error checking heat conditions:', error);
            return true; // Allow attendance if we can't check
        }
    }

    getMaxFeelsLikeFromPage() {
        try {
            // First try to get from weather data JSON
            const weatherDataElement = document.getElementById('weather-data');
            if (weatherDataElement) {
                const weatherData = JSON.parse(weatherDataElement.textContent);
                if (weatherData.maxFeelsLike && weatherData.weatherDataAvailable) {
                    return parseFloat(weatherData.maxFeelsLike);
                }
            }

            // Try to get MaxFeelsLike from ViewBag data
            if (typeof ViewBag !== 'undefined' && ViewBag.MaxFeelsLike) {
                return parseFloat(ViewBag.MaxFeelsLike);
            }

            // Try to get from DOM elements
            const maxFeelsLikeElements = [
                document.querySelector('[data-max-feels-like]'),
                document.querySelector('#maxFeelsLike'),
                document.querySelector('.max-feels-like-value')
            ];

            for (const element of maxFeelsLikeElements) {
                if (element) {
                    const value = parseFloat(element.textContent || element.getAttribute('data-max-feels-like'));
                    if (!isNaN(value)) {
                        return value;
                    }
                }
            }

            // Fallback to current heat index if MaxFeelsLike not available
            return this.getHeatIndexFromPage();
        } catch (error) {
            console.error('Error getting MaxFeelsLike:', error);
            return null;
        }
    }

    getHeatIndexFromPage() {
        try {
            // Try to get from weather data JSON first
            const weatherDataElement = document.getElementById('weather-data');
            if (weatherDataElement) {
                const weatherData = JSON.parse(weatherDataElement.textContent);
                if (weatherData.heatIndex && weatherData.weatherDataAvailable) {
                    return parseFloat(weatherData.heatIndex);
                }
            }

            // Try to get heat index from ViewBag data
            if (typeof ViewBag !== 'undefined' && ViewBag.HeatIndex) {
                return parseFloat(ViewBag.HeatIndex);
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
                        return value;
                    }
                }
            }

            // Try to calculate from temperature and humidity if available
            return this.calculateHeatIndexFromWeatherData();
        } catch (error) {
            console.error('Error getting heat index:', error);
            return null;
        }
    }

    calculateHeatIndexFromWeatherData() {
        try {
            // Try to get from weather data JSON first
            const weatherDataElement = document.getElementById('weather-data');
            if (weatherDataElement) {
                const weatherData = JSON.parse(weatherDataElement.textContent);
                if (weatherData.temperature && weatherData.humidity && weatherData.weatherDataAvailable) {
                    const temp = parseFloat(weatherData.temperature);
                    const humidity = parseFloat(weatherData.humidity);
                    
                    if (!isNaN(temp) && !isNaN(humidity)) {
                        // Simple heat index calculation (basic formula)
                        const heatIndex = temp + (0.5 * humidity);
                        return heatIndex;
                    }
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
            }
            if (humidityElement) {
                humidity = parseFloat(humidityElement.textContent || humidityElement.getAttribute('data-humidity'));
            }

            // Try ViewBag as fallback
            if (temp === null && typeof ViewBag !== 'undefined' && ViewBag.Temperature) {
                temp = parseFloat(ViewBag.Temperature);
            }
            if (humidity === null && typeof ViewBag !== 'undefined' && ViewBag.Humidity) {
                humidity = parseFloat(ViewBag.Humidity);
            }

            if (temp !== null && humidity !== null && !isNaN(temp) && !isNaN(humidity)) {
                // Simple heat index calculation (basic formula)
                const heatIndex = temp + (0.5 * humidity);
                return heatIndex;
            }

            return null;
        } catch (error) {
            console.error('Error calculating heat index:', error);
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
        if (!this.modal) return;
        
        this.modal.classList.remove('hidden');
        
        // Animate modal appearance
        setTimeout(() => {
            const content = this.modal.querySelector('.transform');
            if (content) {
                content.classList.remove('scale-95');
                content.classList.add('scale-100');
            }
        }, 10);

        // Load faculty info
        this.loadFacultyInfo();
        
        // Initialize camera would go here (for later implementation)
        // this.initializeCamera();
    }

    hideModal() {
        if (!this.modal) return;
        
        const content = this.modal.querySelector('.transform');
        if (content) {
            content.classList.remove('scale-100');
            content.classList.add('scale-95');
        }
        
        setTimeout(() => {
            this.modal.classList.add('hidden');
        }, 200);

        // Stop camera stream would go here
        // this.stopCamera();
    }

    showHeatWarningModal() {
        if (!this.heatWarningModal) {
            console.error('Faculty heat warning modal not found!');
            return;
        }
        
        this.heatWarningModal.classList.remove('hidden');
        
        // Animate modal appearance
        setTimeout(() => {
            const content = this.heatWarningModal.querySelector('.transform');
            if (content) {
                content.classList.remove('scale-95');
                content.classList.add('scale-100');
            }
        }, 10);
    }

    hideHeatWarningModal() {
        if (!this.heatWarningModal) return;
        
        const content = this.heatWarningModal.querySelector('.transform');
        if (content) {
            content.classList.remove('scale-100');
            content.classList.add('scale-95');
        }
        
        setTimeout(() => {
            this.heatWarningModal.classList.add('hidden');
        }, 200);
    }

    showSuccessModal() {
        if (!this.successModal) return;
        
        this.successModal.classList.remove('hidden');
        
        // Animate modal appearance
        setTimeout(() => {
            const content = this.successModal.querySelector('.transform');
            if (content) {
                content.classList.remove('scale-95');
                content.classList.add('scale-100');
            }
        }, 10);
    }

    hideSuccessModal() {
        if (!this.successModal) return;
        
        const content = this.successModal.querySelector('.transform');
        if (content) {
            content.classList.remove('scale-100');
            content.classList.add('scale-95');
        }
        
        setTimeout(() => {
            this.successModal.classList.add('hidden');
        }, 200);
    }

    loadFacultyInfo() {
        try {
            // Get faculty info from ViewBag or session data
            const facultyName = this.getFacultyName();
            const department = this.getFacultyDepartment();
            const employeeId = this.getFacultyEmployeeId();
            const currentDate = new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Update modal content
            document.getElementById('facultyName').textContent = facultyName || 'Loading...';
            document.getElementById('facultyDepartment').textContent = department || 'Loading...';
            document.getElementById('facultyId').textContent = employeeId || 'Loading...';
            document.getElementById('currentDate').textContent = currentDate;

        } catch (error) {
            console.error('Error loading faculty info:', error);
        }
    }

    getFacultyName() {
        if (typeof ViewBag !== 'undefined') {
            const firstName = ViewBag.FirstName || '';
            const lastName = ViewBag.LastName || '';
            return `${firstName} ${lastName}`.trim();
        }
        return 'Faculty Member';
    }

    getFacultyDepartment() {
        if (typeof ViewBag !== 'undefined' && ViewBag.Department) {
            return ViewBag.Department;
        }
        return 'Department';
    }

    getFacultyEmployeeId() {
        if (typeof ViewBag !== 'undefined' && ViewBag.EmployeeNumber) {
            return `Employee ID: ${ViewBag.EmployeeNumber}`;
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
});



// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Faculty Attendance Modal...');
    
    // Check if modal elements exist before initializing
    const facultyModal = document.getElementById('facultyMarkAttendanceModal');
    const facultyHeatModal = document.getElementById('facultyHeatWarningModal');
    const facultySuccessModal = document.getElementById('facultyAttendanceSuccessModal');
    
    console.log('Modal elements check:');
    console.log('- Faculty attendance modal:', !!facultyModal);
    console.log('- Faculty heat warning modal:', !!facultyHeatModal);
    console.log('- Faculty success modal:', !!facultySuccessModal);
    
    if (!facultyModal || !facultyHeatModal || !facultySuccessModal) {
        console.error('Some faculty modal elements are missing! Cannot initialize faculty attendance modal.');
        console.log('Available elements with Modal in ID:', document.querySelectorAll('[id*="Modal"]'));
        return;
    }
    
    window.facultyAttendanceModal = new FacultyAttendanceModal();
    
    // Add test buttons to console
    console.log('Faculty Attendance Modal initialized!');
    console.log('Test functions available:');
    console.log('- testFacultyHeatWarning(45) - Test heat warning with MaxFeelsLike 45°C');
    console.log('- simulateFacultyMaxFeelsLike(42) - Simulate MaxFeelsLike conditions');
    console.log('- simulateFacultyMaxFeelsLike(30) - Test safe conditions');
});
