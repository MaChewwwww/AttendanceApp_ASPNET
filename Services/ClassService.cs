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
                Console.WriteLine($"=== GET COURSE ATTENDANCE DEBUG ===");
                Console.WriteLine($"Assigned Course ID: {assignedCourseId}");
                Console.WriteLine($"Academic Year: {academicYear ?? "null"}");
                Console.WriteLine($"Month: {month?.ToString() ?? "null"}");
                Console.WriteLine($"Day: {day?.ToString() ?? "null"}");
                Console.WriteLine($"JWT Token present: {!string.IsNullOrEmpty(jwtToken)}");
                Console.WriteLine("=====================================");

                var response = await _apiService.GetCourseAttendanceAsync(assignedCourseId, academicYear, month, day, jwtToken);
                
                Console.WriteLine($"Raw API Response Length: {response?.Length ?? 0} characters");
                Console.WriteLine($"Raw API Response Preview: {(string.IsNullOrEmpty(response) ? "EMPTY" : response.Substring(0, Math.Min(200, response.Length)))}...");
                
                if (string.IsNullOrEmpty(response))
                {
                    Console.WriteLine("ERROR: Empty response from API");
                    return CreateEmptyAttendanceResponse("Empty response from API");
                }

                var apiResponse = JsonSerializer.Deserialize<FacultyCourseAttendanceResponse>(response, _jsonOptions);
                
                if (apiResponse == null)
                {
                    Console.WriteLine("ERROR: Failed to deserialize API response");
                    return CreateEmptyAttendanceResponse("Failed to parse API response");
                }

                Console.WriteLine($"Deserialized Response - Success: {apiResponse.Success}");
                Console.WriteLine($"Deserialized Response - Message: {apiResponse.Message}");
                Console.WriteLine($"Deserialized Response - Records Count: {apiResponse.AttendanceRecords?.Count ?? 0}");
                
                if (apiResponse.AttendanceRecords?.Any() == true)
                {
                    Console.WriteLine("=== ATTENDANCE RECORDS SAMPLE ===");
                    var sampleRecord = apiResponse.AttendanceRecords.First();
                    Console.WriteLine($"Sample Record: {sampleRecord}");
                    Console.WriteLine($"Sample AttendanceId Type: {sampleRecord.AttendanceId.GetType()}, Value: {sampleRecord.AttendanceId}");
                    Console.WriteLine("=================================");
                    
                    // Log all attendance IDs to verify they're being passed correctly
                    var attendanceIds = apiResponse.AttendanceRecords.Select(r => r.AttendanceId).ToList();
                    Console.WriteLine($"All Attendance IDs: [{string.Join(", ", attendanceIds)}]");
                    
                    // Check for any zero or invalid IDs
                    var invalidIds = apiResponse.AttendanceRecords.Where(r => r.AttendanceId <= 0).ToList();
                    if (invalidIds.Any())
                    {
                        Console.WriteLine($"WARNING: Found {invalidIds.Count} records with invalid attendance IDs:");
                        foreach (var invalid in invalidIds)
                        {
                            Console.WriteLine($"  - {invalid}");
                        }
                    }
                }
                
                return apiResponse;
            }
            catch (JsonException jsonEx)
            {
                Console.WriteLine($"JSON Deserialization Error in GetCourseAttendanceAsync: {jsonEx.Message}");
                Console.WriteLine($"JSON Error Path: {jsonEx.Path}");
                return CreateEmptyAttendanceResponse($"JSON parsing error: {jsonEx.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"General Error in GetCourseAttendanceAsync: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return CreateEmptyAttendanceResponse($"Failed to fetch course attendance: {ex.Message}");
            }
        }

        private FacultyCourseAttendanceResponse CreateEmptyAttendanceResponse(string message)
        {
            return new FacultyCourseAttendanceResponse
            {
                Success = false,
                Message = message,
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
                    FacultyCourseAttendanceInfo updatedRecord = null;
                    
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
