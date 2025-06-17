using AttendanceApp_ASPNET.Models;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public class FacultyAttendanceSubmissionService : IFacultyAttendanceSubmissionService
    {
        private readonly IApiService _apiService;
        private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        public FacultyAttendanceSubmissionService(IApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<FacultyAttendanceSubmissionResponse> SubmitFacultyAttendanceAsync(FacultyAttendanceSubmissionRequest request, string jwtToken)
        {
            try
            {
                Console.WriteLine("=== FACULTY ATTENDANCE SUBMISSION SERVICE ===");
                Console.WriteLine($"Assigned Course ID: {request.AssignedCourseId}");
                Console.WriteLine($"Face Image Length: {request.FaceImage?.Length ?? 0}");
                Console.WriteLine($"Has Location: {request.Latitude.HasValue && request.Longitude.HasValue}");
                Console.WriteLine($"JWT Token present: {!string.IsNullOrEmpty(jwtToken)}");
                Console.WriteLine("============================================");

                // Prepare submission data
                var submissionData = new
                {
                    assigned_course_id = request.AssignedCourseId,
                    face_image = request.FaceImage,
                    latitude = request.Latitude,
                    longitude = request.Longitude
                };

                var apiResponse = await _apiService.SubmitFacultyAttendanceAsync(submissionData, jwtToken);
                
                if (string.IsNullOrEmpty(apiResponse))
                {
                    Console.WriteLine("ERROR: Empty response from API");
                    return CreateErrorResponse("Empty response from submission API");
                }

                Console.WriteLine($"API Response received, length: {apiResponse.Length}");

                var response = JsonSerializer.Deserialize<FacultyAttendanceSubmissionResponse>(apiResponse, _jsonOptions);

                if (response == null)
                {
                    Console.WriteLine("ERROR: Failed to deserialize API response");
                    return CreateErrorResponse("Failed to parse submission response");
                }

                Console.WriteLine($"=== FACULTY ATTENDANCE SUBMISSION RESULT ===");
                Console.WriteLine($"Success: {response.Success}");
                Console.WriteLine($"Message: {response.Message}");
                Console.WriteLine($"Attendance ID: {response.AttendanceId}");
                Console.WriteLine($"Status: {response.Status}");
                Console.WriteLine($"Submitted At: {response.SubmittedAt}");
                Console.WriteLine("============================================");

                return response;
            }
            catch (JsonException jsonEx)
            {
                Console.WriteLine($"JSON Deserialization Error: {jsonEx.Message}");
                return CreateErrorResponse($"Failed to parse submission response: {jsonEx.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Faculty Attendance Submission Service Error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return CreateErrorResponse($"Submission service error: {ex.Message}");
            }
        }

        private FacultyAttendanceSubmissionResponse CreateErrorResponse(string errorMessage)
        {
            return new FacultyAttendanceSubmissionResponse
            {
                Success = false,
                Message = errorMessage,
                AttendanceId = null,
                Status = null,
                SubmittedAt = null,
                CourseInfo = null
            };
        }
    }
}
