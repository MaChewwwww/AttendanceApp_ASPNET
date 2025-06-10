using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public class StudentHistoryService : IStudentHistoryService
    {
        private readonly IApiService _apiService;

        public StudentHistoryService(IApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<StudentAttendanceResult> GetStudentAttendanceHistoryAsync(string jwtToken)
        {
            try
            {
                Console.WriteLine("Fetching student attendance history from API...");

                var response = await _apiService.GetStudentAttendanceAsync(jwtToken);
                var apiData = JsonSerializer.Deserialize<JsonElement>(response);
                
                var result = new StudentAttendanceResult
                {
                    Success = apiData.GetProperty("success").GetBoolean(),
                    Message = apiData.GetProperty("message").GetString() ?? "Success",
                    TotalRecords = apiData.GetProperty("total_records").GetInt32(),
                    AttendanceRecords = new List<AttendanceRecord>(),
                    AttendanceSummary = new Dictionary<string, object>(),
                    CourseSummary = new Dictionary<string, object>(),
                    AcademicYearSummary = new Dictionary<string, object>()
                };

                // Parse student info
                if (apiData.TryGetProperty("student_info", out var studentInfo))
                {
                    result.StudentInfo = ParseJsonToDictionary(studentInfo);
                }

                // Parse attendance records
                if (apiData.TryGetProperty("attendance_records", out var records))
                {
                    foreach (var record in records.EnumerateArray())
                    {
                        var attendanceRecord = new AttendanceRecord
                        {
                            AttendanceId = record.GetProperty("attendance_id").GetInt32(),
                            AssignedCourseId = record.GetProperty("assigned_course_id").GetInt32(),
                            CourseId = record.GetProperty("course_id").GetInt32(),
                            CourseName = record.GetProperty("course_name").GetString() ?? "",
                            CourseCode = record.TryGetProperty("course_code", out var cc) ? cc.GetString() : null,
                            FacultyName = record.GetProperty("faculty_name").GetString() ?? "",
                            SectionName = record.GetProperty("section_name").GetString() ?? "",
                            ProgramName = record.GetProperty("program_name").GetString() ?? "",
                            ProgramAcronym = record.GetProperty("program_acronym").GetString() ?? "",
                            AcademicYear = record.TryGetProperty("academic_year", out var ay) ? ay.GetString() : null,
                            Semester = record.TryGetProperty("semester", out var sem) ? sem.GetString() : null,
                            Room = record.TryGetProperty("room", out var room) ? room.GetString() : null,
                            AttendanceDate = record.GetProperty("attendance_date").GetString() ?? "",
                            Status = record.GetProperty("status").GetString() ?? "",
                            HasImage = record.GetProperty("has_image").GetBoolean(),
                            CreatedAt = record.GetProperty("created_at").GetString() ?? "",
                            UpdatedAt = record.GetProperty("updated_at").GetString() ?? ""
                        };
                        result.AttendanceRecords.Add(attendanceRecord);
                    }
                }

                // Parse summaries
                if (apiData.TryGetProperty("attendance_summary", out var attendanceSummary))
                {
                    result.AttendanceSummary = ParseJsonToDictionary(attendanceSummary);
                }

                if (apiData.TryGetProperty("course_summary", out var courseSummary))
                {
                    result.CourseSummary = ParseJsonToDictionary(courseSummary);
                }

                if (apiData.TryGetProperty("academic_year_summary", out var academicYearSummary))
                {
                    result.AcademicYearSummary = ParseJsonToDictionary(academicYearSummary);
                }

                Console.WriteLine($"Successfully parsed {result.AttendanceRecords.Count} attendance records");
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching attendance history: {ex.Message}");
                return new StudentAttendanceResult
                {
                    Success = false,
                    Message = ex.Message.Contains("timeout") || ex.Message.Contains("connect") ? 
                             "Connection timeout - API server may be unavailable" : 
                             "Failed to fetch attendance history"
                };
            }
        }

        private Dictionary<string, object> ParseJsonToDictionary(JsonElement element)
        {
            var result = new Dictionary<string, object>();
            foreach (var prop in element.EnumerateObject())
            {
                result[prop.Name] = prop.Value.ValueKind switch
                {
                    JsonValueKind.String => prop.Value.GetString(),
                    JsonValueKind.Number => prop.Value.TryGetInt32(out var intVal) ? intVal : prop.Value.GetDouble(),
                    JsonValueKind.True => true,
                    JsonValueKind.False => false,
                    JsonValueKind.Object => ParseJsonToDictionary(prop.Value),
                    JsonValueKind.Array => prop.Value.EnumerateArray().Select(x => ParseJsonToDictionary(x)).ToList(),
                    _ => prop.Value.ToString()
                };
            }
            return result;
        }
    }

    // Models for attendance data
    public class AttendanceRecord
    {
        public int AttendanceId { get; set; }
        public int AssignedCourseId { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; } = "";
        public string? CourseCode { get; set; }
        public string FacultyName { get; set; } = "";
        public string SectionName { get; set; } = "";
        public string ProgramName { get; set; } = "";
        public string ProgramAcronym { get; set; } = "";
        public string? AcademicYear { get; set; }
        public string? Semester { get; set; }
        public string? Room { get; set; }
        public string AttendanceDate { get; set; } = "";
        public string Status { get; set; } = "";
        public bool HasImage { get; set; }
        public string CreatedAt { get; set; } = "";
        public string UpdatedAt { get; set; } = "";
    }

    public class StudentAttendanceResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public Dictionary<string, object>? StudentInfo { get; set; }
        public List<AttendanceRecord> AttendanceRecords { get; set; } = new();
        public int TotalRecords { get; set; }
        public Dictionary<string, object> AttendanceSummary { get; set; } = new();
        public Dictionary<string, object> CourseSummary { get; set; } = new();
        public Dictionary<string, object> AcademicYearSummary { get; set; } = new();
    }
}
