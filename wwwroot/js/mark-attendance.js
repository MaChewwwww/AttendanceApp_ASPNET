// Mark Attendance Modal Manager - Optimized for Speed
window.MarkAttendanceModal = {
    video: null,
    canvas: null,
    stream: null,
    currentClass: null,
    maxFeelsLike: null,
    cameraStarted: false,
    
    init: function() {
        this.setupEventListeners();
        this.loadWeatherData();
        // Pre-cache DOM elements for faster access
        this.modal = document.getElementById('markAttendanceModal');
        this.heatModal = document.getElementById('heatWarningModal');
        this.video = document.getElementById('attendanceVideo');
        this.canvas = document.getElementById('attendanceCanvas');
        this.cameraLoading = document.getElementById('cameraLoading');
        this.markBtn = document.getElementById('markAttendanceBtn');
        
        console.log('Mark Attendance Modal initialized');
    },
    
    setupEventListeners: function() {
        // Mark Attendance button click
        const markAttendanceButtons = document.querySelectorAll('[data-action="mark-attendance"]');
        markAttendanceButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleMarkAttendanceClick();
            });
        });
        
        // Modal close events
        document.getElementById('closeMarkAttendanceModal')?.addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('cancelAttendanceBtn')?.addEventListener('click', () => {
            this.closeModal();
        });
        
        // Heat warning modal close
        document.getElementById('closeHeatWarningBtn')?.addEventListener('click', () => {
            this.closeHeatWarningModal();
        });
        
        // Mark attendance action
        document.getElementById('markAttendanceBtn')?.addEventListener('click', () => {
            this.captureAndSubmitAttendance();
        });
        
        // Close modal when clicking outside
        document.getElementById('markAttendanceModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'markAttendanceModal') {
                this.closeModal();
            }
        });
        
        document.getElementById('heatWarningModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'heatWarningModal') {
                this.closeHeatWarningModal();
            }
        });
    },
    
    loadWeatherData: function() {
        try {
            const maxFeelsLikeElement = document.querySelector('[data-max-feels-like]');
            if (maxFeelsLikeElement) {
                this.maxFeelsLike = parseFloat(maxFeelsLikeElement.dataset.maxFeelsLike);
            } else if (typeof window.maxFeelsLike !== 'undefined') {
                this.maxFeelsLike = window.maxFeelsLike;
            }
            
            console.log('Weather data loaded - Max Feels Like:', this.maxFeelsLike);
        } catch (error) {
            console.error('Error loading weather data:', error);
            this.maxFeelsLike = null;
        }
    },
    
    getCurrentClassData: function() {
        try {
            const currentClassCard = document.querySelector('[data-current-class]');
            if (currentClassCard) {
                return {
                    courseName: currentClassCard.dataset.courseName || 'Unknown Course',
                    courseCode: currentClassCard.dataset.courseCode || 'N/A',
                    facultyName: currentClassCard.dataset.facultyName || 'Unknown Faculty',
                    room: currentClassCard.dataset.room || 'TBA',
                    startTime: currentClassCard.dataset.startTime || '',
                    endTime: currentClassCard.dataset.endTime || '',
                    status: currentClassCard.dataset.status || 'ongoing'
                };
            }
        } catch (error) {
            console.error('Error getting current class data:', error);
        }
        
        return null;
    },
    
    validateHeatConditions: function() {
        if (this.maxFeelsLike === null || this.maxFeelsLike === undefined) {
            console.warn('Heat index data not available, allowing attendance');
            return true;
        }
        
        const heatThreshold = 42;
        const isSafe = this.maxFeelsLike < heatThreshold;
        
        console.log(`Heat validation - Max Feels Like: ${this.maxFeelsLike}°C, Threshold: ${heatThreshold}°C, Safe: ${isSafe}`);
        
        return isSafe;
    },
    
    handleMarkAttendanceClick: function() {
        console.log('Mark Attendance clicked');
        
        // First validate heat conditions
        if (!this.validateHeatConditions()) {
            this.showHeatWarning();
            return;
        }
        
        // Get current class data
        this.currentClass = this.getCurrentClassData();
        
        if (!this.currentClass) {
            this.showError('No current class information available');
            return;
        }
        
        // Open the attendance modal immediately
        this.openModal();
    },
    
    showHeatWarning: function() {
        const heatIndexElement = document.getElementById('currentHeatIndex');
        
        if (heatIndexElement && this.maxFeelsLike !== null) {
            heatIndexElement.textContent = `${this.maxFeelsLike}°C`;
        }
        
        // Fast modal opening
        this.heatModal.classList.remove('hidden');
        
        // Quick animation
        requestAnimationFrame(() => {
            const modalContent = this.heatModal.querySelector('div > div');
            modalContent.style.transform = 'scale(1)';
        });
        
        console.log('Heat warning modal displayed');
    },
    
    closeHeatWarningModal: function() {
        const modalContent = this.heatModal.querySelector('div > div');
        modalContent.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            this.heatModal.classList.add('hidden');
        }, 200);
    },
    
    openModal: function() {
        // Populate current class information immediately
        this.populateClassInfo();
        
        // Show modal immediately with fast animation
        this.modal.classList.remove('hidden');
        
        // Trigger scale animation
        requestAnimationFrame(() => {
            const modalContent = this.modal.querySelector('div > div');
            modalContent.style.transform = 'scale(1)';
        });
        
        // Start camera asynchronously after modal is visible
        setTimeout(() => {
            this.startCamera();
        }, 50);
        
        console.log('Mark Attendance modal opened');
    },
    
    populateClassInfo: function() {
        if (!this.currentClass) return;
        
        // Use cached elements for faster updates
        const classNameEl = document.getElementById('className');
        const classTimeEl = document.getElementById('classTime');
        const classFacultyEl = document.getElementById('classFaculty');
        const classRoomEl = document.getElementById('classRoom');
        
        if (classNameEl) {
            classNameEl.innerHTML = `<strong>${this.currentClass.courseName}</strong> (${this.currentClass.courseCode})`;
        }
        
        if (classTimeEl) {
            const timeText = this.currentClass.startTime && this.currentClass.endTime 
                ? `${this.currentClass.startTime} - ${this.currentClass.endTime}`
                : 'Time: TBA';
            classTimeEl.innerHTML = `<i class="fas fa-clock mr-1"></i>${timeText}`;
        }
        
        if (classFacultyEl) {
            classFacultyEl.innerHTML = `<i class="fas fa-user mr-1"></i>${this.currentClass.facultyName}`;
        }
        
        if (classRoomEl) {
            classRoomEl.innerHTML = `<i class="fas fa-map-marker-alt mr-1"></i>Room ${this.currentClass.room}`;
        }
    },
    
    startCamera: function() {
        if (this.cameraStarted) {
            return;
        }
        
        this.cameraStarted = true;
        
        // Disable the mark attendance button until camera is ready
        if (this.markBtn) {
            this.markBtn.disabled = true;
        }
        
        // Request camera with optimized constraints
        navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 640, max: 1280 },
                height: { ideal: 480, max: 720 },
                facingMode: 'user',
                frameRate: { ideal: 15, max: 30 } // Lower framerate for faster start
            },
            audio: false
        })
        .then(stream => {
            this.stream = stream;
            if (this.video) {
                this.video.srcObject = stream;
                
                // Hide loading overlay when video starts playing
                this.video.addEventListener('loadedmetadata', () => {
                    if (this.cameraLoading) {
                        this.cameraLoading.style.display = 'none';
                    }
                    if (this.markBtn) {
                        this.markBtn.disabled = false;
                    }
                });
                
                // Fallback timeout to hide loading
                setTimeout(() => {
                    if (this.cameraLoading) {
                        this.cameraLoading.style.display = 'none';
                    }
                    if (this.markBtn) {
                        this.markBtn.disabled = false;
                    }
                }, 3000);
            }
            console.log('Camera started successfully');
        })
        .catch(err => {
            console.error('Error accessing camera:', err);
            this.cameraStarted = false;
            if (this.cameraLoading) {
                this.cameraLoading.innerHTML = `
                    <div class="text-center">
                        <div class="text-red-500 mb-2">
                            <svg class="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                        <p class="text-sm text-red-600">Camera access denied</p>
                        <p class="text-xs text-gray-500 mt-1">Please enable camera permissions</p>
                    </div>
                `;
            }
            this.showError('Unable to access camera. Please check permissions and try again.');
        });
    },
    
    closeModal: function() {
        // Fast close animation
        const modalContent = this.modal.querySelector('div > div');
        modalContent.style.transform = 'scale(0.95)';
        
        // Stop camera stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        // Reset states
        this.cameraStarted = false;
        if (this.markBtn) {
            this.markBtn.disabled = false;
        }
        if (this.cameraLoading) {
            this.cameraLoading.style.display = 'flex';
            this.cameraLoading.innerHTML = `
                <div class="text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p class="text-sm text-gray-600">Starting camera...</p>
                </div>
            `;
        }
        
        setTimeout(() => {
            this.modal.classList.add('hidden');
        }, 200);
        
        console.log('Mark Attendance modal closed');
    },
    
    captureAndSubmitAttendance: function() {
        if (!this.video || !this.canvas) {
            this.showError('Camera not available');
            return;
        }
        
        try {
            // Capture image from video
            const context = this.canvas.getContext('2d');
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            
            context.drawImage(this.video, 0, 0);
            const imageDataURL = this.canvas.toDataURL('image/jpeg', 0.8);
            
            console.log('Image captured for attendance');
            
            // TODO: Implement actual attendance submission
            this.showSuccess('Attendance marked successfully!');
            
            // Close modal after successful capture
            setTimeout(() => {
                this.closeModal();
            }, 1500);
            
        } catch (error) {
            console.error('Error capturing attendance image:', error);
            this.showError('Failed to capture image. Please try again.');
        }
    },
    
    showError: function(message) {
        this.showNotification(message, 'error');
    },
    
    showSuccess: function(message) {
        this.showNotification(message, 'success');
    },
    
    showNotification: function(message, type) {
        const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
        const icon = type === 'error' ? 
            '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>' :
            '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>';
        
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
        notification.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    ${icon}
                </svg>
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Slide out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(full)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, type === 'error' ? 5000 : 3000);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.MarkAttendanceModal !== 'undefined') {
        window.MarkAttendanceModal.init();
    }
});
