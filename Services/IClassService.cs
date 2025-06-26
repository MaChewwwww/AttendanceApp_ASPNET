using AttendanceApp_ASPNET.Models;

namespace AttendanceApp_ASPNET.Services
{
    public interface IClassService
    {
        Task<FacultyCoursesResponse> GetFacultyCoursesAsync(string jwtToken);
        Task<FacultyCourseDetailsResponse> GetFacultyCourseDetailsAsync(int assignedCourseId, string jwtToken);
        Task<object> UpdateStudentStatusAsync(int assignedCourseId, int studentId, string status, string rejectionReason, string jwtToken);
        Task<FacultyCourseAttendanceResponse> GetCourseAttendanceAsync(int assignedCourseId, string academicYear, int? month, int? day, string jwtToken);
        Task<UpdateAttendanceStatusResponse> UpdateAttendanceStatusAsync(int assignedCourseId, int attendanceId, string status, string jwtToken);
        Task<SuspendClassResponse> SuspendClassTodayAsync(int assignedCourseId, SuspendClassRequest request, string jwtToken);
    }
}
