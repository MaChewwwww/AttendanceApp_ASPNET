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
        Task<string> GetFacultyCourseDetailsAsync(int assignedCourseId, string jwtToken);
        Task<string> UpdateStudentStatusAsync(int assignedCourseId, int studentId, object requestData, string jwtToken);

        // Attendance data methods
        Task<string> GetStudentAttendanceAsync(string jwtToken);
        Task<string> GetCurrentSemesterAttendanceAsync(string jwtToken);

        // Attendance submission methods
        Task<string> ValidateAttendanceSubmissionAsync(object validationData, string jwtToken);
        Task<string> SubmitAttendanceAsync(object submissionData, string jwtToken);
        Task<string> GetTodayAttendanceStatusAsync(string jwtToken);

        // Dashboard data methods
        Task<string> GetStudentDashboardAsync(string jwtToken);

        // Faculty attendance data methods
        Task<string> GetFacultyAttendanceAsync(string jwtToken);
        Task<string> GetFacultyPersonalAttendanceAsync(string jwtToken);
        Task<string> GetCourseAttendanceAsync(int assignedCourseId, string academicYear, int? month, int? day, string jwtToken);
        Task<string> UpdateAttendanceStatusAsync(int assignedCourseId, int attendanceId, string status, string jwtToken);
        Task<string> ValidateFacultyAttendanceSubmissionAsync(object validationData, string jwtToken);
        Task<string> SubmitFacultyAttendanceAsync(object submissionData, string jwtToken);
        // Add suspend class method
        Task<string> SuspendClassTodayAsync(int assignedCourseId, object request, string jwtToken);

        // Faculty dashboard data methods
        Task<string> GetFacultyDashboardAsync(string jwtToken);

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

        public async Task<string> GetFacultyCourseDetailsAsync(int assignedCourseId, string jwtToken)
        {
            return await GetApiRequestWithStructuredErrorAsync($"/faculty/courses/{assignedCourseId}/details", jwtToken, "Failed to fetch faculty course details", new
            {
                success = false,
                message = "",
                course_info = (object)null,
                section_info = (object)null,
                faculty_info = (object)null,
                enrolled_students = new object[0],
                pending_students = new object[0],
                rejected_students = new object[0],
                passed_students = new object[0],
                failed_students = new object[0],
                enrollment_summary = new
                {
                    enrolled = 0,
                    pending = 0,
                    rejected = 0,
                    passed = 0,
                    failed = 0,
                    total = 0
                },
                attendance_summary = new
                {
                    total_records = 0,
                    total_sessions = 0,
                    present_count = 0,
                    late_count = 0,
                    absent_count = 0,
                    overall_attendance_rate = 0.0
                },
                recent_attendance = new object[0],
                academic_year = "",
                semester = "",
                total_students = 0,
                total_sessions = 0
            });
        }

        public async Task<string> UpdateStudentStatusAsync(int assignedCourseId, int studentId, object requestData, string jwtToken)
        {
            return await PutApiRequestWithStructuredErrorAsync($"/faculty/courses/{assignedCourseId}/students/{studentId}/status", requestData, jwtToken, "Failed to update student status", new
            {
                success = false,
                message = "",
                student_info = (object)null,
                updated_status = "",
                updated_at = ""
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

        public async Task<string> GetCurrentSemesterAttendanceAsync(string jwtToken)
        {
            return await GetApiRequestWithStructuredErrorAsync("/student/attendance/current-semester", jwtToken, "Failed to fetch current semester attendance", new
            {
                success = false,
                message = "",
                student_info = new { },
                attendance_logs = new object[0],
                total_logs = 0,
                courses = new object[0],
                academic_year = (object)null,
                semester = (object)null,
                attendance_summary = new { }
            });
        }

        public async Task<string> ValidateAttendanceSubmissionAsync(object validationData, string jwtToken)
        {
            return await PostApiRequestWithStructuredErrorAsync("/student/attendance/validate", validationData, jwtToken, "Failed to validate attendance submission", new
            {
                can_submit = false,
                message = "",
                schedule_info = (object)null,
                existing_attendance = (object)null
            });
        }

        public async Task<string> SubmitAttendanceAsync(object submissionData, string jwtToken)
        {
            return await PostApiRequestWithStructuredErrorAsync("/student/attendance/submit", submissionData, jwtToken, "Failed to submit attendance", new
            {
                success = false,
                message = "",
                attendance_id = (object)null,
                status = (object)null,
                submitted_at = (object)null,
                course_info = (object)null
            });
        }

        public async Task<string> GetTodayAttendanceStatusAsync(string jwtToken)
        {
            return await GetApiRequestWithStructuredErrorAsync("/student/attendance/today", jwtToken, "Failed to fetch today's attendance status", new
            {
                success = false,
                message = "",
                attendance_status = new object[0],
                total_courses = 0,
                submitted_today = 0,
                pending_submissions = 0
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
                all_schedules = new object[0],
                total_enrolled_courses = 0,
                pending_approvals = 0,
                schedule_summary = new
                {
                    total_classes_today = 0,
                    total_weekly_schedules = 0,
                    current_class = (object)null,
                    next_class = (object)null,
                    current_day = ""
                }
            });
        }

        public async Task<string> GetFacultyAttendanceAsync(string jwtToken)
        {
            return await GetApiRequestWithStructuredErrorAsync("/faculty/attendance", jwtToken, "Failed to fetch faculty attendance", new
            {
                success = false,
                message = "",
                faculty_info = new { },
                attendance_records = new object[0],
                total_records = 0,
                course_summary = new { },
                student_summary = new { },
                academic_year_summary = new { },
                attendance_statistics = new
                {
                    total_students = 0,
                    total_classes = 0,
                    present_count = 0,
                    late_count = 0,
                    absent_count = 0,
                    excused_count = 0,
                    attendance_rate = 0.0
                }
            });
        }

        public async Task<string> GetFacultyPersonalAttendanceAsync(string jwtToken)
        {
            return await GetApiRequestWithStructuredErrorAsync("/faculty/attendance/personal", jwtToken, "Failed to fetch faculty personal attendance", new
            {
                success = false,
                message = "",
                faculty_info = new { },
                attendance_records = new object[0],
                total_records = 0,
                attendance_summary = new
                {
                    total_records = 0,
                    present_count = 0,
                    late_count = 0,
                    absent_count = 0,
                    attendance_percentage = 0.0,
                    status_distribution = new
                    {
                        present = 0,
                        late = 0,
                        absent = 0
                    }
                },
                course_summary = new
                {
                    total_courses = 0,
                    courses = new { }
                },
                academic_year_summary = new
                {
                    years = new { },
                    total_years = 0
                }
            });
        }

        public async Task<string> GetCourseAttendanceAsync(int assignedCourseId, string academicYear, int? month, int? day, string jwtToken)
        {
            var queryParams = new List<string>();
            if (!string.IsNullOrEmpty(academicYear))
                queryParams.Add($"academic_year={Uri.EscapeDataString(academicYear)}");
            if (month.HasValue)
                queryParams.Add($"month={month.Value}");
            if (day.HasValue)
                queryParams.Add($"day={day.Value}");

            var queryString = queryParams.Count > 0 ? "?" + string.Join("&", queryParams) : "";
            var endpoint = $"/faculty/courses/{assignedCourseId}/attendance{queryString}";

            Console.WriteLine($"=== API SERVICE GET COURSE ATTENDANCE ===");
            Console.WriteLine($"Full endpoint: {endpoint}");
            Console.WriteLine($"Base URL: {_apiBaseUrl}");
            Console.WriteLine($"Complete URL: {_apiBaseUrl}{endpoint}");
            Console.WriteLine("==========================================");

            return await GetApiRequestWithStructuredErrorAsync(endpoint, jwtToken, "Failed to fetch course attendance", new
            {
                success = false,
                message = "",
                course_info = new { },
                section_info = new { },
                faculty_info = new { },
                attendance_records = new object[0],
                total_records = 0,
                attendance_summary = new { },
                academic_year = (object)null,
                semester = (object)null,
                is_current_course = false,
                available_filters = new { years = new object[0], months = new object[0], days = new object[0] }
            });
        }

        public async Task<string> UpdateAttendanceStatusAsync(int assignedCourseId, int attendanceId, string status, string jwtToken)
        {
            try
            {
                Console.WriteLine("=== API SERVICE: UPDATE ATTENDANCE STATUS ===");
                Console.WriteLine($"AssignedCourseId: {assignedCourseId}");
                Console.WriteLine($"AttendanceId: {attendanceId}");
                Console.WriteLine($"Status: {status}");
                Console.WriteLine($"JWT Token present: {!string.IsNullOrEmpty(jwtToken)}");
                Console.WriteLine("=============================================");

                var updateData = new { status = status };
                var response = await PutDataAsync($"/faculty/courses/{assignedCourseId}/attendance/{attendanceId}/status", updateData, jwtToken);
                
                Console.WriteLine($"API Response received, length: {response?.Length ?? 0}");
                Console.WriteLine($"Response preview: {(string.IsNullOrEmpty(response) ? "null" : response.Substring(0, Math.Min(200, response.Length)))}...");
                
                return response ?? "";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateAttendanceStatusAsync: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<string> ValidateFacultyAttendanceSubmissionAsync(object validationData, string jwtToken)
        {
            return await PostApiRequestWithStructuredErrorAsync("/faculty/attendance/validate", validationData, jwtToken, "Failed to validate faculty attendance submission", new
            {
                can_submit = false,
                message = "",
                schedule_info = (object)null,
                existing_attendance = (object)null
            });
        }

        public async Task<string> SubmitFacultyAttendanceAsync(object submissionData, string jwtToken)
        {
            return await PostApiRequestWithStructuredErrorAsync("/faculty/attendance/submit", submissionData, jwtToken, "Failed to submit faculty attendance", new
            {
                success = false,
                message = "",
                attendance_id = (object)null,
                status = (object)null,
                submitted_at = (object)null,
                course_info = (object)null
            });
        }

        // Faculty dashboard data methods
        public async Task<string> GetFacultyDashboardAsync(string jwtToken)
        {
            return await GetApiRequestWithStructuredErrorAsync("/faculty/dashboard", jwtToken, "Failed to fetch faculty dashboard", new
            {
                success = false,
                message = "",
                faculty_info = new { },
                current_courses = new object[0],
                previous_courses = new object[0],
                today_schedule = new object[0],
                all_schedules = new object[0],
                total_current_courses = 0,
                total_previous_courses = 0,
                total_pending_approvals = 0,
                today_attendance_count = 0,
                recent_attendance = new object[0],
                schedule_summary = new
                {
                    total_classes_today = 0,
                    total_weekly_schedules = 0,
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

                return responseContent ?? string.Empty;
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

        private async Task<string> PutApiRequestWithStructuredErrorAsync(string endpoint, object data, string jwtToken, string errorMessage, object errorTemplate)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}{endpoint}";
                var json = JsonSerializer.Serialize(data);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

                SetupRequestHeaders(jwtToken);

                var response = await _httpClient.PutAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    var errorResponse = JsonSerializer.Serialize(errorTemplate);
                    return errorResponse.Replace("\"message\": \"\"", $"\"message\": \"API returned {response.StatusCode}: {responseContent}\"");
                }

                return responseContent ?? string.Empty;
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

        private async Task<string> PostDataAsync(string endpoint, object data, string jwtToken)
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
                    throw new Exception($"API call failed {response.StatusCode}: {responseContent}");
                }

                return responseContent;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"PostDataAsync error: {ex.Message}");
                throw;
            }
        }

        private async Task<string> PutDataAsync(string endpoint, object data, string jwtToken)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}{endpoint}";
                var json = JsonSerializer.Serialize(data);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

                SetupRequestHeaders(jwtToken);

                var response = await _httpClient.PutAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"API call failed {response.StatusCode}: {responseContent}");
                }

                return responseContent;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"PutDataAsync error: {ex.Message}");
                throw;
            }
        }

        public async Task<string> SuspendClassTodayAsync(int assignedCourseId, object request, string jwtToken)
        {
            // POST /faculty/courses/{assignedCourse_id}/suspend
            return await PostApiRequestWithStructuredErrorAsync(
                $"/faculty/courses/{assignedCourseId}/suspend",
                request,
                jwtToken,
                "Failed to suspend class",
                new
                {
                    success = false,
                    message = "",
                    assigned_course_id = assignedCourseId,
                    date = "",
                    reason = "",
                    type = ""
                }
            );
        }
    }
}

