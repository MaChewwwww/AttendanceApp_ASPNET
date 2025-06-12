using System.Text.Json;
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
                var response = await _apiService.GetAuthenticatedDataAsync("/faculty/courses", jwtToken);
                return JsonSerializer.Deserialize<FacultyCoursesResponse>(response) ?? 
                    throw new Exception("Failed to deserialize faculty courses response");
            }
            catch (Exception ex)
            {
                throw new Exception($"Error fetching faculty courses: {ex.Message}", ex);
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
    }
}
