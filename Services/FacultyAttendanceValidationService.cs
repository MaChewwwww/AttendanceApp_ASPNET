using AttendanceApp_ASPNET.Models;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public class FacultyAttendanceValidationService : IFacultyAttendanceValidationService
    {
        private readonly IApiService _apiService;
        private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        public FacultyAttendanceValidationService(IApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<FacultyAttendanceValidationResponse> ValidateFacultyAttendanceAsync(int assignedCourseId, string jwtToken)
        {
            try
            {
                Console.WriteLine("=== FACULTY ATTENDANCE VALIDATION SERVICE ===");
                Console.WriteLine($"Assigned Course ID: {assignedCourseId}");
                Console.WriteLine($"JWT Token present: {!string.IsNullOrEmpty(jwtToken)}");
                Console.WriteLine("============================================");

                // Call the API validation endpoint
                var validationData = new
                {
                    assigned_course_id = assignedCourseId
                };

                var apiResponse = await _apiService.ValidateFacultyAttendanceSubmissionAsync(validationData, jwtToken);
                
                if (string.IsNullOrEmpty(apiResponse))
                {
                    Console.WriteLine("ERROR: Empty response from API");
                    return CreateErrorResponse("Empty response from validation API");
                }

                Console.WriteLine($"API Response received, length: {apiResponse.Length}");

                var response = JsonSerializer.Deserialize<FacultyAttendanceValidationResponse>(apiResponse, _jsonOptions);

                if (response == null)
                {
                    Console.WriteLine("ERROR: Failed to deserialize API response");
                    return CreateErrorResponse("Failed to parse validation response");
                }

                Console.WriteLine($"=== FACULTY ATTENDANCE VALIDATION RESULT ===");
                Console.WriteLine($"Can Submit: {response.CanSubmit}");
                Console.WriteLine($"Message: {response.Message}");
                Console.WriteLine($"Schedule Info Present: {response.ScheduleInfo != null}");
                Console.WriteLine($"Existing Attendance Present: {response.ExistingAttendance != null}");
                Console.WriteLine("============================================");

                return response;
            }
            catch (JsonException jsonEx)
            {
                Console.WriteLine($"JSON Deserialization Error: {jsonEx.Message}");
                return CreateErrorResponse($"Failed to parse validation response: {jsonEx.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Faculty Attendance Validation Service Error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return CreateErrorResponse($"Validation service error: {ex.Message}");
            }
        }

        private FacultyAttendanceValidationResponse CreateErrorResponse(string errorMessage)
        {
            return new FacultyAttendanceValidationResponse
            {
                CanSubmit = false,
                Message = errorMessage,
                ScheduleInfo = null,
                ExistingAttendance = null
            };
        }
    }
}
               