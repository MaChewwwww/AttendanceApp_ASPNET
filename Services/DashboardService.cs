using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IApiService _apiService;

        public DashboardService(IApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<DashboardDataResult> GetStudentDashboardAsync(string jwtToken)
        {
            try
            {
                Console.WriteLine("=== DASHBOARD SERVICE: Starting API call ===");
                Console.WriteLine($"DASHBOARD SERVICE: JWT token provided: {!string.IsNullOrEmpty(jwtToken)}");
                
                var response = await _apiService.GetStudentDashboardAsync(jwtToken);
                
                if (string.IsNullOrEmpty(response))
                {
                    Console.WriteLine("DASHBOARD SERVICE: Empty response from API");
                    return new DashboardDataResult
                    {
                        Success = false,
                        Message = "Empty response from API"
                    };
                }

                Console.WriteLine($"DASHBOARD SERVICE: API response received ({response.Length} characters)");
                Console.WriteLine($"DASHBOARD SERVICE: Response preview: {response.Substring(0, Math.Min(300, response.Length))}...");

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                JsonElement apiResponse;
                try
                {
                    apiResponse = JsonSerializer.Deserialize<JsonElement>(response, options);
                }
                catch (JsonException ex)
                {
                    Console.WriteLine($"DASHBOARD SERVICE: JSON parsing error: {ex.Message}");
                    Console.WriteLine($"DASHBOARD SERVICE: Raw response: {response}");
                    return new DashboardDataResult
                    {
                        Success = false,
                        Message = "Invalid JSON response from API"
                    };
                }

                // Check for success property
                if (!apiResponse.TryGetProperty("success", out var successElement))
                {
                    Console.WriteLine("DASHBOARD SERVICE: No 'success' property found in API response");
                    return new DashboardDataResult
                    {
                        Success = false,
                        Message = "Invalid API response format - missing success property"
                    };
                }

                bool isSuccess = successElement.GetBoolean();
                Console.WriteLine($"DASHBOARD SERVICE: API success status: {isSuccess}");

                if (!isSuccess)
                {
                    var message = apiResponse.TryGetProperty("message", out var msgElement) ? 
                                 msgElement.GetString() : "Failed to fetch dashboard data";
                    
                    Console.WriteLine($"DASHBOARD SERVICE: API returned failure: {message}");
                    return new DashboardDataResult
                    {
                        Success = false,
                        Message = message ?? "API request was unsuccessful"
                    };
                }

                Console.WriteLine("DASHBOARD SERVICE: API returned success, parsing data...");
                var dashboardData = ParseDashboardData(apiResponse);
                
                Console.WriteLine($"DASHBOARD SERVICE: Data parsed successfully");
                Console.WriteLine($"DASHBOARD SERVICE: - Enrolled courses: {dashboardData.TotalEnrolledCourses}");
                Console.WriteLine($"DASHBOARD SERVICE: - Today's classes: {dashboardData.TodaySchedule.Count}");
                Console.WriteLine($"DASHBOARD SERVICE: - All schedules: {dashboardData.AllSchedules.Count}");
                Console.WriteLine($"DASHBOARD SERVICE: - Current class: {(dashboardData.ScheduleSummary.CurrentClass != null ? dashboardData.ScheduleSummary.CurrentClass.CourseName : "None")}");

                return new DashboardDataResult
                {
                    Success = true,
                    Message = "Dashboard data retrieved successfully",
                    Data = dashboardData
                };
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"DASHBOARD SERVICE: HTTP error: {ex.Message}");
                return new DashboardDataResult
                {
                    Success = false,
                    Message = "Unable to connect to the server. Please check that the API is running and try again."
                };
            }
            catch (TaskCanceledException ex)
            {
                Console.WriteLine($"DASHBOARD SERVICE: Timeout error: {ex.Message}");
                return new DashboardDataResult
                {
                    Success = false,
                    Message = "Request timed out. Please try again."
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DASHBOARD SERVICE: Unexpected error: {ex.Message}");
                Console.WriteLine($"DASHBOARD SERVICE: Stack trace: {ex.StackTrace}");
                return new DashboardDataResult
                {
                    Success = false,
                    Message = $"System error: {ex.Message}"
                };
            }
        }

        public async Task<FacultyDashboardDataResult> GetFacultyDashboardAsync(string jwtToken)
        {
            try
            {
                Console.WriteLine("=== FACULTY DASHBOARD SERVICE: Starting API call ===");
                Console.WriteLine($"FACULTY DASHBOARD SERVICE: JWT token provided: {!string.IsNullOrEmpty(jwtToken)}");
                
                var response = await _apiService.GetFacultyDashboardAsync(jwtToken);
                
                if (string.IsNullOrEmpty(response))
                {
                    Console.WriteLine("FACULTY DASHBOARD SERVICE: Empty response from API");
                    return new FacultyDashboardDataResult
                    {
                        Success = false,
                        Message = "Empty response from API"
                    };
                }

                Console.WriteLine($"FACULTY DASHBOARD SERVICE: API response received ({response.Length} characters)");
                Console.WriteLine($"FACULTY DASHBOARD SERVICE: Response preview: {response.Substring(0, Math.Min(300, response.Length))}...");

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                JsonElement apiResponse;
                try
                {
                    apiResponse = JsonSerializer.Deserialize<JsonElement>(response, options);
                }
                catch (JsonException ex)
                {
                    Console.WriteLine($"FACULTY DASHBOARD SERVICE: JSON parsing error: {ex.Message}");
                    Console.WriteLine($"FACULTY DASHBOARD SERVICE: Raw response: {response}");
                    return new FacultyDashboardDataResult
                    {
                        Success = false,
                        Message = "Invalid JSON response from API"
                    };
                }

                // Check for success property
                if (!apiResponse.TryGetProperty("success", out var successElement))
                {
                    Console.WriteLine("FACULTY DASHBOARD SERVICE: No 'success' property found in API response");
                    return new FacultyDashboardDataResult
                    {
                        Success = false,
                        Message = "Invalid API response format - missing success property"
                    };
                }

                bool isSuccess = successElement.GetBoolean();
                Console.WriteLine($"FACULTY DASHBOARD SERVICE: API success status: {isSuccess}");

                if (!isSuccess)
                {
                    var message = apiResponse.TryGetProperty("message", out var msgElement) ? 
                                 msgElement.GetString() : "Failed to fetch faculty dashboard data";
                    
                    Console.WriteLine($"FACULTY DASHBOARD SERVICE: API returned failure: {message}");
                    return new FacultyDashboardDataResult
                    {
                        Success = false,
                        Message = message ?? "API request was unsuccessful"
                    };
                }

                Console.WriteLine("FACULTY DASHBOARD SERVICE: API returned success, parsing data...");
                var dashboardData = ParseFacultyDashboardData(apiResponse);
                
                Console.WriteLine($"FACULTY DASHBOARD SERVICE: Data parsed successfully");
                Console.WriteLine($"FACULTY DASHBOARD SERVICE: - Current courses: {dashboardData.CurrentCourses.Count}");
                Console.WriteLine($"FACULTY DASHBOARD SERVICE: - Today's classes: {dashboardData.TodaySchedule.Count}");
                Console.WriteLine($"FACULTY DASHBOARD SERVICE: - All schedules: {dashboardData.AllSchedules.Count}");
                Console.WriteLine($"FACULTY DASHBOARD SERVICE: - Current class: {(dashboardData.ScheduleSummary.CurrentClass != null ? dashboardData.ScheduleSummary.CurrentClass.CourseName : "None")}");

                return new FacultyDashboardDataResult
                {
                    Success = true,
                    Message = "Faculty dashboard data retrieved successfully",
                    Data = dashboardData
                };
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"FACULTY DASHBOARD SERVICE: HTTP error: {ex.Message}");
                return new FacultyDashboardDataResult
                {
                    Success = false,
                    Message = "Unable to connect to the server. Please check that the API is running and try again."
                };
            }
            catch (TaskCanceledException ex)
            {
                Console.WriteLine($"FACULTY DASHBOARD SERVICE: Timeout error: {ex.Message}");
                return new FacultyDashboardDataResult
                {
                    Success = false,
                    Message = "Request timed out. Please try again."
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"FACULTY DASHBOARD SERVICE: Unexpected error: {ex.Message}");
                Console.WriteLine($"FACULTY DASHBOARD SERVICE: Stack trace: {ex.StackTrace}");
                return new FacultyDashboardDataResult
                {
                    Success = false,
                    Message = $"System error: {ex.Message}"
                };
            }
        }

        private StudentDashboardData ParseDashboardData(JsonElement apiResponse)
        {
            var dashboardData = new StudentDashboardData();

            // Parse student info
            if (apiResponse.TryGetProperty("student_info", out var studentInfoElement))
            {
                dashboardData.StudentInfo = ParseStudentInfo(studentInfoElement);
            }

            // Parse current classes
            if (apiResponse.TryGetProperty("current_classes", out var currentClassesElement) && 
                currentClassesElement.ValueKind == JsonValueKind.Array)
            {
                dashboardData.CurrentClasses = ParseCurrentClasses(currentClassesElement);
            }

            // Parse today's schedule
            if (apiResponse.TryGetProperty("today_schedule", out var todayScheduleElement) && 
                todayScheduleElement.ValueKind == JsonValueKind.Array)
            {
                dashboardData.TodaySchedule = ParseTodaySchedule(todayScheduleElement);
            }

            // Parse all schedules
            if (apiResponse.TryGetProperty("all_schedules", out var allSchedulesElement) && 
                allSchedulesElement.ValueKind == JsonValueKind.Array)
            {
                dashboardData.AllSchedules = ParseTodaySchedule(allSchedulesElement);
            }

            // Parse enrollment data
            if (apiResponse.TryGetProperty("total_enrolled_courses", out var totalCoursesElement))
            {
                dashboardData.TotalEnrolledCourses = totalCoursesElement.GetInt32();
            }

            if (apiResponse.TryGetProperty("pending_approvals", out var pendingApprovalsElement))
            {
                dashboardData.PendingApprovals = pendingApprovalsElement.GetInt32();
            }

            // Parse schedule summary
            if (apiResponse.TryGetProperty("schedule_summary", out var scheduleSummaryElement))
            {
                dashboardData.ScheduleSummary = ParseScheduleSummary(scheduleSummaryElement);
            }

            return dashboardData;
        }

        private FacultyDashboardData ParseFacultyDashboardData(JsonElement apiResponse)
        {
            var dashboardData = new FacultyDashboardData();

            // Parse faculty info
            if (apiResponse.TryGetProperty("faculty_info", out var facultyInfoElement))
            {
                dashboardData.FacultyInfo = ParseFacultyInfo(facultyInfoElement);
            }

            // Parse current courses
            if (apiResponse.TryGetProperty("current_courses", out var currentCoursesElement) && 
                currentCoursesElement.ValueKind == JsonValueKind.Array)
            {
                dashboardData.CurrentCourses = ParseFacultyCourseList(currentCoursesElement);
            }

            // Parse previous courses
            if (apiResponse.TryGetProperty("previous_courses", out var previousCoursesElement) && 
                previousCoursesElement.ValueKind == JsonValueKind.Array)
            {
                dashboardData.PreviousCourses = ParseFacultyCourseList(previousCoursesElement);
            }

            // Parse today's schedule
            if (apiResponse.TryGetProperty("today_schedule", out var todayScheduleElement) && 
                todayScheduleElement.ValueKind == JsonValueKind.Array)
            {
                dashboardData.TodaySchedule = ParseFacultyScheduleItems(todayScheduleElement);
            }

            // Parse all schedules
            if (apiResponse.TryGetProperty("all_schedules", out var allSchedulesElement) && 
                allSchedulesElement.ValueKind == JsonValueKind.Array)
            {
                dashboardData.AllSchedules = ParseFacultyScheduleItems(allSchedulesElement);
            }

            // Parse recent attendance
            if (apiResponse.TryGetProperty("recent_attendance", out var recentAttendanceElement) && 
                recentAttendanceElement.ValueKind == JsonValueKind.Array)
            {
                dashboardData.RecentAttendance = ParseFacultyRecentAttendance(recentAttendanceElement);
            }

            // Parse schedule summary
            if (apiResponse.TryGetProperty("schedule_summary", out var scheduleSummaryElement))
            {
                dashboardData.ScheduleSummary = ParseFacultyScheduleSummary(scheduleSummaryElement);
            }

            // Parse numeric properties
            dashboardData.TotalCurrentCourses = GetIntProperty(apiResponse, "total_current_courses");
            dashboardData.TotalPreviousCourses = GetIntProperty(apiResponse, "total_previous_courses");
            dashboardData.TotalPendingApprovals = GetIntProperty(apiResponse, "total_pending_approvals");
            dashboardData.TodayAttendanceCount = GetIntProperty(apiResponse, "today_attendance_count");

            return dashboardData;
        }

        private Dictionary<string, object> ParseStudentInfo(JsonElement studentInfoElement)
        {
            var studentInfo = new Dictionary<string, object>();
            
            foreach (var property in studentInfoElement.EnumerateObject())
            {
                studentInfo[property.Name] = property.Value.ValueKind switch
                {
                    JsonValueKind.String => property.Value.GetString() ?? string.Empty,
                    JsonValueKind.Number => property.Value.GetInt32(),
                    JsonValueKind.True => true,
                    JsonValueKind.False => false,
                    _ => property.Value.ToString()
                };
            }
            
            return studentInfo;
        }

        private Dictionary<string, object> ParseFacultyInfo(JsonElement facultyInfoElement)
        {
            var facultyInfo = new Dictionary<string, object>();
            
            foreach (var property in facultyInfoElement.EnumerateObject())
            {
                facultyInfo[property.Name] = property.Value.ValueKind switch
                {
                    JsonValueKind.String => property.Value.GetString() ?? string.Empty,
                    JsonValueKind.Number => property.Value.GetInt32(),
                    JsonValueKind.True => true,
                    JsonValueKind.False => false,
                    _ => property.Value.ToString()
                };
            }
            
            return facultyInfo;
        }

        private List<DashboardClassInfo> ParseCurrentClasses(JsonElement currentClassesElement)
        {
            var classes = new List<DashboardClassInfo>();
            
            foreach (var classElement in currentClassesElement.EnumerateArray())
            {
                var classInfo = new DashboardClassInfo
                {
                    AssignedCourseId = GetIntProperty(classElement, "assigned_course_id"),
                    CourseId = GetIntProperty(classElement, "course_id"),
                    CourseName = GetStringProperty(classElement, "course_name"),
                    CourseCode = GetStringProperty(classElement, "course_code"),
                    CourseDescription = GetStringProperty(classElement, "course_description"),
                    FacultyName = GetStringProperty(classElement, "faculty_name"),
                    FacultyEmail = GetStringProperty(classElement, "faculty_email"),
                    AcademicYear = GetStringProperty(classElement, "academic_year"),
                    Semester = GetStringProperty(classElement, "semester"),
                    Room = GetStringProperty(classElement, "room"),
                    EnrollmentStatus = GetStringProperty(classElement, "enrollment_status")
                };
                
                classes.Add(classInfo);
            }
            
            return classes;
        }

        private List<FacultyCourseInfo> ParseFacultyCourseList(JsonElement coursesElement)
        {
            var courses = new List<FacultyCourseInfo>();
            
            foreach (var item in coursesElement.EnumerateArray())
            {
                var course = new FacultyCourseInfo
                {
                    AssignedCourseId = GetIntProperty(item, "assigned_course_id"),
                    CourseId = GetIntProperty(item, "course_id"),
                    CourseName = GetStringProperty(item, "course_name"),
                    CourseCode = GetStringProperty(item, "course_code"),
                    CourseDescription = GetStringProperty(item, "course_description"),
                    SectionId = GetIntProperty(item, "section_id"),
                    SectionName = GetStringProperty(item, "section_name"),
                    ProgramId = GetIntProperty(item, "program_id"),
                    ProgramName = GetStringProperty(item, "program_name"),
                    ProgramAcronym = GetStringProperty(item, "program_acronym"),
                    AcademicYear = GetStringProperty(item, "academic_year"),
                    Semester = GetStringProperty(item, "semester"),
                    Room = GetStringProperty(item, "room"),
                    TotalStudents = GetIntProperty(item, "total_students"),
                    EnrolledStudents = GetIntProperty(item, "enrolled_students"),
                    PendingStudents = GetIntProperty(item, "pending_students"),
                    RejectedStudents = GetIntProperty(item, "rejected_students")
                };
                
                courses.Add(course);
            }
            
            return courses;
        }

        private List<DashboardScheduleItem> ParseTodaySchedule(JsonElement todayScheduleElement)
        {
            var scheduleItems = new List<DashboardScheduleItem>();
            
            foreach (var scheduleElement in todayScheduleElement.EnumerateArray())
            {
                var scheduleItem = new DashboardScheduleItem
                {
                    ScheduleId = GetIntProperty(scheduleElement, "schedule_id"),
                    AssignedCourseId = GetIntProperty(scheduleElement, "assigned_course_id"),
                    CourseName = GetStringProperty(scheduleElement, "course_name"),
                    CourseCode = GetStringProperty(scheduleElement, "course_code"),
                    FacultyName = GetStringProperty(scheduleElement, "faculty_name"),
                    Room = GetStringProperty(scheduleElement, "room"),
                    DayOfWeek = GetStringProperty(scheduleElement, "day_of_week"),
                    StartTime = GetStringProperty(scheduleElement, "start_time"),
                    EndTime = GetStringProperty(scheduleElement, "end_time"),
                    Status = GetStringProperty(scheduleElement, "status")
                };
                
                scheduleItems.Add(scheduleItem);
            }
            
            return scheduleItems;
        }

        private List<FacultyScheduleItem> ParseFacultyScheduleItems(JsonElement scheduleElement)
        {
            var scheduleItems = new List<FacultyScheduleItem>();
            
            foreach (var item in scheduleElement.EnumerateArray())
            {
                var scheduleItem = new FacultyScheduleItem
                {
                    ScheduleId = GetIntProperty(item, "schedule_id"),
                    AssignedCourseId = GetIntProperty(item, "assigned_course_id"),
                    CourseName = GetStringProperty(item, "course_name"),
                    CourseCode = GetStringProperty(item, "course_code"),
                    SectionName = GetStringProperty(item, "section_name"),
                    ProgramAcronym = GetStringProperty(item, "program_acronym"),
                    Room = GetStringProperty(item, "room"),
                    DayOfWeek = GetStringProperty(item, "day_of_week"),
                    StartTime = GetStringProperty(item, "start_time"),
                    EndTime = GetStringProperty(item, "end_time"),
                    Status = GetStringProperty(item, "status"),
                    IsToday = GetBoolProperty(item, "is_today")
                };
                
                scheduleItems.Add(scheduleItem);
            }
            
            return scheduleItems;
        }

        private List<FacultyRecentAttendance> ParseFacultyRecentAttendance(JsonElement attendanceElement)
        {
            var attendanceList = new List<FacultyRecentAttendance>();
            
            foreach (var item in attendanceElement.EnumerateArray())
            {
                var attendance = new FacultyRecentAttendance
                {
                    AttendanceId = GetIntProperty(item, "attendance_id"),
                    StudentName = GetStringProperty(item, "student_name"),
                    CourseName = GetStringProperty(item, "course_name"),
                    SectionName = GetStringProperty(item, "section_name"),
                    Status = GetStringProperty(item, "status"),
                    Date = GetStringProperty(item, "date")
                };
                
                attendanceList.Add(attendance);
            }
            
            return attendanceList;
        }

        private DashboardScheduleSummary ParseScheduleSummary(JsonElement scheduleSummaryElement)
        {
            var summary = new DashboardScheduleSummary
            {
                TotalClassesToday = GetIntProperty(scheduleSummaryElement, "total_classes_today"),
                TotalWeeklySchedules = GetIntProperty(scheduleSummaryElement, "total_weekly_schedules"),
                CurrentDay = GetStringProperty(scheduleSummaryElement, "current_day")
            };

            if (scheduleSummaryElement.TryGetProperty("current_class", out var currentClassElement) &&
                currentClassElement.ValueKind != JsonValueKind.Null)
            {
                summary.CurrentClass = ParseScheduleItem(currentClassElement);
            }

            if (scheduleSummaryElement.TryGetProperty("next_class", out var nextClassElement) &&
                nextClassElement.ValueKind != JsonValueKind.Null)
            {
                summary.NextClass = ParseScheduleItem(nextClassElement);
            }

            return summary;
        }

        private FacultyScheduleSummary ParseFacultyScheduleSummary(JsonElement summaryElement)
        {
            var summary = new FacultyScheduleSummary
            {
                TotalClassesToday = GetIntProperty(summaryElement, "total_classes_today"),
                TotalWeeklySchedules = GetIntProperty(summaryElement, "total_weekly_schedules"),
                CurrentDay = GetStringProperty(summaryElement, "current_day")
            };

            // Parse current class
            if (summaryElement.TryGetProperty("current_class", out var currentClassElement) && 
                currentClassElement.ValueKind != JsonValueKind.Null)
            {
                summary.CurrentClass = new FacultyScheduleItem
                {
                    ScheduleId = GetIntProperty(currentClassElement, "schedule_id"),
                    AssignedCourseId = GetIntProperty(currentClassElement, "assigned_course_id"),
                    CourseName = GetStringProperty(currentClassElement, "course_name"),
                    CourseCode = GetStringProperty(currentClassElement, "course_code"),
                    SectionName = GetStringProperty(currentClassElement, "section_name"),
                    ProgramAcronym = GetStringProperty(currentClassElement, "program_acronym"),
                    Room = GetStringProperty(currentClassElement, "room"),
                    DayOfWeek = GetStringProperty(currentClassElement, "day_of_week"),
                    StartTime = GetStringProperty(currentClassElement, "start_time"),
                    EndTime = GetStringProperty(currentClassElement, "end_time"),
                    Status = GetStringProperty(currentClassElement, "status"),
                    IsToday = GetBoolProperty(currentClassElement, "is_today")
                };
            }

            // Parse next class
            if (summaryElement.TryGetProperty("next_class", out var nextClassElement) && 
                nextClassElement.ValueKind != JsonValueKind.Null)
            {
                summary.NextClass = new FacultyScheduleItem
                {
                    ScheduleId = GetIntProperty(nextClassElement, "schedule_id"),
                    AssignedCourseId = GetIntProperty(nextClassElement, "assigned_course_id"),
                    CourseName = GetStringProperty(nextClassElement, "course_name"),
                    CourseCode = GetStringProperty(nextClassElement, "course_code"),
                    SectionName = GetStringProperty(nextClassElement, "section_name"),
                    ProgramAcronym = GetStringProperty(nextClassElement, "program_acronym"),
                    Room = GetStringProperty(nextClassElement, "room"),
                    DayOfWeek = GetStringProperty(nextClassElement, "day_of_week"),
                    StartTime = GetStringProperty(nextClassElement, "start_time"),
                    EndTime = GetStringProperty(nextClassElement, "end_time"),
                    Status = GetStringProperty(nextClassElement, "status"),
                    IsToday = GetBoolProperty(nextClassElement, "is_today")
                };
            }

            return summary;
        }

        private DashboardScheduleItem ParseScheduleItem(JsonElement scheduleElement)
        {
            return new DashboardScheduleItem
            {
                ScheduleId = GetIntProperty(scheduleElement, "schedule_id"),
                AssignedCourseId = GetIntProperty(scheduleElement, "assigned_course_id"),
                CourseName = GetStringProperty(scheduleElement, "course_name"),
                CourseCode = GetStringProperty(scheduleElement, "course_code"),
                FacultyName = GetStringProperty(scheduleElement, "faculty_name"),
                Room = GetStringProperty(scheduleElement, "room"),
                DayOfWeek = GetStringProperty(scheduleElement, "day_of_week"),
                StartTime = GetStringProperty(scheduleElement, "start_time"),
                EndTime = GetStringProperty(scheduleElement, "end_time"),
                Status = GetStringProperty(scheduleElement, "status")
            };
        }

        private string GetStringProperty(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var property) && 
                   property.ValueKind == JsonValueKind.String ? 
                   property.GetString() ?? string.Empty : string.Empty;
        }

        private int GetIntProperty(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var property) && 
                   property.ValueKind == JsonValueKind.Number ? 
                   property.GetInt32() : 0;
        }

        private bool GetBoolProperty(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var property) && 
                   property.ValueKind == JsonValueKind.True;
        }
    }
}
