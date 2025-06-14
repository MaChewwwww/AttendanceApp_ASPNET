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
                var response = await _apiService.GetFacultyCourseDetailsAsync(assignedCourseId, jwtToken);
                var apiResponse = JsonSerializer.Deserialize<FacultyCourseDetailsResponse>(response, _jsonOptions);
                
                if (apiResponse == null)
                {
                    return new FacultyCourseDetailsResponse
                    {
                        Success = false,
                        Message = "Failed to parse API response",
                        CourseInfo = new Dictionary<string, object>(),
                        SectionInfo = new Dictionary<string, object>(),
                        FacultyInfo = new Dictionary<string, object>(),
                        EnrolledStudents = new List<object>(),
                        PendingStudents = new List<object>(),
                        RejectedStudents = new List<object>(),
                        EnrollmentSummary = new Dictionary<string, object>(),
                        AttendanceSummary = new Dictionary<string, object>(),
                        RecentAttendance = new List<object>()
                    };
                }
                
                return apiResponse;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetFacultyCourseDetailsAsync: {ex.Message}");
                return new FacultyCourseDetailsResponse
                {
                    Success = false,
                    Message = $"Failed to fetch course details: {ex.Message}",
                    CourseInfo = new Dictionary<string, object>(),
                    SectionInfo = new Dictionary<string, object>(),
                    FacultyInfo = new Dictionary<string, object>(),
                    EnrolledStudents = new List<object>(),
                    PendingStudents = new List<object>(),
                    RejectedStudents = new List<object>(),
                    EnrollmentSummary = new Dictionary<string, object>(),
                    AttendanceSummary = new Dictionary<string, object>(),
                    RecentAttendance = new List<object>()
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
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(responseJson, _jsonOptions);

                // Check if the response indicates success
                if (apiResponse.TryGetProperty("success", out var successElement) && 
                    successElement.ValueKind == JsonValueKind.True)
                {
                    var result = JsonSerializer.Deserialize<object>(responseJson, _jsonOptions);
                    
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

        public async Task<FacultyCourseAttendanceResponse> GetCourseAttendanceAsync(int assignedCourseId, string academicYear, int? month, int? day, string jwtToken)
        {
            try
            {
                var response = await _apiService.GetCourseAttendanceAsync(assignedCourseId, academicYear, month, day, jwtToken);
                var apiResponse = JsonSerializer.Deserialize<FacultyCourseAttendanceResponse>(response, _jsonOptions);
                
                if (apiResponse == null)
                {
                    return new FacultyCourseAttendanceResponse
                    {
                        Success = false,
                        Message = "Failed to parse API response",
                        CourseInfo = new Dictionary<string, object>(),
                        SectionInfo = new Dictionary<string, object>(),
                        FacultyInfo = new Dictionary<string, object>(),
                        AttendanceRecords = new List<FacultyCourseAttendanceInfo>(),
                        TotalRecords = 0,
                        AttendanceSummary = new Dictionary<string, object>(),
                        IsCurrentCourse = false,
                        AvailableFilters = new Dictionary<string, List<string>>()
                    };
                }
                
                return apiResponse;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetCourseAttendanceAsync: {ex.Message}");
                return new FacultyCourseAttendanceResponse
                {
                    Success = false,
                    Message = $"Failed to fetch course attendance: {ex.Message}",
                    CourseInfo = new Dictionary<string, object>(),
                    SectionInfo = new Dictionary<string, object>(),
                    FacultyInfo = new Dictionary<string, object>(),
                    AttendanceRecords = new List<FacultyCourseAttendanceInfo>(),
                    TotalRecords = 0,
                    AttendanceSummary = new Dictionary<string, object>(),
                    IsCurrentCourse = false,
                    AvailableFilters = new Dictionary<string, List<string>>()
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
