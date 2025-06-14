using AttendanceApp_ASPNET.Models;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public class ClassService : IClassService
    {
        private readonly IApiService _apiService;

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

                var apiResponse = JsonSerializer.Deserialize<FacultyCoursesApiResponse>(responseJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

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

        public async Task<object> GetFacultyCourseDetailsAsync(int assignedCourseId, string jwtToken)
        {
            try
            {
                var responseJson = await _apiService.GetFacultyCourseDetailsAsync(assignedCourseId, jwtToken);
                
                if (string.IsNullOrEmpty(responseJson))
                {
                    return new { 
                        success = false, 
                        message = "Empty response from API",
                        course_info = (object)null,
                        enrolled_students = new object[0],
                        pending_students = new object[0],
                        rejected_students = new object[0],
                        enrollment_summary = new { enrolled = 0, pending = 0, rejected = 0, total = 0 },
                        attendance_summary = new { total_records = 0, total_sessions = 0, present_count = 0, late_count = 0, absent_count = 0, overall_attendance_rate = 0.0 }
                    };
                }

                // Parse the JSON response
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(responseJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                // Check if the response indicates success
                if (apiResponse.TryGetProperty("success", out var successElement) && 
                    successElement.ValueKind == JsonValueKind.True)
                {
                    // Return the parsed response as a dynamic object
                    return JsonSerializer.Deserialize<object>(responseJson, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                }
                else
                {
                    // Handle error response
                    var errorMessage = "Unknown error occurred";
                    if (apiResponse.TryGetProperty("message", out var messageElement))
                    {
                        errorMessage = messageElement.GetString() ?? errorMessage;
                    }

                    return new { 
                        success = false, 
                        message = errorMessage,
                        course_info = (object)null,
                        enrolled_students = new object[0],
                        pending_students = new object[0],
                        rejected_students = new object[0],
                        enrollment_summary = new { enrolled = 0, pending = 0, rejected = 0, total = 0 },
                        attendance_summary = new { total_records = 0, total_sessions = 0, present_count = 0, late_count = 0, absent_count = 0, overall_attendance_rate = 0.0 }
                    };
                }
            }
            catch (Exception ex)
            {
                return new { 
                    success = false, 
                    message = $"Error fetching course details: {ex.Message}",
                    course_info = (object)null,
                    enrolled_students = new object[0],
                    pending_students = new object[0],
                    rejected_students = new object[0],
                    enrollment_summary = new { enrolled = 0, pending = 0, rejected = 0, total = 0 },
                    attendance_summary = new { total_records = 0, total_sessions = 0, present_count = 0, late_count = 0, absent_count = 0, overall_attendance_rate = 0.0 }
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

                var responseJson = await _apiService.UpdateStudentStatusAsync(assignedCourseId, studentId, requestData, jwtToken);
                
                if (string.IsNullOrEmpty(responseJson))
                {
                    return new { 
                        success = false, 
                        message = "Empty response from API"
                    };
                }

                Console.WriteLine($"UpdateStudentStatus API Response: {responseJson}");

                // Parse the JSON response
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(responseJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                // Check if the response indicates success
                if (apiResponse.TryGetProperty("success", out var successElement) && 
                    successElement.ValueKind == JsonValueKind.True)
                {
                    var result = JsonSerializer.Deserialize<object>(responseJson, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                    
                    Console.WriteLine($"Student status update successful for student {studentId} to status {status}");
                    return result;
                }
                else
                {
                    var errorMessage = "Unknown error occurred";
                    if (apiResponse.TryGetProperty("message", out var messageElement))
                    {
                        errorMessage = messageElement.GetString() ?? errorMessage;
                    }

                    Console.WriteLine($"Student status update failed: {errorMessage}");
                    return new { 
                        success = false, 
                        message = errorMessage
                    };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in UpdateStudentStatusAsync: {ex.Message}");
                return new { 
                    success = false, 
                    message = $"Error updating student status: {ex.Message}"
                };
            }
        }

        private void LogDebug(string message, object data)
        {
            var json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
            Console.WriteLine($"\n=== {message.ToUpper()} ===\n{json}\n====================\n");
        }

        private void LogError(string message, Exception ex)
        {
            Console.WriteLine($"\n=== ERROR: {message.ToUpper()} ===");
            Console.WriteLine($"Type: {ex.GetType().Name}");
            Console.WriteLine($"Message: {ex.Message}");
            Console.WriteLine($"Stack Trace:\n{ex.StackTrace}");
            Console.WriteLine("====================\n");
        }
    }
}
