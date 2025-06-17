using System.Text.Json.Serialization;

namespace AttendanceApp_ASPNET.Models
{
    public class FacultyAttendanceValidationRequest
    {
        [JsonPropertyName("assignedCourseId")]
        public int AssignedCourseId { get; set; }
    }

    public class FacultyAttendanceValidationResponse
    {
        [JsonPropertyName("can_submit")]
        public bool CanSubmit { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("schedule_info")]
        public FacultyScheduleInfo? ScheduleInfo { get; set; }

        [JsonPropertyName("existing_attendance")]
        public FacultyExistingAttendance? ExistingAttendance { get; set; }
    }

    public class FacultyScheduleInfo
    {
        [JsonPropertyName("schedule_id")]
        public int ScheduleId { get; set; }

        [JsonPropertyName("day_of_week")]
        public string DayOfWeek { get; set; } = string.Empty;

        [JsonPropertyName("start_time")]
        public string? StartTime { get; set; }

        [JsonPropertyName("end_time")]
        public string? EndTime { get; set; }

        [JsonPropertyName("course_name")]
        public string CourseName { get; set; } = string.Empty;

        [JsonPropertyName("course_code")]
        public string CourseCode { get; set; } = string.Empty;

        [JsonPropertyName("section_name")]
        public string SectionName { get; set; } = string.Empty;

        [JsonPropertyName("program_name")]
        public string ProgramName { get; set; } = string.Empty;

        [JsonPropertyName("room")]
        public string? Room { get; set; }
    }

    public class FacultyExistingAttendance
    {
        [JsonPropertyName("attendance_id")]
        public int AttendanceId { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; } = string.Empty;

        [JsonPropertyName("submitted_at")]
        public string? SubmittedAt { get; set; }
    }
}
