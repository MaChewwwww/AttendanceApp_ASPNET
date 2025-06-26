using AttendanceApp_ASPNET.Models;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public class ClassService : IClassService
    {
        private readonly IApiService _apiService;
        private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        public ClassService(IApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<FacultyCoursesResponse> GetFacultyCoursesAsync(string jwtToken)
        {
            try
            {
                var responseJson = await _apiService.GetAuthenticatedDataAsync("/faculty/courses", jwtToken);
                
                if (string.IsNullOrEmpty(responseJson))
                {
                    return new FacultyCoursesResponse
                    {
                        Success = false,
                        Message = "Empty response from API",
                        CurrentCourses = new List<FacultyCourse>(),
                        PreviousCourses = new List<FacultyCourse>()
                    };
                }

                var apiResponse = JsonSerializer.Deserialize<FacultyCoursesApiResponse>(responseJson, _jsonOptions);

                if (apiResponse?.Success != true)
                {
                    return new FacultyCoursesResponse
                    {
                        Success = false,
                        Message = apiResponse?.Message ?? "Unknown error occurred",
                        CurrentCourses = new List<FacultyCourse>(),
                        PreviousCourses = new List<FacultyCourse>()
                    };
                }

                return new FacultyCoursesResponse
                {
                    Success = true,
                    Message = apiResponse.Message,
                    CurrentCourses = apiResponse.CurrentCourses ?? new List<FacultyCourse>(),
                    PreviousCourses = apiResponse.PreviousCourses ?? new List<FacultyCourse>(),
                    TotalCurrent = apiResponse.CurrentCourses?.Count ?? 0,
                    TotalPrevious = apiResponse.PreviousCourses?.Count ?? 0
                };
            }
            catch (Exception ex)
            {
                return new FacultyCoursesResponse
                {
                    Success = false,
                    Message = $"Error fetching courses: {ex.Message}",
                    CurrentCourses = new List<FacultyCourse>(),
                    PreviousCourses = new List<FacultyCourse>()
                };
            }
        }

        public async Task<FacultyCourseDetailsResponse> GetFacultyCourseDetailsAsync(int assignedCourseId, string jwtToken)
        {
            try
            {
                var json = await _apiService.GetFacultyCourseDetailsAsync(assignedCourseId, jwtToken);
                
                // Deserialize the JSON response directly to FacultyCourseDetailsResponse
                var response = JsonSerializer.Deserialize<FacultyCourseDetailsResponse>(json, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                });

                return response ?? new FacultyCourseDetailsResponse
                {
                    Success = false,
                    Message = "Failed to parse course details response"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting faculty course details: {ex.Message}");
                return new FacultyCourseDetailsResponse
                {
                    Success = false,
                    Message = "Failed to fetch course details. Please try again later."
                };
            }
        }

        public async Task<bool> UpdateCourseDetailsAsync(int assignedCourseId, object updateData, string jwtToken)
        {
            try
            {
                var response = await _apiService.GetAuthenticatedDataAsync($"/faculty/courses/{assignedCourseId}/update", jwtToken);
                var result = JsonSerializer.Deserialize<Dictionary<string, object>>(response);
                return result?.GetValueOrDefault("success", false) as bool? ?? false;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error updating course details: {ex.Message}", ex);
            }
        }

        public async Task<bool> DeleteCourseAsync(int assignedCourseId, string jwtToken)
        {
            try
            {
                var response = await _apiService.GetAuthenticatedDataAsync($"/faculty/courses/{assignedCourseId}/delete", jwtToken);
                var result = JsonSerializer.Deserialize<Dictionary<string, object>>(response);
                return result?.GetValueOrDefault("success", false) as bool? ?? false;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error deleting course: {ex.Message}", ex);
            }
        }

        public async Task<object> UpdateStudentStatusAsync(int assignedCourseId, int studentId, string status, string rejectionReason, string jwtToken)
        {
            try
            {
                var requestData = new
                {
                    status = status,
                    rejection_reason = rejectionReason
                };

                var json = await _apiService.UpdateStudentStatusAsync(assignedCourseId, studentId, requestData, jwtToken);
                
                // Parse as generic object since the response structure may vary
                using var document = JsonDocument.Parse(json);
                var root = document.RootElement;
                
                return new
                {
                    success = root.TryGetProperty("success", out var successProp) ? successProp.GetBoolean() : false,
                    message = root.TryGetProperty("message", out var messageProp) ? messageProp.GetString() : "Unknown error",
                    student_info = root.TryGetProperty("student_info", out var studentProp) ? JsonSerializer.Deserialize<object>(studentProp.GetRawText()) : null,
                    updated_status = root.TryGetProperty("updated_status", out var statusProp) ? statusProp.GetString() : "",
                    updated_at = root.TryGetProperty("updated_at", out var updatedProp) ? updatedProp.GetString() : ""
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating student status: {ex.Message}");
                return new
                {
                    success = false,
                    message = "Failed to update student status. Please try again later.",
                    error = ex.Message
                };
            }
        }

        public async Task<FacultyCourseAttendanceResponse> GetCourseAttendanceAsync(int assignedCourseId, string? academicYear, int? month, int? day, string jwtToken)
        {
            try
            {
                var json = await _apiService.GetCourseAttendanceAsync(assignedCourseId, academicYear ?? "", month, day, jwtToken);
                
                // Deserialize the JSON response directly to FacultyCourseAttendanceResponse
                var response = JsonSerializer.Deserialize<FacultyCourseAttendanceResponse>(json, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                });

                return response ?? new FacultyCourseAttendanceResponse
                {
                    Success = false,
                    Message = "Failed to parse attendance response"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting course attendance: {ex.Message}");
                return new FacultyCourseAttendanceResponse
                {
                    Success = false,
                    Message = "Failed to fetch course attendance. Please try again later."
                };
            }
        }

        public async Task<UpdateAttendanceStatusResponse> UpdateAttendanceStatusAsync(int assignedCourseId, int attendanceId, string status, string jwtToken)
        {
            try
            {
                Console.WriteLine($"=== CLASS SERVICE UPDATE ATTENDANCE DEBUG ===");
                Console.WriteLine($"Assigned Course ID: {assignedCourseId}");
                Console.WriteLine($"Attendance ID: {attendanceId}");
                Console.WriteLine($"New Status: {status}");
                Console.WriteLine($"JWT Token present: {!string.IsNullOrEmpty(jwtToken)}");
                Console.WriteLine("============================================");
                
                var response = await _apiService.UpdateAttendanceStatusAsync(assignedCourseId, attendanceId, status, jwtToken);
                
                Console.WriteLine($"Raw API response for UpdateAttendanceStatus: {response}");
                
                if (string.IsNullOrEmpty(response))
                {
                    Console.WriteLine("Empty response from API");
                    return new UpdateAttendanceStatusResponse
                    {
                        Success = false,
                        Message = "Empty response from API",
                        UpdatedRecord = null
                    };
                }
                
                // Parse the new API response format
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(response, _jsonOptions);
                
                var success = apiResponse.TryGetProperty("success", out var successProp) && successProp.GetBoolean();
                var message = apiResponse.TryGetProperty("message", out var messageProp) ? messageProp.GetString() ?? "" : "";
                
                Console.WriteLine($"Parsed UpdateAttendanceStatusResponse - Success: {success}, Message: {message}");
                
                if (success)
                {
                    // Create updated record from the new API response format
                    FacultyCourseAttendanceInfo? updatedRecord = null;
                    
                    if (apiResponse.TryGetProperty("student_info", out var studentInfo) && 
                        apiResponse.TryGetProperty("course_info", out var courseInfo))
                    {
                        updatedRecord = new FacultyCourseAttendanceInfo
                        {
                            AttendanceId = apiResponse.TryGetProperty("attendance_id", out var attIdProp) ? attIdProp.GetInt32() : attendanceId,
                            StudentId = studentInfo.TryGetProperty("student_id", out var studentIdProp) ? studentIdProp.GetInt32() : 0,
                            UserId = studentInfo.TryGetProperty("user_id", out var userIdProp) ? userIdProp.GetInt32() : 0,
                            StudentNumber = studentInfo.TryGetProperty("student_number", out var studentNumProp) ? studentNumProp.GetString() ?? "" : "",
                            StudentName = studentInfo.TryGetProperty("name", out var nameProp) ? nameProp.GetString() ?? "" : "",
                            StudentEmail = studentInfo.TryGetProperty("email", out var emailProp) ? emailProp.GetString() ?? "" : "",
                            Status = apiResponse.TryGetProperty("new_status", out var statusProp) ? statusProp.GetString() ?? status : status,
                            UpdatedAt = apiResponse.TryGetProperty("updated_at", out var updatedAtProp) ? updatedAtProp.GetString() ?? "" : "",
                            // Note: We don't have attendance_date and attendance_time in the response, 
                            // these would need to be preserved from the original record
                            AttendanceDate = "",
                            AttendanceTime = "",
                            HasImage = false,
                            EnrollmentStatus = "attending",
                            CreatedAt = ""
                        };
                    }
                    
                    return new UpdateAttendanceStatusResponse
                    {
                        Success = success,
                        Message = message,
                        UpdatedRecord = updatedRecord
                    };
                }
                else
                {
                    return new UpdateAttendanceStatusResponse
                    {
                        Success = false,
                        Message = message,
                        UpdatedRecord = null
                    };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateAttendanceStatusAsync: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return new UpdateAttendanceStatusResponse
                {
                    Success = false,
                    Message = $"Failed to update attendance status: {ex.Message}",
                    UpdatedRecord = null
                };
            }
        }

        public async Task<SuspendClassResponse> SuspendClassTodayAsync(int assignedCourseId, SuspendClassRequest request, string jwtToken)
        {
            try
            {
                var responseJson = await _apiService.SuspendClassTodayAsync(assignedCourseId, request, jwtToken);
                var response = JsonSerializer.Deserialize<SuspendClassResponse>(responseJson, _jsonOptions);
                return response ?? new SuspendClassResponse
                {
                    success = false,
                    message = "Failed to suspend class.",
                    assigned_course_id = assignedCourseId,
                    date = "",
                    reason = request.reason,
                    type = request.type
                };
            }
            catch (Exception ex)
            {
                return new SuspendClassResponse
                {
                    success = false,
                    message = $"Error suspending class: {ex.Message}",
                    assigned_course_id = assignedCourseId,
                    date = "",
                    reason = request.reason,
                    type = request.type
                };
            }
        }

        private static readonly JsonSerializerOptions _logJsonOptions = new JsonSerializerOptions { WriteIndented = true };

        private static void LogDebug(string message, object data)
        {
            var json = JsonSerializer.Serialize(data, _logJsonOptions);
            Console.WriteLine($"\n=== {message.ToUpper()} ===\n{json}\n====================\n");
        }

        private static void LogError(string message, Exception ex)
        {
            Console.WriteLine($"\n=== ERROR: {message.ToUpper()} ===");
            Console.WriteLine($"Type: {ex.GetType().Name}");
            Console.WriteLine($"Message: {ex.Message}");
            Console.WriteLine($"Stack Trace:\n{ex.StackTrace}");
            Console.WriteLine("====================\n");
        }
    }
}
