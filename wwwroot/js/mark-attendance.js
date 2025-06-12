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
        this.successModal = document.getElementById('attendanceSuccessModal');
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
        
        // Success modal close events
        document.getElementById('closeSuccessModalBtn')?.addEventListener('click', () => {
            this.closeSuccessModal();
        });
        
        document.getElementById('viewAttendanceBtn')?.addEventListener('click', () => {
            this.closeSuccessModal();
            // Redirect to attendance history page
            window.location.href = '/Student/AttendanceHistory';
        });
        
        // Close success modal when clicking outside
        document.getElementById('attendanceSuccessModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'attendanceSuccessModal') {
                this.closeSuccessModal();
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
                    assignedCourseId: currentClassCard.dataset.assignedCourseId || '0',
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
        
        // Open the attendance modal
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
                frameRate: { ideal: 15, max: 30 }
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
        
        if (!this.currentClass) {
            this.showError('No current class information available');
            return;
        }
        
        try {
            // Show loading state
            this.markBtn.disabled = true;
            this.markBtn.innerHTML = `
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                Submitting...
            `;
            
            // Capture image from video
            const context = this.canvas.getContext('2d');
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            
            context.drawImage(this.video, 0, 0);
            const imageDataURL = this.canvas.toDataURL('image/jpeg', 0.8);
            
            // Extract base64 data without the data URL prefix
            const base64Image = imageDataURL.split(',')[1];
            
            console.log('Image captured for attendance submission');
            
            // Submit attendance to API
            this.submitAttendanceToAPI(base64Image);
            
        } catch (error) {
            console.error('Error capturing attendance image:', error);
            this.showError('Failed to capture image. Please try again.');
            this.resetMarkButton();
        }
    },
    
    submitAttendanceToAPI: async function(base64Image) {
        try {
            // First validate attendance submission eligibility
            const validationData = {
                assigned_course_id: parseInt(this.currentClass.assignedCourseId || 0)
            };
            
            console.log('Validating attendance submission...', validationData);
            
            const validationResponse = await fetch('/Student/ValidateAttendanceSubmission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(validationData)
            });
            
            if (!validationResponse.ok) {
                throw new Error(`Validation request failed: ${validationResponse.status}`);
            }
            
            const validationResult = await validationResponse.json();
            console.log('Validation result:', validationResult);
            
            if (!validationResult.can_submit) {
                this.showError(validationResult.message || 'Cannot submit attendance at this time');
                this.resetMarkButton();
                return;
            }
            
            // Proceed with attendance submission - only required fields
            const submissionData = {
                assigned_course_id: parseInt(this.currentClass.assignedCourseId || 0),
                face_image: base64Image
            };
            
            console.log('Submitting attendance with data:', {
                assigned_course_id: submissionData.assigned_course_id,
                face_image_length: submissionData.face_image ? submissionData.face_image.length : 0,
                face_image_preview: submissionData.face_image ? submissionData.face_image.substring(0, 50) + '...' : 'none'
            });
            
            const submissionResponse = await fetch('/Student/SubmitAttendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(submissionData)
            });
            
            console.log('Submission response status:', submissionResponse.status);
            console.log('Submission response headers:', Object.fromEntries(submissionResponse.headers.entries()));
            
            if (!submissionResponse.ok) {
                const errorText = await submissionResponse.text();
                console.error('Submission response error:', errorText);
                throw new Error(`Submission request failed: ${submissionResponse.status} - ${errorText}`);
            }
            
            const responseText = await submissionResponse.text();
            console.log('Raw submission response:', responseText);
            
            let submissionResult;
            try {
                submissionResult = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse submission response as JSON:', parseError);
                console.error('Response text:', responseText);
                this.showError('Invalid response from server. Please try again.');
                this.resetMarkButton();
                return;
            }
            
            console.log('Parsed submission result:', submissionResult);
            console.log('Success property:', submissionResult.success);
            console.log('Message property:', submissionResult.message);
            console.log('Status property:', submissionResult.status);
            
            if (submissionResult.success) {
                const status = submissionResult.status || 'present';
                const statusText = status.charAt(0).toUpperCase() + status.slice(1);
                
                // Show brief success notification first
                this.showSuccess(`Attendance submitted successfully!`);
                
                // Close the mark attendance modal with delay
                setTimeout(() => {
                    this.closeModal();
                    
                    // Show success modal after mark attendance modal is fully closed
                    setTimeout(() => {
                        this.showSuccessModal(submissionResult, statusText);
                    }, 400); // Wait for close animation to complete
                }, 1000); // Show notification for 1 second
            } else {
                const errorMessage = submissionResult.message || 'Failed to submit attendance - no error message provided';
                console.error('Attendance submission failed:', errorMessage);
                console.error('Full response object:', submissionResult);
                this.showError(errorMessage);
                this.resetMarkButton();
            }
            
        } catch (error) {
            console.error('Error submitting attendance:', error);
            this.showError('Failed to submit attendance. Please try again.');
            this.resetMarkButton();
        }
    },
    
    showSuccessModal: function(submissionResult, statusText) {
        // Populate success modal with attendance details
        this.populateSuccessModal(submissionResult, statusText);
        
        // Show success modal with smooth entrance animation
        this.successModal.classList.remove('hidden');
        
        // Reset modal position for animation
        const modalContent = this.successModal.querySelector('div > div');
        modalContent.style.transform = 'scale(0.9)';
        modalContent.style.opacity = '0';
        
        // Trigger entrance animation with delay
        requestAnimationFrame(() => {
            setTimeout(() => {
                modalContent.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                modalContent.style.transform = 'scale(1)';
                modalContent.style.opacity = '1';
            }, 50);
        });
        
        // Add entrance animation to modal content
        setTimeout(() => {
            this.animateSuccessModalContent();
        }, 200);
        
        // Auto-close after 15 seconds with warning
        setTimeout(() => {
            if (!this.successModal.classList.contains('hidden')) {
            this.showAutoCloseWarning();
            
            // Actually close after additional delay
            setTimeout(() => {
                if (!this.successModal.classList.contains('hidden')) {
                this.closeSuccessModal();
                }
            }, 2000);
            }
        }, 15000);
        
        console.log('Success modal displayed with enhanced animations');
    },
    
    animateSuccessModalContent: function() {
        // Animate status display
        const statusElement = document.getElementById('attendanceStatus');
        if (statusElement) {
            statusElement.style.transform = 'scale(0)';
            statusElement.style.transition = 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            
            setTimeout(() => {
                statusElement.style.transform = 'scale(1)';
            }, 100);
        }
        
        // Animate details with staggered effect
        const detailItems = document.querySelectorAll('#attendanceDetails > div');
        detailItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            item.style.transition = 'all 0.4s ease-out';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 300 + (index * 100));
        });
        
        // Animate buttons
        const buttons = document.querySelectorAll('#attendanceSuccessModal button');
        buttons.forEach((button, index) => {
            button.style.opacity = '0';
            button.style.transform = 'translateY(20px)';
            button.style.transition = 'all 0.4s ease-out';
            
            setTimeout(() => {
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            }, 600 + (index * 150));
        });
    },
    
    showAutoCloseWarning: function() {
        // Add a subtle warning that modal will auto-close
        const modalContent = this.successModal.querySelector('.p-6');
        if (modalContent) {
            const warningElement = document.createElement('div');
            warningElement.className = 'mt-4 text-center text-sm text-gray-500 bg-gray-50 py-2 px-3 rounded-lg border animate-pulse';
            warningElement.innerHTML = `
                <i class="fas fa-clock mr-2"></i>
                This window will close automatically in 2 seconds...
            `;
            
            modalContent.appendChild(warningElement);
            
            // Fade in the warning
            warningElement.style.opacity = '0';
            warningElement.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                warningElement.style.transition = 'all 0.3s ease-out';
                warningElement.style.opacity = '1';
                warningElement.style.transform = 'translateY(0)';
            }, 50);
        }
    },
    
    populateSuccessModal: function(submissionResult, statusText) {
        // Update status with enhanced animations
        const statusElement = document.getElementById('attendanceStatus');
        const subtitleElement = document.getElementById('successModalSubtitle');
        const timeElement = document.getElementById('submissionTime');
        
        if (statusElement) {
            statusElement.textContent = statusText;
            
            // Update colors and animations based on status
            const statusContainer = statusElement.parentElement;
            const mainContainer = statusContainer.parentElement;
            
            if (statusText.toLowerCase() === 'late') {
                statusElement.className = 'text-2xl font-bold text-yellow-700 mb-2';
                mainContainer.className = 'bg-yellow-50 border border-yellow-200 rounded-lg p-4';
                subtitleElement.textContent = 'Marked as late arrival';
                subtitleElement.className = 'text-sm text-yellow-700';
                
                // Update header icon color for late
                const headerIcon = this.successModal.querySelector('.bg-green-100');
                if (headerIcon) {
                    headerIcon.className = 'w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4';
                    const iconSvg = headerIcon.querySelector('svg');
                    if (iconSvg) {
                        iconSvg.classList.remove('text-green-600');
                        iconSvg.classList.add('text-yellow-600');
                    }
                }
                
                // Update header text colors
                const headerTitle = document.querySelector('#attendanceSuccessModal h3');
                const headerSubtitle = document.querySelector('#attendanceSuccessModal .text-green-700');
                if (headerTitle) headerTitle.className = 'text-lg font-semibold text-yellow-900';
                if (headerSubtitle) headerSubtitle.className = 'text-sm text-yellow-700';
            } else {
                statusElement.className = 'text-2xl font-bold text-green-700 mb-2';
                mainContainer.className = 'bg-green-50 border border-green-200 rounded-lg p-4';
                subtitleElement.textContent = 'Your attendance has been recorded';
                subtitleElement.className = 'text-sm text-green-700';
                
                // Ensure green styling for present
                const headerIcon = this.successModal.querySelector('.w-12.h-12');
                if (headerIcon) {
                    headerIcon.className = 'w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4';
                }
            }
        }
        
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = `Submitted at ${now.toLocaleTimeString()}`;
            
            // Add pulse animation to submission time
            timeElement.style.animation = 'pulse 1.5s ease-in-out';
        }
        
        // Populate course details with animations
        if (this.currentClass) {
            const courseNameEl = document.getElementById('successCourseName');
            const facultyNameEl = document.getElementById('successFacultyName');
            const timeEl = document.getElementById('successTime');
            const dateEl = document.getElementById('successDate');
            
            if (courseNameEl) {
                courseNameEl.textContent = `${this.currentClass.courseName} (${this.currentClass.courseCode})`;
            }
            
            if (facultyNameEl) {
                facultyNameEl.textContent = this.currentClass.facultyName;
            }
            
            if (timeEl) {
                const timeText = this.currentClass.startTime && this.currentClass.endTime 
                    ? `${this.currentClass.startTime} - ${this.currentClass.endTime}`
                    : 'TBA';
                timeEl.textContent = timeText;
            }
            
            if (dateEl) {
                const today = new Date();
                dateEl.textContent = today.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            }
        }
    },
    
    closeSuccessModal: function() {
        const modalContent = this.successModal.querySelector('div > div');
        
        // Smooth exit animation
        modalContent.style.transition = 'all 0.3s ease-in-out';
        modalContent.style.transform = 'scale(0.95)';
        modalContent.style.opacity = '0';
        
        // Add background fade
        this.successModal.style.transition = 'background-color 0.3s ease-in-out';
        this.successModal.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        
        setTimeout(() => {
            this.successModal.classList.add('hidden');
            
            // Reset styles for next time
            modalContent.style.transition = '';
            modalContent.style.transform = '';
            modalContent.style.opacity = '';
            this.successModal.style.transition = '';
            this.successModal.style.backgroundColor = '';
            
            // Remove any auto-close warning elements
            const warningElement = this.successModal.querySelector('.animate-pulse');
            if (warningElement) {
                warningElement.remove();
            }
        }, 300);
        
        console.log('Success modal closed with smooth animation');
    },
    
    // ...existing code...
    
    resetMarkButton: function() {
        if (this.markBtn) {
            this.markBtn.disabled = false;
            this.markBtn.innerHTML = `
                <svg class="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                </svg>
                Mark Present
            `;
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
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
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
