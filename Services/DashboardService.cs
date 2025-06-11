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
                Console.WriteLine("Fetching student dashboard data from API...");
                
                var response = await _apiService.GetStudentDashboardAsync(jwtToken);
                
                if (string.IsNullOrEmpty(response))
                {
                    return new DashboardDataResult
                    {
                        Success = false,
                        Message = "Empty response from API"
                    };
                }

                Console.WriteLine($"Dashboard API response received: {response.Substring(0, Math.Min(200, response.Length))}...");

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var apiResponse = JsonSerializer.Deserialize<JsonElement>(response, options);

                if (!apiResponse.TryGetProperty("success", out var successElement) || !successElement.GetBoolean())
                {
                    var message = apiResponse.TryGetProperty("message", out var msgElement) ? 
                                 msgElement.GetString() : "Failed to fetch dashboard data";
                    
                    return new DashboardDataResult
                    {
                        Success = false,
                        Message = message ?? "Unknown error occurred"
                    };
                }

                var dashboardData = ParseDashboardData(apiResponse);
                
                Console.WriteLine($"Dashboard data parsed successfully - Enrolled courses: {dashboardData.TotalEnrolledCourses}, Today's classes: {dashboardData.TodaySchedule.Count}");

                return new DashboardDataResult
                {
                    Success = true,
                    Message = "Dashboard data retrieved successfully",
                    Data = dashboardData
                };
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"HTTP error fetching dashboard data: {ex.Message}");
                return new DashboardDataResult
                {
                    Success = false,
                    Message = "Unable to connect to the server. Please check that the API is running and try again."
                };
            }
            catch (TaskCanceledException ex)
            {
                Console.WriteLine($"Timeout fetching dashboard data: {ex.Message}");
                return new DashboardDataResult
                {
                    Success = false,
                    Message = "Request timed out. Please try again."
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching dashboard data: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return new DashboardDataResult
                {
                    Success = false,
                    Message = $"Failed to fetch dashboard data: {ex.Message}"
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

        private DashboardScheduleSummary ParseScheduleSummary(JsonElement scheduleSummaryElement)
        {
            var summary = new DashboardScheduleSummary
            {
                TotalClassesToday = GetIntProperty(scheduleSummaryElement, "total_classes_today"),
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
    }
}
