using AttendanceApp_ASPNET.Models;

namespace AttendanceApp_ASPNET.Services
{
    public interface IClassService
    {
        Task<FacultyCoursesResponse> GetFacultyCoursesAsync(string jwtToken);
        Task<object> GetFacultyCourseDetailsAsync(int assignedCourseId, string jwtToken);
        Task<object> UpdateStudentStatusAsync(int assignedCourseId, int studentId, string status, string rejectionReason, string jwtToken);
    }
}
