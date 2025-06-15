using System.Text.Json.Serialization;

namespace AttendanceApp_ASPNET.Models
{
    public class FacultyCourse
    {
        [JsonPropertyName("assigned_course_id")]
        public int AssignedCourseId { get; set; }

        [JsonPropertyName("course_id")]
        public int CourseId { get; set; }

        [JsonPropertyName("course_name")]
        public string CourseName { get; set; } = string.Empty;

        [JsonPropertyName("course_code")]
        public string CourseCode { get; set; } = string.Empty;

        [JsonPropertyName("course_description")]
        public string? CourseDescription { get; set; }

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

        [JsonPropertyName("academic_year")]
        public string AcademicYear { get; set; } = string.Empty;

        [JsonPropertyName("semester")]
        public string Semester { get; set; } = string.Empty;

        [JsonPropertyName("semester_order")]
        public int? SemesterOrder { get; set; }

        [JsonPropertyName("room")]
        public string? Room { get; set; }

        [JsonPropertyName("enrollment_count")]
        public int EnrollmentCount { get; set; }

        [JsonPropertyName("pending_count")]
        public int PendingCount { get; set; }

        [JsonPropertyName("rejected_count")]
        public int RejectedCount { get; set; }

        [JsonPropertyName("passed_count")]
        public int PassedCount { get; set; }

        [JsonPropertyName("failed_count")]
        public int FailedCount { get; set; }

        [JsonPropertyName("total_students")]
        public int TotalStudents { get; set; }

        [JsonPropertyName("created_at")]
        public string? CreatedAt { get; set; }

        [JsonPropertyName("updated_at")]
        public string? UpdatedAt { get; set; }
    }

    public class FacultyCoursesResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("faculty_info")]
        public Dictionary<string, object> FacultyInfo { get; set; } = new();

        [JsonPropertyName("current_courses")]
        public List<FacultyCourse> CurrentCourses { get; set; } = new();

        [JsonPropertyName("previous_courses")]
        public List<FacultyCourse> PreviousCourses { get; set; } = new();

        [JsonPropertyName("total_current")]
        public int TotalCurrent { get; set; }

        [JsonPropertyName("total_previous")]
        public int TotalPrevious { get; set; }

        [JsonPropertyName("semester_summary")]
        public Dictionary<string, SemesterSummary> SemesterSummary { get; set; } = new();
    }

    public class SemesterSummary
    {
        [JsonPropertyName("total_courses")]
        public int TotalCourses { get; set; }

        [JsonPropertyName("total_students")]
        public int TotalStudents { get; set; }

        [JsonPropertyName("academic_year")]
        public string AcademicYear { get; set; } = string.Empty;

        [JsonPropertyName("semester")]
        public string Semester { get; set; } = string.Empty;
    }
}
