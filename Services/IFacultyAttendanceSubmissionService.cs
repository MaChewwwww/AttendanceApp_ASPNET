using AttendanceApp_ASPNET.Models;

namespace AttendanceApp_ASPNET.Services
{
    public interface IFacultyAttendanceSubmissionService
    {
        Task<FacultyAttendanceSubmissionResponse> SubmitFacultyAttendanceAsync(FacultyAttendanceSubmissionRequest request, string jwtToken);
    }
}
