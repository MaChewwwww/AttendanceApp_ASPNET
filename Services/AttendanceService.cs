using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly IApiService _apiService;

        public AttendanceService(IApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<CurrentSemesterAttendanceResult> GetCurrentSemesterAttendanceAsync(string jwtToken)
        {
            try
            {
                Console.WriteLine("Fetching current semester attendance data from API...");
                
                var response = await _apiService.GetCurrentSemesterAttendanceAsync(jwtToken);
                
                if (string.IsNullOrEmpty(response))
                {
                    return new CurrentSemesterAttendanceResult
                    {
                        Success = false,
                        Message = "Empty response from API"
                    };
                }

                Console.WriteLine($"Current semester attendance API response received: {response.Substring(0, Math.Min(200, response.Length))}...");

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var apiResponse = JsonSerializer.Deserialize<JsonElement>(response, options);

                if (!apiResponse.TryGetProperty("success", out var successElement) || !successElement.GetBoolean())
                {
                    var message = apiResponse.TryGetProperty("message", out var msgElement) ? 
                                 msgElement.GetString() : "Failed to fetch current semester attendance";
                    
                    return new CurrentSemesterAttendanceResult
                    {
                        Success = false,
                        Message = message ?? "Unknown error occurred"
                    };
                }

                var attendanceData = ParseCurrentSemesterAttendanceData(apiResponse);
                
                Console.WriteLine($"Current semester attendance data parsed successfully - Total logs: {attendanceData.TotalLogs}, Courses: {attendanceData.Courses.Count}");

                return new CurrentSemesterAttendanceResult
                {
                    Success = true,
                    Message = "Current semester attendance data retrieved successfully",
                    StudentInfo = attendanceData.StudentInfo,
                    AttendanceLogs = attendanceData.AttendanceLogs,
                    TotalLogs = attendanceData.TotalLogs,
                    Courses = attendanceData.Courses,
                    AcademicYear = attendanceData.AcademicYear,
                    Semester = attendanceData.Semester,
                    AttendanceSummary = attendanceData.AttendanceSummary
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching current semester attendance: {ex.Message}");
                return new CurrentSemesterAttendanceResult
                {
                    Success = false,
                    Message = $"Failed to fetch current semester attendance: {ex.Message}"
                };
            }
        }

        public async Task<AttendanceRateResult> CalculateAttendanceRateAsync(string jwtToken)
        {
            try
            {
                Console.WriteLine("=== STARTING ATTENDANCE RATE CALCULATION ===");
                Console.WriteLine("Fetching attendance data for rate calculation...");
                
                var response = await _apiService.GetCurrentSemesterAttendanceAsync(jwtToken);
                
                if (string.IsNullOrEmpty(response))
                {
                    Console.WriteLine("ERROR: Empty response from attendance API");
                    return new AttendanceRateResult
                    {
                        Success = false,
                        Message = "Empty response from API"
                    };
                }

                Console.WriteLine($"SUCCESS: Attendance API response received ({response.Length} characters)");

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var apiResponse = JsonSerializer.Deserialize<JsonElement>(response, options);

                if (!apiResponse.TryGetProperty("success", out var successElement) || !successElement.GetBoolean())
                {
                    var message = apiResponse.TryGetProperty("message", out var msgElement) ? 
                                 msgElement.GetString() : "Failed to fetch attendance data";
                    
                    Console.WriteLine($"ERROR: API returned unsuccessful response: {message}");
                    return new AttendanceRateResult
                    {
                        Success = false,
                        Message = message ?? "Unknown error occurred"
                    };
                }

                Console.WriteLine("SUCCESS: API returned successful response");

                // Check for attendance_summary first, but prioritize attendance_logs if summary is missing
                bool hasSummary = apiResponse.TryGetProperty("attendance_summary", out var summaryElement);
                bool hasLogs = apiResponse.TryGetProperty("attendance_logs", out var logsElement) && 
                              logsElement.ValueKind == JsonValueKind.Array;

                Console.WriteLine($"Data availability - Has summary: {hasSummary}, Has logs: {hasLogs}");

                if (hasLogs)
                {
                    Console.WriteLine($"PROCESSING: attendance_logs array with {logsElement.GetArrayLength()} items");
                    
                    var logs = logsElement.EnumerateArray().ToList();
                    var totalClasses = logs.Count;
                    
                    Console.WriteLine($"Processing {totalClasses} attendance logs manually...");
                    
                    if (totalClasses > 0)
                    {
                        var presentClasses = 0;
                        var absentClasses = 0;
                        var lateClasses = 0;
                        
                        foreach (var log in logs)
                        {
                            var status = GetStringProperty(log, "status");
                            
                            if (status.Equals("present", StringComparison.OrdinalIgnoreCase))
                                presentClasses++;
                            else if (status.Equals("absent", StringComparison.OrdinalIgnoreCase))
                                absentClasses++;
                            else if (status.Equals("late", StringComparison.OrdinalIgnoreCase))
                                lateClasses++;
                        }

                        Console.WriteLine($"FINAL COUNTS - Total: {totalClasses}, Present: {presentClasses}, Absent: {absentClasses}, Late: {lateClasses}");

                        var attendanceRate = ((double)(presentClasses + lateClasses) / totalClasses) * 100;
                        
                        // Get academic year and semester
                        var academicYear = GetStringProperty(apiResponse, "academic_year") ?? "2023-2024";
                        var semester = GetStringProperty(apiResponse, "semester") ?? "1st Semester";
                        
                        Console.WriteLine($"SUCCESS: Calculated attendance rate from logs: {attendanceRate:F1}% for {academicYear} {semester}");
                        
                        return new AttendanceRateResult
                        {
                            Success = true,
                            Message = "Attendance rate calculated from logs",
                            AttendanceRate = Math.Round(attendanceRate, 1),
                            TotalClasses = totalClasses,
                            PresentClasses = presentClasses,
                            AbsentClasses = absentClasses,
                            LateClasses = lateClasses,
                            AcademicYear = academicYear,
                            Semester = semester
                        };
                    }
                    else
                    {
                        Console.WriteLine("ERROR: Attendance logs array is empty");
                    }
                }
                else if (hasSummary)
                {
                    Console.WriteLine("FALLBACK: Using attendance_summary");
                    Console.WriteLine($"Summary content: {summaryElement}");
                    
                    var totalClasses = GetIntProperty(summaryElement, "total_classes", "total_attendance_logs", "total");
                    var presentClasses = GetIntProperty(summaryElement, "present_classes", "present");
                    var absentClasses = GetIntProperty(summaryElement, "absent_classes", "absent");
                    var lateClasses = GetIntProperty(summaryElement, "late_classes", "late");

                    Console.WriteLine($"PARSED FROM SUMMARY - Total: {totalClasses}, Present: {presentClasses}, Absent: {absentClasses}, Late: {lateClasses}");

                    if (totalClasses > 0)
                    {
                        var attendanceRate = ((double)(presentClasses + lateClasses) / totalClasses) * 100;
                        
                        // Get academic year and semester
                        var academicYear = GetStringProperty(apiResponse, "academic_year") ?? "2023-2024";
                        var semester = GetStringProperty(apiResponse, "semester") ?? "1st Semester";

                        Console.WriteLine($"SUCCESS: Calculated attendance rate: {attendanceRate:F1}% for {academicYear} {semester}");

                        return new AttendanceRateResult
                        {
                            Success = true,
                            Message = "Attendance rate calculated successfully",
                            AttendanceRate = Math.Round(attendanceRate, 1),
                            TotalClasses = totalClasses,
                            PresentClasses = presentClasses,
                            AbsentClasses = absentClasses,
                            LateClasses = lateClasses,
                            AcademicYear = academicYear,
                            Semester = semester
                        };
                    }
                    else
                    {
                        Console.WriteLine("ERROR: No attendance data found - total classes is 0");
                    }
                }
                else
                {
                    Console.WriteLine("ERROR: No attendance data found - neither logs nor summary available");
                }
                
                return new AttendanceRateResult
                {
                    Success = false,
                    Message = "No attendance data found in API response"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== ERROR IN ATTENDANCE RATE CALCULATION ===");
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return new AttendanceRateResult
                {
                    Success = false,
                    Message = $"Failed to calculate attendance rate: {ex.Message}"
                };
            }
        }

        private int GetIntProperty(JsonElement element, params string[] propertyNames)
        {
            foreach (var propertyName in propertyNames)
            {
                if (element.TryGetProperty(propertyName, out var property))
                {
                    Console.WriteLine($"Found property '{propertyName}' with value: {property} (Type: {property.ValueKind})");
                    
                    if (property.ValueKind == JsonValueKind.Number)
                    {
                        var result = property.GetInt32();
                        Console.WriteLine($"Parsed as number: {result}");
                        return result;
                    }
                    else if (property.ValueKind == JsonValueKind.String)
                    {
                        var stringValue = property.GetString();
                        if (int.TryParse(stringValue, out int result))
                        {
                            Console.WriteLine($"Parsed string '{stringValue}' as number: {result}");
                            return result;
                        }
                        else
                        {
                            Console.WriteLine($"Failed to parse string '{stringValue}' as number");
                        }
                    }
                    else
                    {
                        Console.WriteLine($"Property '{propertyName}' has unsupported type: {property.ValueKind}");
                    }
                }
                else
                {
                    Console.WriteLine($"Property '{propertyName}' not found");
                }
            }
            Console.WriteLine($"Returning default value 0 for properties: {string.Join(", ", propertyNames)}");
            return 0;
        }

        private string GetStringProperty(JsonElement element, string propertyName)
        {
            if (element.TryGetProperty(propertyName, out var property))
            {
                Console.WriteLine($"Found string property '{propertyName}' with value: {property} (Type: {property.ValueKind})");
                
                if (property.ValueKind == JsonValueKind.String)
                {
                    var result = property.GetString() ?? string.Empty;
                    Console.WriteLine($"Parsed as string: '{result}'");
                    return result;
                }
                else if (property.ValueKind == JsonValueKind.Number)
                {
                    var result = property.GetInt32().ToString();
                    Console.WriteLine($"Parsed number as string: '{result}'");
                    return result;
                }
                else
                {
                    Console.WriteLine($"Property '{propertyName}' has unsupported type: {property.ValueKind}");
                }
            }
            else
            {
                Console.WriteLine($"String property '{propertyName}' not found");
            }
            return string.Empty;
        }

        public async Task<AttendanceChartsResult> GetAttendanceChartsDataAsync(string jwtToken)
        {
            try
            {
                Console.WriteLine("Fetching attendance data for charts...");
                
                var attendanceResult = await GetCurrentSemesterAttendanceAsync(jwtToken);
                
                if (!attendanceResult.Success)
                {
                    Console.WriteLine($"Failed to fetch attendance data: {attendanceResult.Message}");
                    return new AttendanceChartsResult
                    {
                        Success = false,
                        Message = attendanceResult.Message
                    };
                }

                Console.WriteLine($"Processing {attendanceResult.AttendanceLogs.Count} attendance logs for charts data");

                var chartsData = GenerateChartsData(attendanceResult.AttendanceLogs);

                Console.WriteLine($"Charts data generated successfully - Weekly points: {chartsData.WeeklyData.Count}, Monthly points: {chartsData.MonthlyData.Count}, Course points: {chartsData.CourseWiseData.Count}");

                return new AttendanceChartsResult
                {
                    Success = true,
                    Message = "Charts data generated successfully",
                    WeeklyData = chartsData.WeeklyData,
                    MonthlyData = chartsData.MonthlyData,
                    CourseWiseData = chartsData.CourseWiseData,
                    OverallStats = chartsData.OverallStats
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error generating charts data: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return new AttendanceChartsResult
                {
                    Success = false,
                    Message = $"Failed to generate charts data: {ex.Message}"
                };
            }
        }

        private CurrentSemesterAttendanceResult ParseCurrentSemesterAttendanceData(JsonElement apiResponse)
        {
            var attendanceData = new CurrentSemesterAttendanceResult();

            try
            {
                // Parse student info
                if (apiResponse.TryGetProperty("student_info", out var studentInfoElement))
                {
                    Console.WriteLine("Parsing student_info...");
                    attendanceData.StudentInfo = ParseStudentInfo(studentInfoElement);
                }

                // Parse attendance logs
                if (apiResponse.TryGetProperty("attendance_logs", out var logsElement) && 
                    logsElement.ValueKind == JsonValueKind.Array)
                {
                    Console.WriteLine($"Parsing attendance_logs array with {logsElement.GetArrayLength()} items...");
                    attendanceData.AttendanceLogs = ParseAttendanceLogs(logsElement);
                }

                // Parse courses
                if (apiResponse.TryGetProperty("courses", out var coursesElement) && 
                    coursesElement.ValueKind == JsonValueKind.Array)
                {
                    Console.WriteLine($"Parsing courses array with {coursesElement.GetArrayLength()} items...");
                    attendanceData.Courses = ParseCourses(coursesElement);
                }

                // Parse basic properties with error handling
                try
                {
                    attendanceData.TotalLogs = GetIntProperty(apiResponse, "total_logs");
                    Console.WriteLine($"Parsed total_logs: {attendanceData.TotalLogs}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error parsing total_logs: {ex.Message}");
                    attendanceData.TotalLogs = 0;
                }

                attendanceData.AcademicYear = GetStringProperty(apiResponse, "academic_year");
                attendanceData.Semester = GetStringProperty(apiResponse, "semester");

                // Parse attendance summary
                if (apiResponse.TryGetProperty("attendance_summary", out var summaryElement))
                {
                    Console.WriteLine("Parsing attendance_summary...");
                    attendanceData.AttendanceSummary = ParseAttendanceSummary(summaryElement);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ParseCurrentSemesterAttendanceData: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw; // Re-throw to get the full context
            }

            return attendanceData;
        }

        private Dictionary<string, object> ParseStudentInfo(JsonElement studentInfoElement)
        {
            var studentInfo = new Dictionary<string, object>();
            
            try
            {
                foreach (var property in studentInfoElement.EnumerateObject())
                {
                    try
                    {
                        studentInfo[property.Name] = property.Value.ValueKind switch
                        {
                            JsonValueKind.String => property.Value.GetString() ?? string.Empty,
                            JsonValueKind.Number => property.Value.GetInt32(),
                            JsonValueKind.True => true,
                            JsonValueKind.False => false,
                            JsonValueKind.Null => null,
                            _ => property.Value.ToString()
                        };
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error parsing student info property '{property.Name}': {ex.Message}");
                        studentInfo[property.Name] = property.Value.ToString();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error parsing student info: {ex.Message}");
            }
            
            return studentInfo;
        }

        private List<CurrentSemesterAttendanceRecord> ParseAttendanceLogs(JsonElement logsElement)
        {
            var logs = new List<CurrentSemesterAttendanceRecord>();
            
            try
            {
                foreach (var logElement in logsElement.EnumerateArray())
                {
                    try
                    {
                        var log = new CurrentSemesterAttendanceRecord
                        {
                            AttendanceId = GetIntProperty(logElement, "attendance_id"),
                            AssignedCourseId = GetIntProperty(logElement, "assigned_course_id"),
                            CourseId = GetIntProperty(logElement, "course_id"),
                            CourseName = GetStringProperty(logElement, "course_name"),
                            CourseCode = GetStringProperty(logElement, "course_code"),
                            CourseDescription = GetStringProperty(logElement, "course_description"),
                            FacultyName = GetStringProperty(logElement, "faculty_name"),
                            FacultyEmail = GetStringProperty(logElement, "faculty_email"),
                            AcademicYear = GetStringProperty(logElement, "academic_year"),
                            Semester = GetStringProperty(logElement, "semester"),
                            Room = GetStringProperty(logElement, "room"),
                            AttendanceDate = GetStringProperty(logElement, "attendance_date"),
                            Status = GetStringProperty(logElement, "status"),
                            HasImage = GetBoolProperty(logElement, "has_image"),
                            CreatedAt = GetStringProperty(logElement, "created_at"),
                            UpdatedAt = GetStringProperty(logElement, "updated_at")
                        };
                        
                        logs.Add(log);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error parsing individual attendance log: {ex.Message}");
                        Console.WriteLine($"Log element: {logElement}");
                        // Continue processing other logs
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error parsing attendance logs array: {ex.Message}");
            }
            
            return logs;
        }

        private List<CurrentSemesterCourseInfo> ParseCourses(JsonElement coursesElement)
        {
            var courses = new List<CurrentSemesterCourseInfo>();
            
            foreach (var courseElement in coursesElement.EnumerateArray())
            {
                var course = new CurrentSemesterCourseInfo
                {
                    AssignedCourseId = GetIntProperty(courseElement, "assigned_course_id"),
                    CourseId = GetIntProperty(courseElement, "course_id"),
                    CourseName = GetStringProperty(courseElement, "course_name"),
                    CourseCode = GetStringProperty(courseElement, "course_code"),
                    AcademicYear = GetStringProperty(courseElement, "academic_year"),
                    Semester = GetStringProperty(courseElement, "semester")
                };
                
                courses.Add(course);
            }
            
            return courses;
        }

        private Dictionary<string, object> ParseAttendanceSummary(JsonElement summaryElement)
        {
            var summary = new Dictionary<string, object>();
            
            try
            {
                foreach (var property in summaryElement.EnumerateObject())
                {
                    try
                    {
                        summary[property.Name] = property.Value.ValueKind switch
                        {
                            JsonValueKind.String => property.Value.GetString() ?? string.Empty,
                            JsonValueKind.Number => property.Value.ValueKind == JsonValueKind.Number ? 
                                (property.Value.TryGetInt32(out int intValue) ? intValue : property.Value.GetDouble()) : 0,
                            JsonValueKind.True => true,
                            JsonValueKind.False => false,
                            JsonValueKind.Null => null,
                            _ => property.Value.ToString()
                        };
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error parsing attendance summary property '{property.Name}': {ex.Message}");
                        Console.WriteLine($"Property value: {property.Value}");
                        Console.WriteLine($"Property type: {property.Value.ValueKind}");
                        
                        // Try to handle as string and parse manually
                        if (property.Value.ValueKind == JsonValueKind.String)
                        {
                            var stringValue = property.Value.GetString();
                            if (int.TryParse(stringValue, out int parsedInt))
                            {
                                summary[property.Name] = parsedInt;
                            }
                            else if (double.TryParse(stringValue, out double parsedDouble))
                            {
                                summary[property.Name] = parsedDouble;
                            }
                            else
                            {
                                summary[property.Name] = stringValue ?? string.Empty;
                            }
                        }
                        else
                        {
                            summary[property.Name] = property.Value.ToString();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error parsing attendance summary: {ex.Message}");
            }
            
            return summary;
        }

        private bool GetBoolProperty(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var property) && 
                   property.ValueKind == JsonValueKind.True;
        }

        private ChartsData GenerateChartsData(List<CurrentSemesterAttendanceRecord> attendanceLogs)
        {
            var chartsData = new ChartsData();

            // Generate weekly data (last 7 days)
            chartsData.WeeklyData = GenerateWeeklyData(attendanceLogs);
            
            // Generate monthly data
            chartsData.MonthlyData = GenerateMonthlyData(attendanceLogs);
            
            // Generate course-wise data
            chartsData.CourseWiseData = GenerateCourseWiseData(attendanceLogs);
            
            // Generate overall statistics
            chartsData.OverallStats = GenerateOverallStats(attendanceLogs);

            return chartsData;
        }

        private List<WeeklyDataPoint> GenerateWeeklyData(List<CurrentSemesterAttendanceRecord> logs)
        {
            var weeklyData = new List<WeeklyDataPoint>();
            
            for (int i = 6; i >= 0; i--)
            {
                var date = DateTime.Now.Date.AddDays(-i);
                var dayLogs = logs.Where(l => DateTime.TryParse(l.AttendanceDate, out var logDate) && 
                                            logDate.Date == date).ToList();
                
                weeklyData.Add(new WeeklyDataPoint
                {
                    Date = date.ToString("ddd"),
                    Present = dayLogs.Count(l => l.Status.Equals("present", StringComparison.OrdinalIgnoreCase)),
                    Late = dayLogs.Count(l => l.Status.Equals("late", StringComparison.OrdinalIgnoreCase)),
                    Absent = dayLogs.Count(l => l.Status.Equals("absent", StringComparison.OrdinalIgnoreCase))
                });
            }
            
            return weeklyData;
        }

        private List<MonthlyDataPoint> GenerateMonthlyData(List<CurrentSemesterAttendanceRecord> logs)
        {
            var monthlyData = new List<MonthlyDataPoint>();
            
            if (logs.Count == 0)
            {
                // Return empty list if no data
                return monthlyData;
            }
            
            var groupedByMonth = logs
                .Where(l => !string.IsNullOrEmpty(l.AttendanceDate) && DateTime.TryParse(l.AttendanceDate, out _))
                .GroupBy(l => 
                {
                    DateTime.TryParse(l.AttendanceDate, out var date);
                    return new { Year = date.Year, Month = date.Month };
                })
                .OrderBy(g => g.Key.Year)
                .ThenBy(g => g.Key.Month);

            foreach (var monthGroup in groupedByMonth)
            {
                var monthLogs = monthGroup.ToList();
                var totalClasses = monthLogs.Count;
                var attendedClasses = monthLogs.Count(l => 
                    l.Status.Equals("present", StringComparison.OrdinalIgnoreCase) || 
                    l.Status.Equals("late", StringComparison.OrdinalIgnoreCase));
                
                var rate = totalClasses > 0 ? (double)attendedClasses / totalClasses * 100 : 0;
                
                monthlyData.Add(new MonthlyDataPoint
                {
                    Month = new DateTime(monthGroup.Key.Year, monthGroup.Key.Month, 1).ToString("MMM yyyy"),
                    AttendanceRate = Math.Round(rate, 1),
                    TotalClasses = totalClasses,
                    AttendedClasses = attendedClasses
                });
            }
            
            return monthlyData;
        }

        private List<CourseWiseDataPoint> GenerateCourseWiseData(List<CurrentSemesterAttendanceRecord> logs)
        {
            var courseData = new List<CourseWiseDataPoint>();
            var groupedByCourse = logs.GroupBy(l => new { l.CourseId, l.CourseName, l.CourseCode });

            foreach (var courseGroup in groupedByCourse)
            {
                var courseLogs = courseGroup.ToList();
                var totalClasses = courseLogs.Count;
                var attendedClasses = courseLogs.Count(l => 
                    l.Status.Equals("present", StringComparison.OrdinalIgnoreCase) || 
                    l.Status.Equals("late", StringComparison.OrdinalIgnoreCase));
                
                var rate = totalClasses > 0 ? (double)attendedClasses / totalClasses * 100 : 0;
                
                courseData.Add(new CourseWiseDataPoint
                {
                    CourseId = courseGroup.Key.CourseId,
                    CourseName = courseGroup.Key.CourseName,
                    CourseCode = courseGroup.Key.CourseCode ?? "N/A",
                    AttendanceRate = Math.Round(rate, 1),
                    TotalClasses = totalClasses,
                    AttendedClasses = attendedClasses,
                    PresentClasses = courseLogs.Count(l => l.Status.Equals("present", StringComparison.OrdinalIgnoreCase)),
                    LateClasses = courseLogs.Count(l => l.Status.Equals("late", StringComparison.OrdinalIgnoreCase)),
                    AbsentClasses = courseLogs.Count(l => l.Status.Equals("absent", StringComparison.OrdinalIgnoreCase))
                });
            }
            
            return courseData.OrderByDescending(c => c.AttendanceRate).ToList();
        }

        private OverallStatsPoint GenerateOverallStats(List<CurrentSemesterAttendanceRecord> logs)
        {
            var totalClasses = logs.Count;
            var presentClasses = logs.Count(l => l.Status.Equals("present", StringComparison.OrdinalIgnoreCase));
            var lateClasses = logs.Count(l => l.Status.Equals("late", StringComparison.OrdinalIgnoreCase));
            var absentClasses = logs.Count(l => l.Status.Equals("absent", StringComparison.OrdinalIgnoreCase));
            
            var attendanceRate = totalClasses > 0 ? (double)(presentClasses + lateClasses) / totalClasses * 100 : 0;
            
            return new OverallStatsPoint
            {
                TotalClasses = totalClasses,
                PresentClasses = presentClasses,
                LateClasses = lateClasses,
                AbsentClasses = absentClasses,
                AttendanceRate = Math.Round(attendanceRate, 1),
                PresentPercentage = totalClasses > 0 ? Math.Round((double)presentClasses / totalClasses * 100, 1) : 0,
                LatePercentage = totalClasses > 0 ? Math.Round((double)lateClasses / totalClasses * 100, 1) : 0,
                AbsentPercentage = totalClasses > 0 ? Math.Round((double)absentClasses / totalClasses * 100, 1) : 0
            };
        }
    }
}
