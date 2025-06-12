namespace AttendanceApp_ASPNET.Models
{
    public class FacultyCourse
    {
        public int AssignedCourseId { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public string CourseDescription { get; set; } = string.Empty;
        public int SectionId { get; set; }
        public string SectionName { get; set; } = string.Empty;
        public int ProgramId { get; set; }
        public string ProgramName { get; set; } = string.Empty;
        public string ProgramAcronym { get; set; } = string.Empty;
        public string AcademicYear { get; set; } = string.Empty;
        public string Semester { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public int EnrollmentCount { get; set; }
        public int PendingCount { get; set; }
        public int TotalStudents { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
        public string UpdatedAt { get; set; } = string.Empty;
    }

    public class FacultyCoursesResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public Dictionary<string, object> FacultyInfo { get; set; } = new();
        public List<FacultyCourse> CurrentCourses { get; set; } = new();
        public List<FacultyCourse> PreviousCourses { get; set; } = new();
        public int TotalCurrent { get; set; }
        public int TotalPrevious { get; set; }
        public Dictionary<string, Dictionary<string, int>> SemesterSummary { get; set; } = new();
    }
}
