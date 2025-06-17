// Faculty Attendance Submission Service
class FacultyAttendanceService {
    constructor() {
        this.validationInfo = null;
    }

    async validateSubmission(assignedCourseId) {
        try {
            // Ensure assignedCourseId is a valid integer
            const courseId = parseInt(assignedCourseId);
            if (isNaN(courseId) || courseId <= 0) {
                return { 
                    success: false, 
                    message: `Invalid assigned course ID: ${assignedCourseId}` 
                };
            }
            
            const validationData = {
                assignedCourseId: courseId
            };
            
            console.log('=== FACULTY VALIDATION SERVICE DEBUG ===');
            console.log('Original assignedCourseId:', assignedCourseId);
            console.log('Parsed courseId:', courseId);
            console.log('Validation data:', validationData);
            console.log('========================================');
            
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
            // Multiple layers of validation to ensure we have valid data
            console.log('=== FACULTY SUBMISSION SERVICE VALIDATION ===');
            console.log('Input assignedCourseId:', assignedCourseId, 'Type:', typeof assignedCourseId);
            console.log('Input base64Image length:', base64Image?.length || 0);
            
            // Ensure assignedCourseId is a valid integer
            let courseId;
            if (typeof assignedCourseId === 'string') {
                courseId = parseInt(assignedCourseId, 10);
            } else if (typeof assignedCourseId === 'number') {
                courseId = Math.floor(assignedCourseId);
            } else {
                return { 
                    success: false, 
                    message: `Invalid assigned course ID type: ${typeof assignedCourseId}` 
                };
            }
            
            console.log('Converted courseId:', courseId, 'Type:', typeof courseId);
            
            if (isNaN(courseId) || courseId <= 0) {
                return { 
                    success: false, 
                    message: `Invalid assigned course ID for submission: ${assignedCourseId} -> ${courseId}` 
                };
            }
            
            if (!base64Image || typeof base64Image !== 'string' || base64Image.trim() === '') {
                return { 
                    success: false, 
                    message: 'Face image is required for attendance submission' 
                };
            }
            
            // Use camelCase to match the C# JsonPropertyName attributes
            const submissionData = {
                assignedCourseId: courseId,
                faceImage: base64Image.trim(),
                latitude: null,
                longitude: null
            };
            
            console.log('=== FACULTY SUBMISSION SERVICE FINAL DATA ===');
            console.log('Final courseId:', courseId);
            console.log('Final courseId type:', typeof courseId);
            console.log('Base64 image length:', base64Image.length);
            console.log('Submission data structure:', {
                assignedCourseId: submissionData.assignedCourseId,
                faceImage: '[BASE64_DATA_TRUNCATED]',
                latitude: submissionData.latitude,
                longitude: submissionData.longitude
            });
            console.log('Submission data.assignedCourseId type:', typeof submissionData.assignedCourseId);
            
            // Log the actual JSON being sent
            const jsonString = JSON.stringify(submissionData);
            console.log('JSON string being sent (first 200 chars):', jsonString.substring(0, 200));
            console.log('============================================');
            
            const response = await fetch('/Faculty/SubmitFacultyAttendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: jsonString
            });
            
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response text:', errorText);
                throw new Error(`Submission request failed: ${response.status} - ${errorText}`);
            }
            
            const responseText = await response.text();
            console.log('Response text:', responseText);
            
            let submissionResult;
            
            try {
                submissionResult = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                console.log('Raw response that failed to parse:', responseText);
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
