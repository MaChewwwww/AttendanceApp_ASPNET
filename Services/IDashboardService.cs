using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public interface IDashboardService
    {
        Task<DashboardDataResult> GetStudentDashboardAsync(string jwtToken);
    }

    public class DashboardDataResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public StudentDashboardData? Data { get; set; }
    }

    public class StudentDashboardData
    {
        public Dictionary<string, object> StudentInfo { get; set; } = new();
        public List<DashboardClassInfo> CurrentClasses { get; set; } = new();
        public List<DashboardScheduleItem> TodaySchedule { get; set; } = new();
        public List<DashboardScheduleItem> AllSchedules { get; set; } = new();
        public int TotalEnrolledCourses { get; set; }
        public int PendingApprovals { get; set; }
        public DashboardScheduleSummary ScheduleSummary { get; set; } = new();
    }

    public class DashboardClassInfo
    {
        public int AssignedCourseId { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string? CourseCode { get; set; }
        public string? CourseDescription { get; set; }
        public string FacultyName { get; set; } = string.Empty;
        public string FacultyEmail { get; set; } = string.Empty;
        public string? AcademicYear { get; set; }
        public string? Semester { get; set; }
        public string? Room { get; set; }
        public string EnrollmentStatus { get; set; } = string.Empty;
    }

    public class DashboardScheduleItem
    {
        public int ScheduleId { get; set; }
        public int AssignedCourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string? CourseCode { get; set; }
        public string FacultyName { get; set; } = string.Empty;
        public string? Room { get; set; }
        public string DayOfWeek { get; set; } = string.Empty;
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public string Status { get; set; } = string.Empty; // "upcoming", "ongoing", "completed"
    }

    public class DashboardScheduleSummary
    {
        public int TotalClassesToday { get; set; }
        public int TotalWeeklySchedules { get; set; }
        public DashboardScheduleItem? CurrentClass { get; set; }
        public DashboardScheduleItem? NextClass { get; set; }
        public string CurrentDay { get; set; } = string.Empty;
    }
}
