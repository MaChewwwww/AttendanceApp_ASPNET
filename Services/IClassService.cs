using AttendanceApp_ASPNET.Models;

namespace AttendanceApp_ASPNET.Services
{
    public interface IClassService
    {
        Task<FacultyCoursesResponse> GetFacultyCoursesAsync(string jwtToken);
        Task<FacultyCourse> GetCourseDetailsAsync(int assignedCourseId, string jwtToken);
        Task<bool> UpdateCourseDetailsAsync(int assignedCourseId, object updateData, string jwtToken);
        Task<bool> DeleteCourseAsync(int assignedCourseId, string jwtToken);
        Task<object> GetFacultyCourseDetailsAsync(int assignedCourseId, string jwtToken);
    }
}
