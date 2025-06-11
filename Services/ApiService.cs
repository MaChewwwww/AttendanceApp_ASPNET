using AttendanceApp_ASPNET.Models;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    // ABSTRACTION: Interface hides complex HTTP communication details
    public interface IApiService
    {
        // Authentication and registration methods
        Task<string> ValidateStudentRegistrationAsync(object formData);
        Task<string> ValidateFaceImageAsync(object faceData);
        Task<string> SendRegistrationOTPAsync(object otpData);
        Task<string> VerifyOTPAndCompleteRegistrationAsync(object verifyData);
        Task<string> ValidateLoginCredentialsAsync(object loginData);
        Task<string> SendLoginOTPAsync(object loginOTPData);
        Task<string> VerifyLoginOTPAsync(object verifyLoginData);
        Task<string> ValidateForgotPasswordEmailAsync(object emailData);
        Task<string> SendPasswordResetOTPAsync(object resetData);
        Task<string> VerifyPasswordResetOTPAsync(object verifyData);
        Task<string> ResetPasswordWithTokenAsync(object resetData);
        
        // Student data methods (used by StudentManagementService)
        Task<string> GetAuthenticatedDataAsync(string endpoint, string jwtToken);
        Task<string> CheckStudentOnboardingStatusAsync(string jwtToken);
        Task<string> GetAvailableProgramsAsync(string jwtToken);
        Task<string> GetAvailableSectionsByProgramAsync(int programId, string jwtToken);
        Task<string> GetAvailableCoursesBySectionAsync(int sectionId, string jwtToken);
        Task<string> CompleteStudentOnboardingAsync(object onboardingData, string jwtToken);
        
        // Course data methods
        Task<string> GetStudentCoursesAsync(string jwtToken);
        Task<string> GetCourseDetailsAsync(int courseId, string jwtToken);
        Task<string> GetCourseStudentsAsync(int assignedCourseId, string jwtToken);
        
        // Attendance data methods
        Task<string> GetStudentAttendanceAsync(string jwtToken);
        
        // Dashboard data methods
        Task<string> GetStudentDashboardAsync(string jwtToken);
        
        // Configuration access
        string GetApiKey();
        string GetApiBaseUrl();
    }

    // INHERITANCE: ApiService implements IApiService interface
    public class ApiService : IApiService
    {
        // ENCAPSULATION: Private fields - data hiding from external access
        private readonly string _apiKey;
        private readonly string _apiBaseUrl;
        private readonly HttpClient _httpClient;

        public ApiService(IOptions<ApiSettings> apiSettings, HttpClient httpClient)
        {
            _apiKey = apiSettings.Value.ApiKey;
            _apiBaseUrl = apiSettings.Value.ApiBaseUrl;
            _httpClient = httpClient;
        }

        // ENCAPSULATION: Public methods provide controlled access to private data
        public string GetApiKey() => _apiKey;
        public string GetApiBaseUrl() => _apiBaseUrl;

        // ABSTRACTION: Complex HTTP logic hidden behind simple method interface
        public async Task<string> ValidateStudentRegistrationAsync(object formData)
        {
            return await PostApiRequestAsync("/registerStudent/validate-fields", formData, "API validation failed");
        }

        public async Task<string> ValidateFaceImageAsync(object faceData)
        {
            return await PostApiRequestAsync("/registerStudent/validate-face", faceData, "Face validation failed");
        }

        public async Task<string> SendRegistrationOTPAsync(object otpData)
        {
            return await PostApiRequestAsync("/registerStudent/send-otp", otpData, "Send OTP failed");
        }

        public async Task<string> VerifyOTPAndCompleteRegistrationAsync(object verifyData)
        {
            return await PostApiRequestAsync("/registerStudent/verify-registration", verifyData, "Verify OTP and complete registration failed");
        }

        public async Task<string> ValidateLoginCredentialsAsync(object loginData)
        {
            return await PostApiRequestAsync("/loginStudent/validate-fields", loginData, "Login validation failed");
        }

        public async Task<string> SendLoginOTPAsync(object loginOTPData)
        {
            return await PostApiRequestAsync("/loginStudent/send-login-otp", loginOTPData, "Send login OTP failed");
        }

        public async Task<string> VerifyLoginOTPAsync(object verifyLoginData)
        {
            return await PostApiRequestWithStructuredErrorAsync("/loginStudent/verify-login-otp", verifyLoginData, "OTP verification failed");
        }

        public async Task<string> ValidateForgotPasswordEmailAsync(object emailData)
        {
            return await PostApiRequestAsync("/forgotPassword/validate-email", emailData, "Forgot password email validation failed");
        }

        public async Task<string> SendPasswordResetOTPAsync(object resetData)
        {
            return await PostApiRequestAsync("/forgotPassword/send-reset-otp", resetData, "Send password reset OTP failed");
        }

        public async Task<string> VerifyPasswordResetOTPAsync(object verifyData)
        {
            return await PostApiRequestAsync("/forgotPassword/verify-otp", verifyData, "Verify password reset OTP failed");
        }

        public async Task<string> ResetPasswordWithTokenAsync(object resetData)
        {
            return await PostApiRequestAsync("/forgotPassword/reset-password", resetData, "Reset password with token failed");
        }

        public async Task<string> GetAuthenticatedDataAsync(string endpoint, string jwtToken)
        {
            return await GetApiRequestAsync(endpoint, jwtToken, "Authenticated API call failed");
        }

        public async Task<string> CheckStudentOnboardingStatusAsync(string jwtToken)
        {
            return await GetApiRequestWithStructuredErrorAsync("/student/onboarding/status", jwtToken, "Onboarding status check failed", new
            {
                is_onboarded = false,
                message = "",
                has_section = false,
                student_info = (object)null
            });
        }

        public async Task<string> GetAvailableProgramsAsync(string jwtToken)
        {
            return await GetApiRequestWithStructuredErrorAsync("/student/onboarding/programs", jwtToken, "Failed to fetch programs", new
            {
                programs = new object[0],
                message = ""
            });
        }

        public async Task<string> GetAvailableSectionsByProgramAsync(int programId, string jwtToken)
        {
            return await GetApiRequestWithStructuredErrorAsync($"/student/onboarding/sections/{programId}", jwtToken, "Failed to fetch sections", new
            {
                sections = new object[0],
                message = ""
            });
        }

        public async Task<string> GetAvailableCoursesBySectionAsync(int sectionId, string jwtToken)
        {
            return await GetApiRequestWithStructuredErrorAsync($"/student/onboarding/courses/{sectionId}", jwtToken, "Failed to fetch assigned courses", new
            {
                courses = new object[0],
                message = ""
            });
        }

        public async Task<string> CompleteStudentOnboardingAsync(object onboardingData, string jwtToken)
        {
            return await PostApiRequestWithStructuredErrorAsync("/student/onboarding/assign-section", onboardingData, jwtToken, "Failed to complete onboarding", new
            {
                success = false,
                message = ""
            });
        }

        public async Task<string> GetStudentCoursesAsync(string jwtToken)
        {
            return await GetApiRequestWithStructuredErrorAsync("/student/courses", jwtToken, "Failed to fetch student courses", new
            {
                success = false,
                message = "",
                current_courses = new object[0],
                previous_courses = new object[0]
            });
        }

        public async Task<string> GetCourseDetailsAsync(int courseId, string jwtToken)
        {
            return await GetApiRequestWithStructuredErrorAsync($"/student/courses/{courseId}", jwtToken, "Failed to fetch course details", new
            {
                success = false,
                message = "",
                course = (object)null
            });
        }

        public async Task<string> GetCourseStudentsAsync(int assignedCourseId, string jwtToken)
        {
            return await GetApiRequestWithStructuredErrorAsync($"/student/courses/{assignedCourseId}/students", jwtToken, "Failed to fetch course students", new
            {
                success = false,
                message = "",
                course_info = (object)null,
                students = new object[0],
                total_students = 0,
                enrollment_summary = new { },
                attendance_summary = new { }
            });
        }

        public async Task<string> GetStudentAttendanceAsync(string jwtToken)
        {
            return await GetApiRequestWithStructuredErrorAsync("/student/attendance", jwtToken, "Failed to fetch student attendance", new
            {
                success = false,
                message = "",
                student_info = new { },
                attendance_records = new object[0],
                total_records = 0,
                attendance_summary = new { },
                course_summary = new { },
                academic_year_summary = new { }
            });
        }

        public async Task<string> GetStudentDashboardAsync(string jwtToken)
        {
            return await GetApiRequestWithStructuredErrorAsync("/student/dashboard", jwtToken, "Failed to fetch student dashboard", new
            {
                success = false,
                message = "",
                student_info = new { },
                current_classes = new object[0],
                today_schedule = new object[0],
                total_enrolled_courses = 0,
                pending_approvals = 0,
                schedule_summary = new
                {
                    total_classes_today = 0,
                    current_class = (object)null,
                    next_class = (object)null,
                    current_day = ""
                }
            });
        }

        // ENCAPSULATION: Private helper methods hide complex HTTP setup logic
        private async Task<string> PostApiRequestAsync(string endpoint, object data, string errorMessage)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}{endpoint}";
                var json = JsonSerializer.Serialize(data);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                SetupRequestHeaders();
                
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"API returned {response.StatusCode}: {responseContent}");
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                throw new Exception($"{errorMessage}: {ex.Message}", ex);
            }
        }

        private async Task<string> PostApiRequestWithStructuredErrorAsync(string endpoint, object data, string errorMessage)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}{endpoint}";
                var json = JsonSerializer.Serialize(data);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                SetupRequestHeaders();
                
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorResponse = new
                    {
                        success = false,
                        message = $"API returned {response.StatusCode}: {responseContent}",
                        user = (object)null,
                        token = (object)null,
                        redirect_url = (object)null
                    };
                    return JsonSerializer.Serialize(errorResponse);
                }
                
                return string.IsNullOrWhiteSpace(responseContent) 
                    ? JsonSerializer.Serialize(new { success = false, message = "Empty response from API" })
                    : responseContent;
            }
            catch (Exception ex)
            {
                var errorResponse = new
                {
                    success = false,
                    message = $"{errorMessage}: {ex.Message}",
                    user = (object)null,
                    token = (object)null,
                    redirect_url = (object)null
                };
                return JsonSerializer.Serialize(errorResponse);
            }
        }

        private async Task<string> PostApiRequestWithStructuredErrorAsync(string endpoint, object data, string jwtToken, string errorMessage, object errorTemplate)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}{endpoint}";
                var json = JsonSerializer.Serialize(data);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                SetupRequestHeaders(jwtToken);
                
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorResponse = JsonSerializer.Serialize(errorTemplate);
                    return errorResponse.Replace("\"message\": \"\"", $"\"message\": \"API returned {response.StatusCode}: {responseContent}\"");
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                var errorResponse = JsonSerializer.Serialize(errorTemplate);
                return errorResponse.Replace("\"message\": \"\"", $"\"message\": \"{errorMessage}: {ex.Message}\"");
            }
        }

        private async Task<string> GetApiRequestAsync(string endpoint, string jwtToken, string errorMessage)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}{endpoint}";
                
                SetupRequestHeaders(jwtToken);
                
                var response = await _httpClient.GetAsync(apiUrl);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"API call failed {response.StatusCode}: {responseContent}");
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                throw new Exception($"{errorMessage}: {ex.Message}", ex);
            }
        }

        private async Task<string> GetApiRequestWithStructuredErrorAsync(string endpoint, string jwtToken, string errorMessage, object errorTemplate)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}{endpoint}";
                
                SetupRequestHeaders(jwtToken);
                
                var response = await _httpClient.GetAsync(apiUrl);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorResponse = JsonSerializer.Serialize(errorTemplate);
                    return errorResponse.Replace("\"message\": \"\"", $"\"message\": \"API returned {response.StatusCode}: {responseContent}\"");
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                var errorResponse = JsonSerializer.Serialize(errorTemplate);
                return errorResponse.Replace("\"message\": \"\"", $"\"message\": \"{errorMessage}: {ex.Message}\"");
            }
        }

        private void SetupRequestHeaders(string jwtToken = null)
        {
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
            
            if (!string.IsNullOrEmpty(jwtToken))
            {
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {jwtToken}");
            }
        }
    }
}
