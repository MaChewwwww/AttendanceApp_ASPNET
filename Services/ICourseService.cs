namespace AttendanceApp_ASPNET.Services
{
    public interface ICourseService
    {
        Task<CourseDataResult> GetStudentCoursesAsync(string jwtToken);
        Task<CourseDetailsResult> GetCourseDetailsAsync(int courseId, string jwtToken);
    }

    public class CourseDataResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public StudentInfo? StudentInfo { get; set; }
        public List<CourseInfo> CurrentCourses { get; set; } = new();
        public List<CourseInfo> PreviousCourses { get; set; } = new();
        public int TotalCurrent { get; set; }
        public int TotalPrevious { get; set; }
        public Dictionary<string, int> EnrollmentSummary { get; set; } = new();
    }

    public class CourseDetailsResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public CourseInfo? Course { get; set; }
    }

    public class StudentInfo
    {
        public int UserId { get; set; }
        public int StudentId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string StudentNumber { get; set; } = string.Empty;
        public int? CurrentSectionId { get; set; }
        public bool HasSection { get; set; }
    }

    public class CourseInfo
    {
        public int AssignedCourseId { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string CourseDescription { get; set; } = string.Empty;
        public int FacultyId { get; set; }
        public string FacultyName { get; set; } = string.Empty;
        public string FacultyEmail { get; set; } = string.Empty;
        public int SectionId { get; set; }
        public string SectionName { get; set; } = string.Empty;
        public int ProgramId { get; set; }
        public string ProgramName { get; set; } = string.Empty;
        public string ProgramAcronym { get; set; } = string.Empty;
        public string AcademicYear { get; set; } = string.Empty;
        public string Semester { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public string EnrollmentStatus { get; set; } = string.Empty;
        public string? RejectionReason { get; set; }
        public string CourseType { get; set; } = string.Empty;
        public string? CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }
    }
}
