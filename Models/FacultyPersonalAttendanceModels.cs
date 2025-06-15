using System.Text.Json.Serialization;

namespace AttendanceApp_ASPNET.Models
{
    public class FacultyPersonalAttendanceResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("faculty_info")]
        public FacultyPersonalInfo FacultyInfo { get; set; } = new();

        [JsonPropertyName("attendance_records")]
        public List<FacultyPersonalAttendanceRecord> AttendanceRecords { get; set; } = new();

        [JsonPropertyName("total_records")]
        public int TotalRecords { get; set; }

        [JsonPropertyName("attendance_summary")]
        public FacultyPersonalAttendanceSummary AttendanceSummary { get; set; } = new();

        [JsonPropertyName("course_summary")]
        public FacultyPersonalCourseSummary CourseSummary { get; set; } = new();

        [JsonPropertyName("academic_year_summary")]
        public FacultyPersonalAcademicYearSummary AcademicYearSummary { get; set; } = new();
    }

    public class FacultyPersonalInfo
    {
        [JsonPropertyName("user_id")]
        public int UserId { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("employee_number")]
        public string? EmployeeNumber { get; set; }

        [JsonPropertyName("role")]
        public string Role { get; set; } = string.Empty;
    }

    public class FacultyPersonalAttendanceRecord
    {
        [JsonPropertyName("attendance_id")]
        public int AttendanceId { get; set; }

        [JsonPropertyName("assigned_course_id")]
        public int AssignedCourseId { get; set; }

        [JsonPropertyName("course_id")]
        public int CourseId { get; set; }

        [JsonPropertyName("course_name")]
        public string CourseName { get; set; } = string.Empty;

        [JsonPropertyName("course_code")]
        public string? CourseCode { get; set; }

        [JsonPropertyName("section_name")]
        public string SectionName { get; set; } = string.Empty;

        [JsonPropertyName("program_name")]
        public string ProgramName { get; set; } = string.Empty;

        [JsonPropertyName("program_acronym")]
        public string ProgramAcronym { get; set; } = string.Empty;

        [JsonPropertyName("academic_year")]
        public string? AcademicYear { get; set; }

        [JsonPropertyName("semester")]
        public string? Semester { get; set; }

        [JsonPropertyName("room")]
        public string? Room { get; set; }

        [JsonPropertyName("attendance_date")]
        public string AttendanceDate { get; set; } = string.Empty;

        [JsonPropertyName("attendance_time")]
        public string? AttendanceTime { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("has_image")]
        public bool HasImage { get; set; }

        [JsonPropertyName("created_at")]
        public string CreatedAt { get; set; } = string.Empty;

        [JsonPropertyName("updated_at")]
        public string UpdatedAt { get; set; } = string.Empty;
    }

    public class FacultyPersonalAttendanceSummary
    {
        [JsonPropertyName("total_records")]
        public int TotalRecords { get; set; }

        [JsonPropertyName("present_count")]
        public int PresentCount { get; set; }

        [JsonPropertyName("late_count")]
        public int LateCount { get; set; }

        [JsonPropertyName("absent_count")]
        public int AbsentCount { get; set; }

        [JsonPropertyName("attendance_percentage")]
        public double AttendancePercentage { get; set; }

        [JsonPropertyName("status_distribution")]
        public FacultyPersonalStatusDistribution StatusDistribution { get; set; } = new();
    }

    public class FacultyPersonalStatusDistribution
    {
        [JsonPropertyName("present")]
        public int Present { get; set; }

        [JsonPropertyName("late")]
        public int Late { get; set; }

        [JsonPropertyName("absent")]
        public int Absent { get; set; }
    }

    public class FacultyPersonalCourseSummary
    {
        [JsonPropertyName("total_courses")]
        public int TotalCourses { get; set; }

        [JsonPropertyName("courses")]
        public Dictionary<string, FacultyPersonalCourseStats> Courses { get; set; } = new();
    }

    public class FacultyPersonalCourseStats
    {
        [JsonPropertyName("total_sessions")]
        public int TotalSessions { get; set; }

        [JsonPropertyName("present")]
        public int Present { get; set; }

        [JsonPropertyName("late")]
        public int Late { get; set; }

        [JsonPropertyName("absent")]
        public int Absent { get; set; }

        [JsonPropertyName("course_code")]
        public string? CourseCode { get; set; }

        [JsonPropertyName("academic_year")]
        public string? AcademicYear { get; set; }

        [JsonPropertyName("semester")]
        public string? Semester { get; set; }

        [JsonPropertyName("attendance_percentage")]
        public double AttendancePercentage { get; set; }
    }

    public class FacultyPersonalAcademicYearSummary
    {
        [JsonPropertyName("years")]
        public Dictionary<string, FacultyPersonalYearStats> Years { get; set; } = new();

        [JsonPropertyName("total_years")]
        public int TotalYears { get; set; }
    }

    public class FacultyPersonalYearStats
    {
        [JsonPropertyName("total")]
        public int Total { get; set; }

        [JsonPropertyName("present")]
        public int Present { get; set; }

        [JsonPropertyName("late")]
        public int Late { get; set; }

        [JsonPropertyName("absent")]
        public int Absent { get; set; }

        [JsonPropertyName("attendance_percentage")]
        public double AttendancePercentage { get; set; }
    }
}
