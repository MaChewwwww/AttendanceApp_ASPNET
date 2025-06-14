using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public interface IFacultyAttendanceService
    {
        Task<FacultyAttendanceResult> GetFacultyAttendanceAsync(string jwtToken);
    }

    public class FacultyAttendanceService : IFacultyAttendanceService
    {
        private readonly IApiService _apiService;

        public FacultyAttendanceService(IApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<FacultyAttendanceResult> GetFacultyAttendanceAsync(string jwtToken)
        {
            try
            {
                var response = await _apiService.GetFacultyAttendanceAsync(jwtToken);
                
                if (string.IsNullOrEmpty(response))
                {
                    return new FacultyAttendanceResult
                    {
                        Success = false,
                        Message = "No response from server",
                        AttendanceRecords = new List<FacultyAttendanceRecord>()
                    };
                }

                var jsonDoc = JsonDocument.Parse(response);
                var root = jsonDoc.RootElement;

                var result = new FacultyAttendanceResult
                {
                    Success = root.TryGetProperty("success", out var successProp) ? successProp.GetBoolean() : false,
                    Message = root.TryGetProperty("message", out var msgProp) ? msgProp.GetString() ?? "" : "",
                    AttendanceRecords = new List<FacultyAttendanceRecord>()
                };

                if (root.TryGetProperty("attendance_records", out var recordsProp) && recordsProp.ValueKind == JsonValueKind.Array)
                {
                    foreach (var recordElement in recordsProp.EnumerateArray())
                    {
                        var record = new FacultyAttendanceRecord
                        {
                            AttendanceDate = recordElement.TryGetProperty("attendance_date", out var dateProp) ? dateProp.GetString() ?? "" : "",
                            CourseName = recordElement.TryGetProperty("course_name", out var courseNameProp) ? courseNameProp.GetString() ?? "" : "",
                            CourseCode = recordElement.TryGetProperty("course_code", out var courseCodeProp) ? courseCodeProp.GetString() ?? "" : "",
                            SectionName = recordElement.TryGetProperty("section_name", out var sectionProp) ? sectionProp.GetString() ?? "" : "",
                            StudentName = recordElement.TryGetProperty("student_name", out var studentProp) ? studentProp.GetString() ?? "" : "",
                            StudentNumber = recordElement.TryGetProperty("student_number", out var studentNumProp) ? studentNumProp.GetString() ?? "" : "",
                            Status = recordElement.TryGetProperty("status", out var statusProp) ? statusProp.GetString() ?? "" : "",
                            TimeIn = recordElement.TryGetProperty("time_in", out var timeProp) ? timeProp.GetString() ?? "" : "",
                            AcademicYear = recordElement.TryGetProperty("academic_year", out var yearProp) ? yearProp.GetString() ?? "" : "",
                            Semester = recordElement.TryGetProperty("semester", out var semesterProp) ? semesterProp.GetString() ?? "" : ""
                        };
                        result.AttendanceRecords.Add(record);
                    }
                }

                // Parse faculty info
                if (root.TryGetProperty("faculty_info", out var facultyInfoProp))
                {
                    result.FacultyInfo = new FacultyInfo
                    {
                        FacultyName = facultyInfoProp.TryGetProperty("faculty_name", out var nameProp) ? nameProp.GetString() ?? "" : "",
                        Department = facultyInfoProp.TryGetProperty("department", out var deptProp) ? deptProp.GetString() ?? "" : "",
                        EmployeeNumber = facultyInfoProp.TryGetProperty("employee_number", out var empProp) ? empProp.GetString() ?? "" : ""
                    };
                }

                // Parse statistics
                if (root.TryGetProperty("statistics", out var statsProp))
                {
                    result.Statistics = new FacultyAttendanceStatistics
                    {
                        TotalClassesTaught = statsProp.TryGetProperty("total_classes_taught", out var classesProp) ? classesProp.GetInt32() : 0,
                        TotalStudentsTaught = statsProp.TryGetProperty("total_students_taught", out var studentsProp) ? studentsProp.GetInt32() : 0,
                        AverageAttendanceRate = statsProp.TryGetProperty("average_attendance_rate", out var rateProp) ? rateProp.GetDouble() : 0.0
                    };
                }

                return result;
            }
            catch (Exception ex)
            {
                return new FacultyAttendanceResult
                {
                    Success = false,
                    Message = $"Error processing attendance data: {ex.Message}",
                    AttendanceRecords = new List<FacultyAttendanceRecord>()
                };
            }
        }
    }

    // Data models
    public class FacultyAttendanceResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<FacultyAttendanceRecord> AttendanceRecords { get; set; } = new();
        public FacultyInfo? FacultyInfo { get; set; }
        public FacultyAttendanceStatistics? Statistics { get; set; }
    }

    public class FacultyAttendanceRecord
    {
        public string AttendanceDate { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string SectionName { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string StudentNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string TimeIn { get; set; } = string.Empty;
        public string AcademicYear { get; set; } = string.Empty;
        public string Semester { get; set; } = string.Empty;
    }

    public class FacultyInfo
    {
        public string FacultyName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string EmployeeNumber { get; set; } = string.Empty;
    }

    public class FacultyAttendanceStatistics
    {
        public int TotalClassesTaught { get; set; }
        public int TotalStudentsTaught { get; set; }
        public double AverageAttendanceRate { get; set; }
    }
}
