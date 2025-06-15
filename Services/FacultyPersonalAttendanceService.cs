using AttendanceApp_ASPNET.Models;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public interface IFacultyPersonalAttendanceService
    {
        Task<FacultyPersonalAttendanceResponse> GetFacultyPersonalAttendanceAsync(string jwtToken);
    }

    public class FacultyPersonalAttendanceService : IFacultyPersonalAttendanceService
    {
        private readonly IApiService _apiService;

        public FacultyPersonalAttendanceService(IApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<FacultyPersonalAttendanceResponse> GetFacultyPersonalAttendanceAsync(string jwtToken)
        {
            try
            {
                Console.WriteLine("=== FACULTY PERSONAL ATTENDANCE SERVICE ===");
                Console.WriteLine($"JWT Token present: {!string.IsNullOrEmpty(jwtToken)}");
                Console.WriteLine("===========================================");

                var apiResponse = await _apiService.GetFacultyPersonalAttendanceAsync(jwtToken);
                
                if (string.IsNullOrEmpty(apiResponse))
                {
                    Console.WriteLine("ERROR: Empty response from API");
                    return CreateErrorResponse("Empty response from API");
                }

                Console.WriteLine($"API Response received, length: {apiResponse.Length}");

                var response = JsonSerializer.Deserialize<FacultyPersonalAttendanceResponse>(apiResponse, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (response == null)
                {
                    Console.WriteLine("ERROR: Failed to deserialize API response");
                    return CreateErrorResponse("Failed to parse API response");
                }

                Console.WriteLine($"=== FACULTY PERSONAL ATTENDANCE SERVICE RESULT ===");
                Console.WriteLine($"Success: {response.Success}");
                Console.WriteLine($"Message: {response.Message}");
                Console.WriteLine($"Total Records: {response.TotalRecords}");
                Console.WriteLine($"Faculty: {response.FacultyInfo?.Name} ({response.FacultyInfo?.Email})");
                Console.WriteLine($"Present Count: {response.AttendanceSummary?.PresentCount ?? 0}");
                Console.WriteLine($"Late Count: {response.AttendanceSummary?.LateCount ?? 0}");
                Console.WriteLine($"Absent Count: {response.AttendanceSummary?.AbsentCount ?? 0}");
                Console.WriteLine($"Attendance Percentage: {response.AttendanceSummary?.AttendancePercentage ?? 0:F2}%");
                Console.WriteLine("=================================================");

                return response;
            }
            catch (JsonException jsonEx)
            {
                Console.WriteLine($"JSON Deserialization Error: {jsonEx.Message}");
                return CreateErrorResponse($"Failed to parse API response: {jsonEx.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Faculty Personal Attendance Service Error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return CreateErrorResponse($"Service error: {ex.Message}");
            }
        }

        private FacultyPersonalAttendanceResponse CreateErrorResponse(string errorMessage)
        {
            return new FacultyPersonalAttendanceResponse
            {
                Success = false,
                Message = errorMessage,
                FacultyInfo = new FacultyPersonalInfo(),
                AttendanceRecords = new List<FacultyPersonalAttendanceRecord>(),
                TotalRecords = 0,
                AttendanceSummary = new FacultyPersonalAttendanceSummary
                {
                    TotalRecords = 0,
                    PresentCount = 0,
                    LateCount = 0,
                    AbsentCount = 0,
                    AttendancePercentage = 0.0,
                    StatusDistribution = new FacultyPersonalStatusDistribution()
                },
                CourseSummary = new FacultyPersonalCourseSummary
                {
                    TotalCourses = 0,
                    Courses = new Dictionary<string, FacultyPersonalCourseStats>()
                },
                AcademicYearSummary = new FacultyPersonalAcademicYearSummary
                {
                    Years = new Dictionary<string, FacultyPersonalYearStats>(),
                    TotalYears = 0
                }
            };
        }
    }
}
