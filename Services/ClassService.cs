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

        public async Task<FacultyCourse> GetCourseDetailsAsync(int assignedCourseId, string jwtToken)
        {
            try
            {
                var response = await _apiService.GetAuthenticatedDataAsync($"/faculty/courses/{assignedCourseId}", jwtToken);
                return JsonSerializer.Deserialize<FacultyCourse>(response) ?? 
                    throw new Exception("Failed to deserialize course details");
            }
            catch (Exception ex)
            {
                throw new Exception($"Error fetching course details: {ex.Message}", ex);
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
