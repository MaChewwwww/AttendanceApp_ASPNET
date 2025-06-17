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
        this.cameraStarted = false;
        this.attendanceService = new FacultyAttendanceService();
        
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
        // Check heat conditions
        const isHeatSafe = await this.checkHeatConditions();
        
        if (!isHeatSafe) {
            this.showHeatWarningModal();
            return;
        }

        // Validate attendance submission
        const currentClassInfo = this.getCurrentClassInfoForValidation();
        
        if (!currentClassInfo || !currentClassInfo.assignedCourseId) {
            this.showError('No current class available for attendance submission');
            return;
        }

        const validationResult = await this.attendanceService.validateSubmission(currentClassInfo.assignedCourseId);
        
        if (!validationResult.success) {
            this.showError(validationResult.message);
            return;
        }

        // Show success notification and then modal
        this.showSuccessNotification(validationResult.message);
        
        // Store the course ID in a data attribute on the modal for later retrieval
        this.modal.setAttribute('data-validated-course-id', currentClassInfo.assignedCourseId.toString());
        this.modal.setAttribute('data-course-name', currentClassInfo.courseName || '');
        
        setTimeout(() => {
            this.showModal();
        }, 1000);
    }

    async submitFacultyAttendance() {
        try {
            const submitButton = document.getElementById('markFacultyAttendanceBtn');
            if (!submitButton) return;

            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 008-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
            `;

            // Get the validated course ID from the modal data attribute
            const validatedCourseId = this.modal.getAttribute('data-validated-course-id');
            const courseName = this.modal.getAttribute('data-course-name');
            
            console.log('=== FACULTY ATTENDANCE SUBMISSION DEBUG ===');
            console.log('Validated Course ID from modal:', validatedCourseId);
            console.log('Course Name from modal:', courseName);
            console.log('Modal element:', this.modal);
            console.log('Modal attributes:', Array.from(this.modal.attributes).map(attr => `${attr.name}=${attr.value}`));
            console.log('===========================================');
            
            if (!validatedCourseId || validatedCourseId === '0' || validatedCourseId === 'null') {
                // Fallback: Try to get current class info again
                const currentClassInfo = this.getCurrentClassInfoForValidation();
                
                if (!currentClassInfo || !currentClassInfo.assignedCourseId) {
                    this.showError('No current class available for attendance submission');
                    this.resetSubmitButton();
                    return;
                }
                
                // Use the fallback course ID
                const assignedCourseId = parseInt(currentClassInfo.assignedCourseId);
                console.log('Using fallback course ID:', assignedCourseId);
                
                // Update modal with the correct course ID
                this.modal.setAttribute('data-validated-course-id', assignedCourseId.toString());
                
                return this.performSubmission(assignedCourseId, currentClassInfo);
            }

            const assignedCourseId = parseInt(validatedCourseId);
            
            if (isNaN(assignedCourseId) || assignedCourseId <= 0) {
                this.showError('Invalid course ID for attendance submission');
                this.resetSubmitButton();
                return;
            }

            const classInfo = {
                assignedCourseId: assignedCourseId,
                courseName: courseName
            };

            return this.performSubmission(assignedCourseId, classInfo);

        } catch (error) {
            console.error('Error submitting attendance:', error);
            this.showError('Failed to capture image. Please try again.');
            this.resetSubmitButton();
        }
    }

    async performSubmission(assignedCourseId, classInfo) {
        try {
            console.log('=== PERFORMING SUBMISSION ===');
            console.log('Final assigned course ID:', assignedCourseId);
            console.log('Final class info:', classInfo);
            console.log('============================');

            // Validate camera availability
            if (!this.video || !this.canvas) {
                this.showError('Camera not available for attendance capture');
                this.resetSubmitButton();
                return;
            }

            // Capture image
            const base64Image = this.attendanceService.captureImageFromVideo(this.video, this.canvas);
            
            if (!base64Image || base64Image.trim() === '') {
                this.showError('Failed to capture image from camera');
                this.resetSubmitButton();
                return;
            }
            
            // Submit attendance with the validated assigned course ID
            const submissionResult = await this.attendanceService.submitAttendance(
                assignedCourseId, 
                base64Image
            );
            
            if (submissionResult.success) {
                // Show success notification
                this.showSuccessNotification(submissionResult.message);
                
                // Close modal and show success modal
                setTimeout(() => {
                    this.hideModal();
                    
                    setTimeout(() => {
                        this.showSuccessModal(submissionResult.data, classInfo, submissionResult.statusText);
                    }, 400);
                }, 1000);
            } else {
                this.showError(submissionResult.message);
                this.resetSubmitButton();
            }

        } catch (error) {
            console.error('Error in performSubmission:', error);
            this.showError('Failed to submit attendance. Please try again.');
            this.resetSubmitButton();
        }
    }

    getCurrentClassInfoForValidation() {
        try {
            // Try dashboard data JSON first
            const dashboardDataElement = document.getElementById('faculty-dashboard-data');
            const hasRealData = document.getElementById('has-real-data')?.textContent === 'true';
            
            if (hasRealData && dashboardDataElement) {
                try {
                    const facultyData = JSON.parse(dashboardDataElement.textContent);
                    
                    // Try current class
                    const currentClass = facultyData?.ScheduleSummary?.CurrentClass;
                    if (currentClass && currentClass.AssignedCourseId && currentClass.AssignedCourseId > 0) {
                        return {
                            assignedCourseId: parseInt(currentClass.AssignedCourseId), // Ensure it's an integer
                            courseName: currentClass.CourseName
                        };
                    }
                    
                    // Try next class
                    const nextClass = facultyData?.ScheduleSummary?.NextClass;
                    if (nextClass && nextClass.AssignedCourseId && nextClass.AssignedCourseId > 0) {
                        return {
                            assignedCourseId: parseInt(nextClass.AssignedCourseId), // Ensure it's an integer
                            courseName: nextClass.CourseName
                        };
                    }
                    
                    // Try today's schedule
                    const todaySchedule = facultyData?.TodaySchedule || [];
                    const validClass = todaySchedule.find(schedule => 
                        schedule.AssignedCourseId && schedule.AssignedCourseId > 0
                    );
                    
                    if (validClass) {
                        return {
                            assignedCourseId: parseInt(validClass.AssignedCourseId), // Ensure it's an integer
                            courseName: validClass.CourseName
                        };
                    }
                    
                    // Try current courses
                    const currentCourses = facultyData?.CurrentCourses || [];
                    const validCourse = currentCourses.find(course => 
                        course.AssignedCourseId && course.AssignedCourseId > 0
                    );
                    
                    if (validCourse) {
                        return {
                            assignedCourseId: parseInt(validCourse.AssignedCourseId), // Ensure it's an integer
                            courseName: validCourse.CourseName
                        };
                    }
                    
                } catch (parseError) {
                    console.error('Error parsing faculty dashboard data:', parseError);
                }
            }
            
            // Try data attributes as fallback
            const currentClassCard = document.querySelector('[data-current-class="true"]');
            if (currentClassCard) {
                const assignedCourseId = currentClassCard.getAttribute('data-assigned-course-id');
                const courseName = currentClassCard.getAttribute('data-course-name');
                
                if (assignedCourseId && assignedCourseId !== 'null' && assignedCourseId !== '0' && assignedCourseId !== '') {
                    const courseIdInt = parseInt(assignedCourseId);
                    if (courseIdInt > 0) {
                        return {
                            assignedCourseId: courseIdInt, // Already an integer
                            courseName: courseName
                        };
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error getting current class info:', error);
            return null;
        }
    }

    async checkWeatherConditions() {
        try {
            const maxFeelsLike = this.getMaxFeelsLikeFromPage();
            
            if (maxFeelsLike !== null && maxFeelsLike >= 42) {
                this.isHeatWarningActive = true;
                this.updateHeatIndexDisplay(maxFeelsLike);
                this.showHeatNotification();
            } else {
                this.isHeatWarningActive = false;
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
            return true;
        }
    }

    getMaxFeelsLikeFromPage() {
        try {
            // Try weather data JSON
            const weatherDataElement = document.getElementById('weather-data');
            if (weatherDataElement) {
                try {
                    const weatherData = JSON.parse(weatherDataElement.textContent);
                    
                    if (weatherData.maxFeelsLike && weatherData.weatherDataAvailable) {
                        return parseFloat(weatherData.maxFeelsLike);
                    }
                } catch (parseError) {
                    console.error('Error parsing weather data:', parseError);
                }
            }

            // Try ViewBag data
            if (typeof window !== 'undefined' && window.ViewBag && window.ViewBag.MaxFeelsLike) {
                return parseFloat(window.ViewBag.MaxFeelsLike);
            }

            // Try forecast card
            const tempForecastCard = document.querySelector('.text-2xl.font-bold.text-orange-600');
            if (tempForecastCard) {
                const text = tempForecastCard.textContent;
                const match = text.match(/(\d+(?:\.\d+)?)°C/);
                if (match) {
                    return parseFloat(match[1]);
                }
            }

            return null;
        } catch (error) {
            console.error('Error getting MaxFeelsLike:', error);
            return null;
        }
    }

    showModal() {
        if (!this.modal) {
            console.error('Faculty modal element not found!');
            return;
        }
        
        this.modal.classList.remove('hidden');
        
        setTimeout(() => {
            const content = this.modal.querySelector('.transform');
            if (content) {
                content.classList.remove('scale-95');
                content.classList.add('scale-100');
            }
        }, 10);

        this.loadCurrentClassInfo();
        this.initializeCamera();
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

        this.stopCamera();
        
        // Clear the stored course ID when modal is closed
        this.modal.removeAttribute('data-validated-course-id');
        this.modal.removeAttribute('data-course-name');
    }

    showHeatWarningModal() {
        if (!this.heatWarningModal) return;
        
        const heatIndexElement = document.getElementById('facultyCurrentHeatIndex');
        if (heatIndexElement && this.maxFeelsLike !== null) {
            heatIndexElement.textContent = `${Math.round(this.maxFeelsLike)}°C`;
        }
        
        this.heatWarningModal.classList.remove('hidden');
        
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

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.video) {
            this.video.srcObject = null;
        }
        
        this.cameraStarted = false;
        
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
        if (!this.video) {
            console.error('Faculty video element not found');
            return;
        }

        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        const loadingOverlay = document.getElementById('facultyCameraLoading');
        
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }

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
            this.stream = stream;
            this.video.srcObject = stream;
            
            this.video.addEventListener('loadedmetadata', () => {
                this.video.play().then(() => {
                    if (loadingOverlay) {
                        loadingOverlay.classList.add('hidden');
                    }
                    if (submitButton) {
                        submitButton.disabled = false;
                    }
                }).catch(error => {
                    console.error('Video play error:', error);
                });
            });

            setTimeout(() => {
                if (loadingOverlay && !loadingOverlay.classList.contains('hidden')) {
                    loadingOverlay.classList.add('hidden');
                }
                if (submitButton) {
                    submitButton.disabled = false;
                }
            }, 3000);
        })
        .catch(error => {
            console.error('Camera error:', error);
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

    loadCurrentClassInfo() {
        try {
            // Get the validated course ID from the modal if available
            const validatedCourseId = this.modal.getAttribute('data-validated-course-id');
            
            console.log('=== LOAD CURRENT CLASS INFO ===');
            console.log('Validated course ID from modal:', validatedCourseId);
            console.log('==============================');
            
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
                const assignedCourseId = currentClassCard.getAttribute('data-assigned-course-id');
                
                console.log('Faculty: Class data from attributes:', {
                    courseName, courseCode, sectionName, room, startTime, endTime, status, assignedCourseId
                });
                
                if (courseName && courseName !== 'null' && assignedCourseId && assignedCourseId !== '0') {
                    const classInfo = {
                        CourseName: courseName,
                        CourseCode: courseCode,
                        SectionName: sectionName,
                        Room: room,
                        StartTime: startTime,
                        EndTime: endTime,
                        Status: status || 'ongoing',
                        AssignedCourseId: parseInt(assignedCourseId)
                    };
                    this.populateClassInfo(classInfo);
                    return;
                }
            }
            
            // Then try dashboard data JSON
            const dashboardDataElement = document.getElementById('faculty-dashboard-data');
            const hasRealData = document.getElementById('has-real-data')?.textContent === 'true';
            
            if (hasRealData && dashboardDataElement) {
                try {
                    const facultyData = JSON.parse(dashboardDataElement.textContent);
                    console.log('Faculty: Dashboard data for modal:', facultyData);
                    
                    // Try to get current class
                    const currentClass = facultyData?.ScheduleSummary?.CurrentClass || 
                                        facultyData?.scheduleSummary?.currentClass ||
                                        facultyData?.CurrentClass;
                    const nextClass = facultyData?.ScheduleSummary?.NextClass || 
                                     facultyData?.scheduleSummary?.nextClass ||
                                     facultyData?.NextClass;
                    
                    let classToShow = currentClass || nextClass;
                    
                    // If no current/next class, try from today's schedule
                    if (!classToShow) {
                        const todaySchedule = facultyData?.TodaySchedule || facultyData?.todaySchedule || [];
                        if (todaySchedule.length > 0) {
                            // Try to find an ongoing class first
                            classToShow = todaySchedule.find(s => s.Status?.toLowerCase() === 'ongoing') || todaySchedule[0];
                        }
                    }
                    
                    // If still no class, try from current courses
                    if (!classToShow) {
                        const currentCourses = facultyData?.CurrentCourses || facultyData?.currentCourses || [];
                        if (currentCourses.length > 0) {
                            const firstCourse = currentCourses[0];
                            classToShow = {
                                CourseName: firstCourse.CourseName,
                                CourseCode: firstCourse.CourseCode,
                                SectionName: firstCourse.SectionName,
                                AssignedCourseId: firstCourse.AssignedCourseId,
                                StartTime: '09:00',
                                EndTime: '17:00',
                                Status: 'ongoing',
                                Room: 'TBA'
                            };
                        }
                    }
                    
                    if (classToShow && classToShow.AssignedCourseId) {
                        console.log('Faculty: Using class for modal:', classToShow);
                        this.populateClassInfo(classToShow);
                        return;
                    }
                } catch (parseError) {
                    console.error('Error parsing faculty dashboard data for modal:', parseError);
                }
            }
            
            // Final fallback - show personal attendance
            console.log('Faculty: No class data found, showing personal attendance info');
            this.showPersonalAttendanceInfo();
            
        } catch (error) {
            console.error('Error loading current class info for modal:', error);
            this.showPersonalAttendanceInfo();
        }
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

    showSuccessModal(submissionResult, currentClassInfo, statusText) {
        if (!this.successModal) return;
        
        // Update success modal content
        this.updateSuccessModalContent(submissionResult, currentClassInfo, statusText);
        
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

    updateSuccessModalContent(submissionResult, currentClassInfo, statusText) {
        const now = new Date();
        
        // Update faculty details
        const successFacultyName = document.getElementById('successFacultyName');
        const successDepartmentName = document.getElementById('successDepartmentName');
        const facultySuccessTime = document.getElementById('facultySuccessTime');
        const facultySuccessDate = document.getElementById('facultySuccessDate');
        const successCurrentClass = document.getElementById('successCurrentClass');
        const facultySubmissionTime = document.getElementById('facultySubmissionTime');
        const facultyAttendanceStatus = document.getElementById('facultyAttendanceStatus');
        
        if (successFacultyName) {
            successFacultyName.textContent = this.getFacultyName();
        }
        
        if (successDepartmentName) {
            successDepartmentName.textContent = this.getFacultyDepartment();
        }
        
        if (facultySuccessTime) {
            facultySuccessTime.textContent = now.toLocaleTimeString();
        }
        
        if (facultySuccessDate) {
            facultySuccessDate.textContent = now.toLocaleDateString();
        }
        
        // Update current class info
        if (successCurrentClass) {
            if (currentClassInfo && currentClassInfo.courseName) {
                successCurrentClass.textContent = `${currentClassInfo.courseName} - ${currentClassInfo.courseName}`;
            } else {
                successCurrentClass.textContent = 'Personal Attendance';
            }
        }
        
        // Update submission time
        if (facultySubmissionTime) {
            const submittedAt = submissionResult.submittedAt;
            if (submittedAt) {
                try {
                    const submissionDate = new Date(submittedAt);
                    facultySubmissionTime.textContent = `Recorded at ${submissionDate.toLocaleTimeString()}`;
                } catch (dateError) {
                    facultySubmissionTime.textContent = `Recorded at ${now.toLocaleTimeString()}`;
                }
            } else {
                facultySubmissionTime.textContent = `Recorded at ${now.toLocaleTimeString()}`;
            }
        }
        
        // Update status
        if (facultyAttendanceStatus) {
            facultyAttendanceStatus.textContent = statusText;
            
            // Update colors based on status
            const statusContainer = facultyAttendanceStatus.parentElement;
            const mainContainer = statusContainer.parentElement;
            
            if (statusText.toLowerCase() === 'late') {
                facultyAttendanceStatus.className = 'text-2xl font-bold text-yellow-700 mb-2';
                mainContainer.className = 'bg-yellow-50 border border-yellow-200 rounded-lg p-4';
                
                // Update header icon color for late
                const headerIcon = this.successModal.querySelector('.bg-blue-100');
                if (headerIcon) {
                    headerIcon.className = 'w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4';
                    const iconSvg = headerIcon.querySelector('svg');
                    if (iconSvg) {
                        iconSvg.classList.remove('text-blue-600');
                        iconSvg.classList.add('text-yellow-600');
                    }
                }
            } else {
                facultyAttendanceStatus.className = 'text-2xl font-bold text-blue-700 mb-2';
                mainContainer.className = 'bg-blue-50 border border-blue-200 rounded-lg p-4';
                
                // Ensure blue styling for present
                const headerIcon = this.successModal.querySelector('.w-12.h-12');
                if (headerIcon) {
                    headerIcon.className = 'w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4';
                }
            }
        }
    }

    resetSubmitButton() {
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

    updateHeatIndexDisplay(heatIndex) {
        const heatIndexElement = document.getElementById('facultyCurrentHeatIndex');
        if (heatIndexElement) {
            heatIndexElement.textContent = `${Math.round(heatIndex)}°C`;
        }
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

