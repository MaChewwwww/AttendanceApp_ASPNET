using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public interface IDashboardService
    {
        Task<DashboardDataResult> GetStudentDashboardAsync(string jwtToken);
        Task<FacultyDashboardDataResult> GetFacultyDashboardAsync(string jwtToken);
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

    // Faculty Dashboard Models
    public class FacultyDashboardDataResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public FacultyDashboardData? Data { get; set; }
    }

    public class FacultyDashboardData
    {
        public Dictionary<string, object> FacultyInfo { get; set; } = new();
        public List<FacultyCourseInfo> CurrentCourses { get; set; } = new();
        public List<FacultyCourseInfo> PreviousCourses { get; set; } = new();
        public List<FacultyScheduleItem> TodaySchedule { get; set; } = new();
        public List<FacultyScheduleItem> AllSchedules { get; set; } = new();
        public int TotalCurrentCourses { get; set; }
        public int TotalPreviousCourses { get; set; }
        public int TotalPendingApprovals { get; set; }
        public int TodayAttendanceCount { get; set; }
        public List<FacultyRecentAttendance> RecentAttendance { get; set; } = new();
        public FacultyScheduleSummary ScheduleSummary { get; set; } = new();
        public double? AverageAttendance { get; set; } // NEW: average_attendance from API
    }

    public class FacultyCourseInfo
    {
        public int AssignedCourseId { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string? CourseCode { get; set; }
        public string? CourseDescription { get; set; }
        public int SectionId { get; set; }
        public string SectionName { get; set; } = string.Empty;
        public int ProgramId { get; set; }
        public string ProgramName { get; set; } = string.Empty;
        public string ProgramAcronym { get; set; } = string.Empty;
        public string? AcademicYear { get; set; }
        public string? Semester { get; set; }
        public string? Room { get; set; }
        public int TotalStudents { get; set; }
        public int EnrolledStudents { get; set; }
        public int PendingStudents { get; set; }
        public int RejectedStudents { get; set; }
    }

    public class FacultyScheduleItem
    {
        public int ScheduleId { get; set; }
        public int AssignedCourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string? CourseCode { get; set; }
        public string SectionName { get; set; } = string.Empty;
        public string ProgramAcronym { get; set; } = string.Empty;
        public string? Room { get; set; }
        public string DayOfWeek { get; set; } = string.Empty;
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public string Status { get; set; } = string.Empty; // "upcoming", "ongoing", "completed"
        public bool IsToday { get; set; }
    }

    public class FacultyRecentAttendance
    {
        public int AttendanceId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string SectionName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Date { get; set; }
    }

    public class FacultyScheduleSummary
    {
        public int TotalClassesToday { get; set; }
        public int TotalWeeklySchedules { get; set; }
        public FacultyScheduleItem? CurrentClass { get; set; }
        public FacultyScheduleItem? NextClass { get; set; }
        public string CurrentDay { get; set; } = string.Empty;
    }
}
