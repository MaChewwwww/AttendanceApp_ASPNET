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
                Console.WriteLine($"CourseService: Calling API to get student courses with revised academic year filtering");
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

                    // Parse student info with graduation status and enrollment year
                    if (apiResponse.TryGetProperty("student_info", out var studentInfoProp))
                    {
                        courseData.StudentInfo = ParseStudentInfo(studentInfoProp);
                        Console.WriteLine($"CourseService: Parsed student info - Name: {courseData.StudentInfo?.Name ?? "Unknown"}, " +
                                         $"Enrollment Year: {courseData.StudentInfo?.StudentEnrollmentYear}, " +
                                         $"Is Graduated: {courseData.StudentInfo?.IsGraduated}, " +
                                         $"Current Academic Year: {courseData.StudentInfo?.CurrentAcademicYear}");
                    }

                    // Parse current courses with detailed logging
                    if (apiResponse.TryGetProperty("current_courses", out var currentCoursesProp))
                    {
                        courseData.CurrentCourses = ParseCourses(currentCoursesProp);
                        Console.WriteLine($"CourseService: Parsed {courseData.CurrentCourses.Count} current courses");
                        
                        // Debug current courses by semester
                        var currentBySemester = courseData.CurrentCourses.GroupBy(c => c.Semester);
                        foreach (var semesterGroup in currentBySemester)
                        {
                            Console.WriteLine($"  Current - {semesterGroup.Key}: {semesterGroup.Count()} courses");
                        }
                    }

                    // Parse previous courses with detailed logging
                    if (apiResponse.TryGetProperty("previous_courses", out var previousCoursesProp))
                    {
                        courseData.PreviousCourses = ParseCourses(previousCoursesProp);
                        Console.WriteLine($"CourseService: Parsed {courseData.PreviousCourses.Count} previous courses");
                        
                        // Debug previous courses by academic year
                        var previousByYear = courseData.PreviousCourses.GroupBy(c => c.AcademicYear);
                        foreach (var yearGroup in previousByYear)
                        {
                            Console.WriteLine($"  Previous - {yearGroup.Key}: {yearGroup.Count()} courses");
                        }
                    }

                    // Parse totals
                    if (apiResponse.TryGetProperty("total_current", out var totalCurrentProp))
                    {
                        courseData.TotalCurrent = totalCurrentProp.GetInt32();
                        Console.WriteLine($"CourseService: Total current from API: {courseData.TotalCurrent}");
                    }

                    if (apiResponse.TryGetProperty("total_previous", out var totalPreviousProp))
                    {
                        courseData.TotalPrevious = totalPreviousProp.GetInt32();
                        Console.WriteLine($"CourseService: Total previous from API: {courseData.TotalPrevious}");
                    }

                    // Parse enrollment summary
                    if (apiResponse.TryGetProperty("enrollment_summary", out var enrollmentSummaryProp))
                    {
                        courseData.EnrollmentSummary = ParseEnrollmentSummary(enrollmentSummaryProp);
                        Console.WriteLine($"CourseService: Enrollment summary: {string.Join(", ", courseData.EnrollmentSummary.Select(kvp => $"{kvp.Key}: {kvp.Value}"))}");
                    }

                    // Parse academic year summary (new field)
                    if (apiResponse.TryGetProperty("academic_year_summary", out var academicYearSummaryProp))
                    {
                        courseData.AcademicYearSummary = ParseEnrollmentSummary(academicYearSummaryProp); // Same parsing logic
                        Console.WriteLine($"CourseService: Academic year summary: {string.Join(", ", courseData.AcademicYearSummary.Select(kvp => $"{kvp.Key}: {kvp.Value}"))}");
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

        public async Task<CourseStudentsResult> GetCourseStudentsAsync(int assignedCourseId, string jwtToken)
        {
            try
            {
                Console.WriteLine($"CourseService: Fetching students for assigned course {assignedCourseId}");
                var result = await _apiService.GetCourseStudentsAsync(assignedCourseId, jwtToken);
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);

                if (apiResponse.TryGetProperty("success", out var successProperty) && 
                    successProperty.GetBoolean())
                {
                    var courseStudents = new CourseStudentsResult
                    {
                        Success = true,
                        Message = apiResponse.TryGetProperty("message", out var msgProp) ? 
                                  msgProp.GetString() ?? "Course students loaded successfully" : 
                                  "Course students loaded successfully"
                    };

                    // Parse course info
                    if (apiResponse.TryGetProperty("course_info", out var courseInfoProp))
                    {
                        courseStudents.CourseInfo = ParseSingleCourse(courseInfoProp);
                    }

                    // Parse students
                    if (apiResponse.TryGetProperty("students", out var studentsProp))
                    {
                        courseStudents.Students = ParseCourseStudents(studentsProp);
                    }

                    // Parse totals and summaries
                    if (apiResponse.TryGetProperty("total_students", out var totalStudentsProp))
                    {
                        courseStudents.TotalStudents = totalStudentsProp.GetInt32();
                    }

                    if (apiResponse.TryGetProperty("enrollment_summary", out var enrollmentSummaryProp))
                    {
                        courseStudents.EnrollmentSummary = ParseEnrollmentSummary(enrollmentSummaryProp);
                    }

                    if (apiResponse.TryGetProperty("attendance_summary", out var attendanceSummaryProp))
                    {
                        courseStudents.AttendanceSummary = ParseAttendanceSummary(attendanceSummaryProp);
                    }

                    Console.WriteLine($"CourseService: Successfully loaded {courseStudents.Students.Count} students");
                    return courseStudents;
                }
                else
                {
                    return new CourseStudentsResult
                    {
                        Success = false,
                        Message = apiResponse.TryGetProperty("message", out var msgProp) ? 
                                  msgProp.GetString() ?? "Failed to load course students" : 
                                  "Failed to load course students"
                    };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching course students for assigned course {assignedCourseId}: {ex.Message}");
                return new CourseStudentsResult
                {
                    Success = false,
                    Message = "Unable to load course students at this time. Please try again later."
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
                    CurrentAcademicYear = studentInfoElement.TryGetProperty("current_academic_year", out var currentAcademicYearProp) && currentAcademicYearProp.ValueKind != JsonValueKind.Null ? currentAcademicYearProp.GetString() : null,
                    StudentEnrollmentYear = studentInfoElement.TryGetProperty("student_enrollment_year", out var enrollmentYearProp) && enrollmentYearProp.ValueKind != JsonValueKind.Null ? enrollmentYearProp.GetInt32() : null,
                    IsGraduated = studentInfoElement.TryGetProperty("is_graduated", out var isGraduatedProp) && isGraduatedProp.GetBoolean(),
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
                var enrollmentStatus = "";
                if (courseElement.TryGetProperty("enrollment_status", out var enrollmentStatusProp))
                {
                    enrollmentStatus = enrollmentStatusProp.GetString() ?? "";
                    Console.WriteLine($"ParseSingleCourse - Raw enrollment_status from API: '{enrollmentStatus}' (Length: {enrollmentStatus.Length})");
                }
                else
                {
                    Console.WriteLine("ParseSingleCourse - No enrollment_status property found in JSON");
                }

                // Get course name for debugging
                var courseName = "";
                if (courseElement.TryGetProperty("course_name", out var courseNameProp))
                {
                    courseName = courseNameProp.GetString() ?? "";
                }

                var courseInfo = new CourseInfo
                {
                    AssignedCourseId = courseElement.TryGetProperty("assigned_course_id", out var assignedCourseIdProp) ? assignedCourseIdProp.GetInt32() : 0,
                    CourseId = courseElement.TryGetProperty("course_id", out var courseIdProp) ? courseIdProp.GetInt32() : 0,
                    CourseName = courseName,
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
                    EnrollmentStatus = enrollmentStatus,
                    RejectionReason = courseElement.TryGetProperty("rejection_reason", out var rejectionReasonProp) && rejectionReasonProp.ValueKind != JsonValueKind.Null ? rejectionReasonProp.GetString() : null,
                    CourseType = courseElement.TryGetProperty("course_type", out var courseTypeProp) ? courseTypeProp.GetString() ?? "" : "",
                    CreatedAt = courseElement.TryGetProperty("created_at", out var createdAtProp) && createdAtProp.ValueKind != JsonValueKind.Null ? createdAtProp.GetString() : null,
                    UpdatedAt = courseElement.TryGetProperty("updated_at", out var updatedAtProp) && updatedAtProp.ValueKind != JsonValueKind.Null ? updatedAtProp.GetString() : null
                };

                Console.WriteLine($"ParseSingleCourse - Course: {courseInfo.CourseName}");
                Console.WriteLine($"  - Final EnrollmentStatus: '{courseInfo.EnrollmentStatus}'");
                Console.WriteLine($"  - Status Length: {courseInfo.EnrollmentStatus?.Length}");
                Console.WriteLine($"  - Status Type: {courseInfo.EnrollmentStatus?.GetType().Name}");
                
                // Debug the entire JSON element for this course
                Console.WriteLine($"  - Raw JSON for this course: {courseElement.GetRawText()}");
                
                return courseInfo;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ParseSingleCourse - Error parsing course: {ex.Message}");
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

        private List<CourseStudentInfo> ParseCourseStudents(JsonElement studentsElement)
        {
            var students = new List<CourseStudentInfo>();

            if (studentsElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var studentElement in studentsElement.EnumerateArray())
                {
                    var student = ParseSingleCourseStudent(studentElement);
                    if (student != null)
                    {
                        students.Add(student);
                    }
                }
            }

            return students;
        }

        private CourseStudentInfo? ParseSingleCourseStudent(JsonElement studentElement)
        {
            try
            {
                return new CourseStudentInfo
                {
                    StudentId = studentElement.TryGetProperty("student_id", out var studentIdProp) ? studentIdProp.GetInt32() : 0,
                    UserId = studentElement.TryGetProperty("user_id", out var userIdProp) ? userIdProp.GetInt32() : 0,
                    StudentNumber = studentElement.TryGetProperty("student_number", out var studentNumberProp) ? studentNumberProp.GetString() ?? "" : "",
                    Name = studentElement.TryGetProperty("name", out var nameProp) ? nameProp.GetString() ?? "" : "",
                    Email = studentElement.TryGetProperty("email", out var emailProp) ? emailProp.GetString() ?? "" : "",
                    EnrollmentStatus = studentElement.TryGetProperty("enrollment_status", out var enrollmentStatusProp) ? enrollmentStatusProp.GetString() ?? "" : "",
                    RejectionReason = studentElement.TryGetProperty("rejection_reason", out var rejectionReasonProp) && rejectionReasonProp.ValueKind != JsonValueKind.Null ? rejectionReasonProp.GetString() : null,
                    EnrollmentCreatedAt = studentElement.TryGetProperty("enrollment_created_at", out var enrollmentCreatedAtProp) && enrollmentCreatedAtProp.ValueKind != JsonValueKind.Null ? enrollmentCreatedAtProp.GetString() : null,
                    EnrollmentUpdatedAt = studentElement.TryGetProperty("enrollment_updated_at", out var enrollmentUpdatedAtProp) && enrollmentUpdatedAtProp.ValueKind != JsonValueKind.Null ? enrollmentUpdatedAtProp.GetString() : null,
                    LatestAttendanceDate = studentElement.TryGetProperty("latest_attendance_date", out var latestAttendanceDateProp) && latestAttendanceDateProp.ValueKind != JsonValueKind.Null ? latestAttendanceDateProp.GetString() : null,
                    LatestAttendanceStatus = studentElement.TryGetProperty("latest_attendance_status", out var latestAttendanceStatusProp) && latestAttendanceStatusProp.ValueKind != JsonValueKind.Null ? latestAttendanceStatusProp.GetString() : null,
                    TotalAttendanceSessions = studentElement.TryGetProperty("total_attendance_sessions", out var totalAttendanceSessionsProp) ? totalAttendanceSessionsProp.GetInt32() : 0,
                    PresentCount = studentElement.TryGetProperty("present_count", out var presentCountProp) ? presentCountProp.GetInt32() : 0,
                    AbsentCount = studentElement.TryGetProperty("absent_count", out var absentCountProp) ? absentCountProp.GetInt32() : 0,
                    LateCount = studentElement.TryGetProperty("late_count", out var lateCountProp) ? lateCountProp.GetInt32() : 0,
                    AttendancePercentage = studentElement.TryGetProperty("attendance_percentage", out var attendancePercentageProp) ? attendancePercentageProp.GetDouble() : 0.0
                };
            }
            catch
            {
                return null;
            }
        }

        private AttendanceSummary? ParseAttendanceSummary(JsonElement attendanceSummaryElement)
        {
            try
            {
                return new AttendanceSummary
                {
                    TotalSessions = attendanceSummaryElement.TryGetProperty("total_sessions", out var totalSessionsProp) ? totalSessionsProp.GetInt32() : 0,
                    StudentsWithAttendance = attendanceSummaryElement.TryGetProperty("students_with_attendance", out var studentsWithAttendanceProp) ? studentsWithAttendanceProp.GetInt32() : 0,
                    AverageAttendancePercentage = attendanceSummaryElement.TryGetProperty("average_attendance_percentage", out var averageAttendancePercentageProp) ? averageAttendancePercentageProp.GetDouble() : 0.0
                };
            }
            catch
            {
                return null;
            }
        }
    }
}
