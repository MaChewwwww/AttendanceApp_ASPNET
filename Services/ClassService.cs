using System.Text.Json;
using System.Text.Json.Serialization;  // Add this for JsonNumberHandling
using AttendanceApp_ASPNET.Models;

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
                LogDebug("Fetching faculty courses", new
                {
                    Endpoint = "/faculty/courses",
                    TokenPresent = !string.IsNullOrEmpty(jwtToken)
                });
                
                var response = await _apiService.GetAuthenticatedDataAsync("/faculty/courses", jwtToken);
                
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    NumberHandling = JsonNumberHandling.AllowReadingFromString
                };

                var coursesResponse = JsonSerializer.Deserialize<FacultyCoursesResponse>(response, options);
                if (coursesResponse == null)
                {
                    throw new Exception("Failed to deserialize faculty courses response");
                }

                LogDebug("Faculty courses retrieved", new
                {
                    Success = coursesResponse.Success,
                    CurrentCoursesCount = coursesResponse.CurrentCourses?.Count ?? 0,
                    PreviousCoursesCount = coursesResponse.PreviousCourses?.Count ?? 0,
                    Message = coursesResponse.Message
                });

                return coursesResponse;
            }
            catch (Exception ex)
            {
                LogError("Failed to fetch faculty courses", ex);
                return new FacultyCoursesResponse
                {
                    Success = false,
                    Message = $"Unable to fetch faculty courses: {ex.Message}",
                    CurrentCourses = new List<FacultyCourse>(),
                    PreviousCourses = new List<FacultyCourse>(),
                    FacultyInfo = new Dictionary<string, object>(),
                    TotalCurrent = 0,
                    TotalPrevious = 0,
                    SemesterSummary = new Dictionary<string, SemesterSummary>()  // Changed to use SemesterSummary type
                };
            }
        }

        public async Task<object> GetFacultyCourseDetailsAsync(int assignedCourseId, string jwtToken)
        {
            try
            {
                var responseJson = await _apiService.GetAuthenticatedDataAsync($"/faculty/courses/{assignedCourseId}/details", jwtToken);
                
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
