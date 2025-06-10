namespace AttendanceApp_ASPNET.Services
{
    public interface IStudentHistoryService
    {
        Task<StudentAttendanceResult> GetStudentAttendanceHistoryAsync(string jwtToken);
    }
}
