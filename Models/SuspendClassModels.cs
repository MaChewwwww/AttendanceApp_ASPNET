using System;

namespace AttendanceApp_ASPNET.Models
{
    public class SuspendClassRequest
    {
        public string? reason { get; set; }
        public string type { get; set; } = ""; // e.g., "holiday", "emergency", "other"
    }

    public class SuspendClassResponse
    {
        public bool success { get; set; }
        public string message { get; set; } = "";
        public int assigned_course_id { get; set; }
        public string date { get; set; } = "";
        public string? reason { get; set; }
        public string type { get; set; } = "";
    }
}
