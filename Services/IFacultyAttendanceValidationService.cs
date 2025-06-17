using AttendanceApp_ASPNET.Models;

namespace AttendanceApp_ASPNET.Services
{
    public interface IFacultyAttendanceValidationService
    {
        Task<FacultyAttendanceValidationResponse> ValidateFacultyAttendanceAsync(int assignedCourseId, string jwtToken);
    }
}
