using System.Text.Json.Serialization;

namespace AttendanceApp_ASPNET.Models
{
    public class FacultyAttendanceSubmissionRequest
    {
        [JsonPropertyName("assignedCourseId")]
        public int AssignedCourseId { get; set; }

        [JsonPropertyName("faceImage")]
        public string FaceImage { get; set; } = string.Empty;

        [JsonPropertyName("latitude")]
        public double? Latitude { get; set; }

        [JsonPropertyName("longitude")]
        public double? Longitude { get; set; }
    }

    public class FacultyAttendanceSubmissionResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("attendance_id")]
        public int? AttendanceId { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }

        [JsonPropertyName("submitted_at")]
        public string? SubmittedAt { get; set; }

        [JsonPropertyName("course_info")]
        public Dictionary<string, object>? CourseInfo { get; set; }
    }
}
