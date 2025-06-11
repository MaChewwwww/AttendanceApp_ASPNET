using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public interface IAttendanceService
    {
        Task<CurrentSemesterAttendanceResult> GetCurrentSemesterAttendanceAsync(string jwtToken);
        Task<AttendanceRateResult> CalculateAttendanceRateAsync(string jwtToken);
        Task<AttendanceChartsResult> GetAttendanceChartsDataAsync(string jwtToken);
    }

    public class CurrentSemesterAttendanceResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public Dictionary<string, object> StudentInfo { get; set; } = new();
        public List<CurrentSemesterAttendanceRecord> AttendanceLogs { get; set; } = new();
        public int TotalLogs { get; set; }
        public List<CurrentSemesterCourseInfo> Courses { get; set; } = new();
        public string? AcademicYear { get; set; }
        public string? Semester { get; set; }
        public Dictionary<string, object> AttendanceSummary { get; set; } = new();
    }

    public class CurrentSemesterAttendanceRecord
    {
        public int AttendanceId { get; set; }
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
        public string? AttendanceDate { get; set; }
        public string Status { get; set; } = string.Empty; // "present", "absent", "late"
        public bool HasImage { get; set; }
        public string? CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }
    }

    public class CurrentSemesterCourseInfo
    {
        public int AssignedCourseId { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string? CourseCode { get; set; }
        public string? AcademicYear { get; set; }
        public string? Semester { get; set; }
    }

    public class AttendanceRateResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public double AttendanceRate { get; set; }
        public int TotalClasses { get; set; }
        public int PresentClasses { get; set; }
        public int AbsentClasses { get; set; }
        public int LateClasses { get; set; }
        public string? AcademicYear { get; set; }
        public string? Semester { get; set; }
    }

    public class AttendanceChartsResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<WeeklyDataPoint> WeeklyData { get; set; } = new();
        public List<MonthlyDataPoint> MonthlyData { get; set; } = new();
        public List<CourseWiseDataPoint> CourseWiseData { get; set; } = new();
        public OverallStatsPoint OverallStats { get; set; } = new();
    }

    public class ChartsData
    {
        public List<WeeklyDataPoint> WeeklyData { get; set; } = new();
        public List<MonthlyDataPoint> MonthlyData { get; set; } = new();
        public List<CourseWiseDataPoint> CourseWiseData { get; set; } = new();
        public OverallStatsPoint OverallStats { get; set; } = new();
    }

    public class WeeklyDataPoint
    {
        public string Date { get; set; } = string.Empty;
        public int Present { get; set; }
        public int Late { get; set; }
        public int Absent { get; set; }
    }

    public class MonthlyDataPoint
    {
        public string Month { get; set; } = string.Empty;
        public double AttendanceRate { get; set; }
        public int TotalClasses { get; set; }
        public int AttendedClasses { get; set; }
    }

    public class CourseWiseDataPoint
    {
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public double AttendanceRate { get; set; }
        public int TotalClasses { get; set; }
        public int AttendedClasses { get; set; }
        public int PresentClasses { get; set; }
        public int LateClasses { get; set; }
        public int AbsentClasses { get; set; }
    }

    public class OverallStatsPoint
    {
        public int TotalClasses { get; set; }
        public int PresentClasses { get; set; }
        public int LateClasses { get; set; }
        public int AbsentClasses { get; set; }
        public double AttendanceRate { get; set; }
        public double PresentPercentage { get; set; }
        public double LatePercentage { get; set; }
        public double AbsentPercentage { get; set; }
    }
}
