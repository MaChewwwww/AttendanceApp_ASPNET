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

    // Consolidated Faculty Course Details Models
    public class FacultyCourseDetailsResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("course_info")]
        public FacultyCourseInfo? CourseInfo { get; set; }

        [JsonPropertyName("section_info")]
        public FacultySectionInfo? SectionInfo { get; set; }

        [JsonPropertyName("faculty_info")]
        public Dictionary<string, object> FacultyInfo { get; set; } = new();

        [JsonPropertyName("enrolled_students")]
        public List<FacultyCourseStudent> EnrolledStudents { get; set; } = new();

        [JsonPropertyName("pending_students")]
        public List<FacultyCourseStudent> PendingStudents { get; set; } = new();

        [JsonPropertyName("rejected_students")]
        public List<FacultyCourseStudent> RejectedStudents { get; set; } = new();

        [JsonPropertyName("passed_students")]
        public List<FacultyCourseStudent> PassedStudents { get; set; } = new();

        [JsonPropertyName("failed_students")]
        public List<FacultyCourseStudent> FailedStudents { get; set; } = new();

        [JsonPropertyName("enrollment_summary")]
        public FacultyEnrollmentSummary EnrollmentSummary { get; set; } = new();

        [JsonPropertyName("attendance_summary")]
        public FacultyAttendanceSummary AttendanceSummary { get; set; } = new();

        [JsonPropertyName("recent_attendance")]
        public List<Dictionary<string, object>> RecentAttendance { get; set; } = new();

        [JsonPropertyName("academic_year")]
        public string AcademicYear { get; set; } = string.Empty;

        [JsonPropertyName("semester")]
        public string Semester { get; set; } = string.Empty;

        [JsonPropertyName("total_students")]
        public int TotalStudents { get; set; }

        [JsonPropertyName("total_sessions")]
        public int TotalSessions { get; set; }
    }

    public class FacultyCourseInfo
    {
        [JsonPropertyName("assigned_course_id")]
        public int AssignedCourseId { get; set; }

        [JsonPropertyName("course_id")]
        public int CourseId { get; set; }

        [JsonPropertyName("course_name")]
        public string CourseName { get; set; } = string.Empty;

        [JsonPropertyName("course_code")]
        public string? CourseCode { get; set; }

        [JsonPropertyName("course_description")]
        public string? CourseDescription { get; set; }

        [JsonPropertyName("room")]
        public string? Room { get; set; }
    }

    public class FacultySectionInfo
    {
        [JsonPropertyName("section_id")]
        public int SectionId { get; set; }

        [JsonPropertyName("section_name")]
        public string SectionName { get; set; } = string.Empty;

        [JsonPropertyName("program_id")]
        public int ProgramId { get; set; }

        [JsonPropertyName("program_name")]
        public string ProgramName { get; set; } = string.Empty;

        [JsonPropertyName("program_acronym")]
        public string ProgramAcronym { get; set; } = string.Empty;
    }

    public class FacultyCourseStudent
    {
        [JsonPropertyName("student_id")]
        public int StudentId { get; set; }

        [JsonPropertyName("user_id")]
        public int UserId { get; set; }

        [JsonPropertyName("student_number")]
        public string StudentNumber { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("enrollment_status")]
        public string EnrollmentStatus { get; set; } = string.Empty;

        [JsonPropertyName("rejection_reason")]
        public string? RejectionReason { get; set; }

        [JsonPropertyName("enrollment_created_at")]
        public string? EnrollmentCreatedAt { get; set; }

        [JsonPropertyName("enrollment_updated_at")]
        public string? EnrollmentUpdatedAt { get; set; }

        [JsonPropertyName("total_sessions")]
        public int TotalSessions { get; set; }

        [JsonPropertyName("present_count")]
        public int PresentCount { get; set; }

        [JsonPropertyName("absent_count")]
        public int AbsentCount { get; set; }

        [JsonPropertyName("late_count")]
        public int LateCount { get; set; }

        [JsonPropertyName("failed_count")]
        public int FailedCount { get; set; }

        [JsonPropertyName("attendance_percentage")]
        public double AttendancePercentage { get; set; }

        [JsonPropertyName("latest_attendance_date")]
        public string? LatestAttendanceDate { get; set; }

        [JsonPropertyName("latest_attendance_status")]
        public string? LatestAttendanceStatus { get; set; }
    }

    public class FacultyEnrollmentSummary
    {
        [JsonPropertyName("enrolled")]
        public int Enrolled { get; set; }

        [JsonPropertyName("pending")]
        public int Pending { get; set; }

        [JsonPropertyName("rejected")]
        public int Rejected { get; set; }

        [JsonPropertyName("passed")]
        public int Passed { get; set; }

        [JsonPropertyName("failed")]
        public int Failed { get; set; }

        [JsonPropertyName("total")]
        public int Total { get; set; }
    }

    public class FacultyAttendanceSummary
    {
        [JsonPropertyName("total_records")]
        public int TotalRecords { get; set; }

        [JsonPropertyName("total_sessions")]
        public int TotalSessions { get; set; }

        [JsonPropertyName("present_count")]
        public int PresentCount { get; set; }

        [JsonPropertyName("late_count")]
        public int LateCount { get; set; }

        [JsonPropertyName("absent_count")]
        public int AbsentCount { get; set; }

        [JsonPropertyName("overall_attendance_rate")]
        public double OverallAttendanceRate { get; set; }
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
