using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public class CourseService : ICourseService
    {
        private readonly IApiService _apiService;

        public CourseService(IApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<CourseDataResult> GetStudentCoursesAsync(string jwtToken)
        {
            try
            {
                Console.WriteLine($"CourseService: Calling API to get student courses");
                var result = await _apiService.GetStudentCoursesAsync(jwtToken);
                Console.WriteLine($"CourseService: Raw API response length: {result?.Length ?? 0}");
                
                if (string.IsNullOrEmpty(result))
                {
                    Console.WriteLine("CourseService: Empty response from API");
                    return new CourseDataResult
                    {
                        Success = false,
                        Message = "Empty response from server. Please try again."
                    };
                }
                
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                Console.WriteLine($"CourseService: Parsed API response successfully");

                if (apiResponse.TryGetProperty("success", out var successProperty) && 
                    successProperty.GetBoolean())
                {
                    var courseData = new CourseDataResult
                    {
                        Success = true,
                        Message = apiResponse.TryGetProperty("message", out var msgProp) ? 
                                  msgProp.GetString() ?? "Courses loaded successfully" : 
                                  "Courses loaded successfully"
                    };

                    // Parse student info
                    if (apiResponse.TryGetProperty("student_info", out var studentInfoProp))
                    {
                        courseData.StudentInfo = ParseStudentInfo(studentInfoProp);
                        Console.WriteLine($"CourseService: Parsed student info for user: {courseData.StudentInfo?.Name ?? "Unknown"}");
                    }

                    // Parse current courses
                    if (apiResponse.TryGetProperty("current_courses", out var currentCoursesProp))
                    {
                        courseData.CurrentCourses = ParseCourses(currentCoursesProp);
                        Console.WriteLine($"CourseService: Parsed {courseData.CurrentCourses.Count} current courses");
                    }

                    // Parse previous courses
                    if (apiResponse.TryGetProperty("previous_courses", out var previousCoursesProp))
                    {
                        courseData.PreviousCourses = ParseCourses(previousCoursesProp);
                        Console.WriteLine($"CourseService: Parsed {courseData.PreviousCourses.Count} previous courses");
                    }

                    // Parse totals
                    if (apiResponse.TryGetProperty("total_current", out var totalCurrentProp))
                    {
                        courseData.TotalCurrent = totalCurrentProp.GetInt32();
                    }

                    if (apiResponse.TryGetProperty("total_previous", out var totalPreviousProp))
                    {
                        courseData.TotalPrevious = totalPreviousProp.GetInt32();
                    }

                    // Parse enrollment summary
                    if (apiResponse.TryGetProperty("enrollment_summary", out var enrollmentSummaryProp))
                    {
                        courseData.EnrollmentSummary = ParseEnrollmentSummary(enrollmentSummaryProp);
                    }

                    Console.WriteLine($"CourseService: Successfully prepared course data");
                    return courseData;
                }
                else
                {
                    var errorMessage = apiResponse.TryGetProperty("message", out var msgProp) ? 
                                      msgProp.GetString() ?? "Failed to load courses" : 
                                      "Failed to load courses";
                    Console.WriteLine($"CourseService: API returned error: {errorMessage}");
                    
                    return new CourseDataResult
                    {
                        Success = false,
                        Message = errorMessage
                    };
                }
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"CourseService: HTTP error fetching student courses: {ex.Message}");
                return new CourseDataResult
                {
                    Success = false,
                    Message = "Unable to connect to server. Please check your internet connection and verify the API is running."
                };
            }
            catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
            {
                Console.WriteLine($"CourseService: Timeout error fetching student courses: {ex.Message}");
                return new CourseDataResult
                {
                    Success = false,
                    Message = "Connection timeout. Please verify the API server is running and try again."
                };
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"CourseService: JSON parsing error: {ex.Message}");
                return new CourseDataResult
                {
                    Success = false,
                    Message = "Invalid response from server. Please try again later."
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"CourseService: Unexpected error fetching student courses: {ex.Message}");
                Console.WriteLine($"CourseService: Stack trace: {ex.StackTrace}");
                return new CourseDataResult
                {
                    Success = false,
                    Message = "Unable to load courses at this time. Please try again later."
                };
            }
        }

        public async Task<CourseDetailsResult> GetCourseDetailsAsync(int courseId, string jwtToken)
        {
            try
            {
                var result = await _apiService.GetAuthenticatedDataAsync($"student/courses/{courseId}", jwtToken);
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);

                if (apiResponse.TryGetProperty("success", out var successProperty) && 
                    successProperty.GetBoolean())
                {
                    var courseDetails = new CourseDetailsResult
                    {
                        Success = true,
                        Message = apiResponse.TryGetProperty("message", out var msgProp) ? 
                                  msgProp.GetString() ?? "Course details loaded successfully" : 
                                  "Course details loaded successfully"
                    };

                    // Parse course details
                    if (apiResponse.TryGetProperty("course", out var courseProp))
                    {
                        courseDetails.Course = ParseSingleCourse(courseProp);
                    }

                    return courseDetails;
                }
                else
                {
                    return new CourseDetailsResult
                    {
                        Success = false,
                        Message = apiResponse.TryGetProperty("message", out var msgProp) ? 
                                  msgProp.GetString() ?? "Failed to load course details" : 
                                  "Failed to load course details"
                    };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching course details for course {courseId}: {ex.Message}");
                return new CourseDetailsResult
                {
                    Success = false,
                    Message = "Unable to load course details at this time. Please try again later."
                };
            }
        }

        private StudentInfo? ParseStudentInfo(JsonElement studentInfoElement)
        {
            try
            {
                return new StudentInfo
                {
                    UserId = studentInfoElement.TryGetProperty("user_id", out var userIdProp) ? userIdProp.GetInt32() : 0,
                    StudentId = studentInfoElement.TryGetProperty("student_id", out var studentIdProp) ? studentIdProp.GetInt32() : 0,
                    Name = studentInfoElement.TryGetProperty("name", out var nameProp) ? nameProp.GetString() ?? "" : "",
                    Email = studentInfoElement.TryGetProperty("email", out var emailProp) ? emailProp.GetString() ?? "" : "",
                    StudentNumber = studentInfoElement.TryGetProperty("student_number", out var studentNumberProp) ? studentNumberProp.GetString() ?? "" : "",
                    CurrentSectionId = studentInfoElement.TryGetProperty("current_section_id", out var sectionIdProp) && sectionIdProp.ValueKind != JsonValueKind.Null ? sectionIdProp.GetInt32() : null,
                    HasSection = studentInfoElement.TryGetProperty("has_section", out var hasSectionProp) && hasSectionProp.GetBoolean()
                };
            }
            catch
            {
                return null;
            }
        }

        private List<CourseInfo> ParseCourses(JsonElement coursesElement)
        {
            var courses = new List<CourseInfo>();

            if (coursesElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var courseElement in coursesElement.EnumerateArray())
                {
                    var course = ParseSingleCourse(courseElement);
                    if (course != null)
                    {
                        courses.Add(course);
                    }
                }
            }

            return courses;
        }

        private CourseInfo? ParseSingleCourse(JsonElement courseElement)
        {
            try
            {
                return new CourseInfo
                {
                    AssignedCourseId = courseElement.TryGetProperty("assigned_course_id", out var assignedCourseIdProp) ? assignedCourseIdProp.GetInt32() : 0,
                    CourseId = courseElement.TryGetProperty("course_id", out var courseIdProp) ? courseIdProp.GetInt32() : 0,
                    CourseName = courseElement.TryGetProperty("course_name", out var courseNameProp) ? courseNameProp.GetString() ?? "" : "",
                    CourseCode = courseElement.TryGetProperty("course_code", out var courseCodeProp) ? courseCodeProp.GetString() ?? "" : "",
                    CourseDescription = courseElement.TryGetProperty("course_description", out var courseDescProp) ? courseDescProp.GetString() ?? "" : "",
                    FacultyId = courseElement.TryGetProperty("faculty_id", out var facultyIdProp) ? facultyIdProp.GetInt32() : 0,
                    FacultyName = courseElement.TryGetProperty("faculty_name", out var facultyNameProp) ? facultyNameProp.GetString() ?? "" : "",
                    FacultyEmail = courseElement.TryGetProperty("faculty_email", out var facultyEmailProp) ? facultyEmailProp.GetString() ?? "" : "",
                    SectionId = courseElement.TryGetProperty("section_id", out var sectionIdProp) ? sectionIdProp.GetInt32() : 0,
                    SectionName = courseElement.TryGetProperty("section_name", out var sectionNameProp) ? sectionNameProp.GetString() ?? "" : "",
                    ProgramId = courseElement.TryGetProperty("program_id", out var programIdProp) ? programIdProp.GetInt32() : 0,
                    ProgramName = courseElement.TryGetProperty("program_name", out var programNameProp) ? programNameProp.GetString() ?? "" : "",
                    ProgramAcronym = courseElement.TryGetProperty("program_acronym", out var programAcronymProp) ? programAcronymProp.GetString() ?? "" : "",
                    AcademicYear = courseElement.TryGetProperty("academic_year", out var academicYearProp) ? academicYearProp.GetString() ?? "" : "",
                    Semester = courseElement.TryGetProperty("semester", out var semesterProp) ? semesterProp.GetString() ?? "" : "",
                    Room = courseElement.TryGetProperty("room", out var roomProp) ? roomProp.GetString() ?? "" : "",
                    EnrollmentStatus = courseElement.TryGetProperty("enrollment_status", out var enrollmentStatusProp) ? enrollmentStatusProp.GetString() ?? "" : "",
                    RejectionReason = courseElement.TryGetProperty("rejection_reason", out var rejectionReasonProp) && rejectionReasonProp.ValueKind != JsonValueKind.Null ? rejectionReasonProp.GetString() : null,
                    CourseType = courseElement.TryGetProperty("course_type", out var courseTypeProp) ? courseTypeProp.GetString() ?? "" : "",
                    CreatedAt = courseElement.TryGetProperty("created_at", out var createdAtProp) && createdAtProp.ValueKind != JsonValueKind.Null ? createdAtProp.GetString() : null,
                    UpdatedAt = courseElement.TryGetProperty("updated_at", out var updatedAtProp) && updatedAtProp.ValueKind != JsonValueKind.Null ? updatedAtProp.GetString() : null
                };
            }
            catch
            {
                return null;
            }
        }

        private Dictionary<string, int> ParseEnrollmentSummary(JsonElement enrollmentSummaryElement)
        {
            var summary = new Dictionary<string, int>();

            try
            {
                foreach (var property in enrollmentSummaryElement.EnumerateObject())
                {
                    summary[property.Name] = property.Value.GetInt32();
                }
            }
            catch
            {
                // Return empty dictionary if parsing fails
            }

            return summary;
        }
    }
}
