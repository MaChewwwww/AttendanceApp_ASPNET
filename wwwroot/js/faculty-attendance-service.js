// Faculty Attendance Submission Service
class FacultyAttendanceService {
    constructor() {
        this.validationInfo = null;
    }

    async validateSubmission(assignedCourseId) {
        try {
            const validationData = {
                assignedCourseId: parseInt(assignedCourseId)
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
            const canSubmit = validationResult.canSubmit;
            
            if (canSubmit !== true) {
                const message = validationResult.message || 'Cannot submit faculty attendance at this time';
                return { success: false, message };
            }
            
            this.validationInfo = validationResult;
            const message = validationResult.message || 'Validation successful - you can mark attendance';
            return { success: true, message };
            
        } catch (error) {
            console.error('Faculty attendance validation error:', error);
            return { 
                success: false, 
                message: 'Failed to validate attendance submission. Please try again.' 
            };
        }
    }

    async submitAttendance(assignedCourseId, base64Image) {
        try {
            const submissionData = {
                assignedCourseId: parseInt(assignedCourseId),
                faceImage: base64Image
            };
            
            const response = await fetch('/Faculty/SubmitFacultyAttendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(submissionData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Submission request failed: ${response.status} - ${errorText}`);
            }
            
            const responseText = await response.text();
            let submissionResult;
            
            try {
                submissionResult = JSON.parse(responseText);
            } catch (parseError) {
                return {
                    success: false,
                    message: 'Invalid response from server. Please try again.'
                };
            }
            
            if (submissionResult.success) {
                const status = submissionResult.status || 'present';
                const statusText = status.charAt(0).toUpperCase() + status.slice(1);
                
                return {
                    success: true,
                    message: 'Faculty attendance submitted successfully!',
                    data: submissionResult,
                    statusText: statusText
                };
            } else {
                const errorMessage = submissionResult.message || 'Failed to submit faculty attendance';
                return { success: false, message: errorMessage };
            }
            
        } catch (error) {
            console.error('Faculty attendance submission error:', error);
            return {
                success: false,
                message: 'Failed to submit faculty attendance. Please try again.'
            };
        }
    }

    captureImageFromVideo(video, canvas) {
        try {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            context.drawImage(video, 0, 0);
            const imageDataURL = canvas.toDataURL('image/jpeg', 0.8);
            
            return imageDataURL.split(',')[1]; // Return base64 without prefix
        } catch (error) {
            console.error('Error capturing image:', error);
            throw new Error('Failed to capture image from camera');
        }
    }
}

// Export for use in other modules
window.FacultyAttendanceService = FacultyAttendanceService;
