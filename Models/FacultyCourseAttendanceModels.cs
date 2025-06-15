using System.Text.Json.Serialization;

namespace AttendanceApp_ASPNET.Models
{
    public class FacultyCourseAttendanceInfo
    {
        [JsonPropertyName("attendance_id")]
        public int AttendanceId { get; set; }
        
        [JsonPropertyName("student_id")]
        public int StudentId { get; set; }
        
        [JsonPropertyName("user_id")]
        public int UserId { get; set; }
        
        [JsonPropertyName("student_number")]
        public string StudentNumber { get; set; } = string.Empty;
        
        [JsonPropertyName("student_name")]
        public string StudentName { get; set; } = string.Empty;
        
        [JsonPropertyName("student_email")]
        public string StudentEmail { get; set; } = string.Empty;
        
        [JsonPropertyName("attendance_date")]
        public string AttendanceDate { get; set; } = string.Empty;
        
        [JsonPropertyName("attendance_time")]
        public string? AttendanceTime { get; set; }
        
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;
        
        [JsonPropertyName("has_image")]
        public bool HasImage { get; set; }
        
        [JsonPropertyName("enrollment_status")]
        public string EnrollmentStatus { get; set; } = string.Empty;
        
        [JsonPropertyName("created_at")]
        public string CreatedAt { get; set; } = string.Empty;
        
        [JsonPropertyName("updated_at")]
        public string UpdatedAt { get; set; } = string.Empty;

        // Add debugging method to help trace data issues
        public override string ToString()
        {
            return $"AttendanceId: {AttendanceId}, StudentId: {StudentId}, StudentName: {StudentName}, Status: {Status}, Date: {AttendanceDate}";
        }
    }

    public class FacultyCourseAttendanceResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }
        
        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;
        
        [JsonPropertyName("course_info")]
        public Dictionary<string, object> CourseInfo { get; set; } = new();
        
        [JsonPropertyName("section_info")]
        public Dictionary<string, object> SectionInfo { get; set; } = new();
        
        [JsonPropertyName("faculty_info")]
        public Dictionary<string, object> FacultyInfo { get; set; } = new();
        
        [JsonPropertyName("attendance_records")]
        public List<FacultyCourseAttendanceInfo> AttendanceRecords { get; set; } = new();
        
        [JsonPropertyName("total_records")]
        public int TotalRecords { get; set; }
        
        [JsonPropertyName("attendance_summary")]
        public Dictionary<string, object> AttendanceSummary { get; set; } = new();
        
        [JsonPropertyName("academic_year")]
        public string? AcademicYear { get; set; }
        
        [JsonPropertyName("semester")]
        public string? Semester { get; set; }
        
        [JsonPropertyName("is_current_course")]
        public bool IsCurrentCourse { get; set; }
        
        [JsonPropertyName("available_filters")]
        public Dictionary<string, List<string>> AvailableFilters { get; set; } = new();
    }

    public class FacultyCourseDetailsResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }
        
        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;
        
        [JsonPropertyName("course_info")]
        public Dictionary<string, object> CourseInfo { get; set; } = new();
        
        [JsonPropertyName("section_info")]
        public Dictionary<string, object> SectionInfo { get; set; } = new();
        
        [JsonPropertyName("faculty_info")]
        public Dictionary<string, object> FacultyInfo { get; set; } = new();
        
        [JsonPropertyName("enrolled_students")]
        public List<object> EnrolledStudents { get; set; } = new();
        
        [JsonPropertyName("pending_students")]
        public List<object> PendingStudents { get; set; } = new();
        
        [JsonPropertyName("rejected_students")]
        public List<object> RejectedStudents { get; set; } = new();
        
        [JsonPropertyName("enrollment_summary")]
        public Dictionary<string, object> EnrollmentSummary { get; set; } = new();
        
        [JsonPropertyName("attendance_summary")]
        public Dictionary<string, object> AttendanceSummary { get; set; } = new();
        
        [JsonPropertyName("recent_attendance")]
        public List<object> RecentAttendance { get; set; } = new();
        
        [JsonPropertyName("academic_year")]
        public string AcademicYear { get; set; } = string.Empty;
        
        [JsonPropertyName("semester")]
        public string Semester { get; set; } = string.Empty;
        
        [JsonPropertyName("total_students")]
        public int TotalStudents { get; set; }
        
        [JsonPropertyName("total_sessions")]
        public int TotalSessions { get; set; }
    }

    public class UpdateAttendanceStatusResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }
        
        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;
        
        [JsonPropertyName("updated_record")]
        public FacultyCourseAttendanceInfo? UpdatedRecord { get; set; }
    }

    public class UpdateAttendanceStatusRequest
    {
        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;
    }
}
