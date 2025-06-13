using System.Text.Json.Serialization;

namespace AttendanceApp_ASPNET.Models
{
    public class FacultyCoursesApiResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("current_courses")]
        public List<FacultyCourse>? CurrentCourses { get; set; }

        [JsonPropertyName("previous_courses")]
        public List<FacultyCourse>? PreviousCourses { get; set; }

        [JsonPropertyName("total_current")]
        public int TotalCurrent { get; set; }

        [JsonPropertyName("total_previous")]
        public int TotalPrevious { get; set; }
    }
}
