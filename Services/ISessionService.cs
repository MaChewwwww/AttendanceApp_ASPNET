namespace AttendanceApp_ASPNET.Services
{
    public interface ISessionService
    {
        SessionStatusResult CheckSessionStatus(HttpContext httpContext);
        bool IsSessionNearExpiry(HttpContext httpContext);
    }

    public class SessionStatusResult
    {
        public bool IsAuthenticated { get; set; }
        public bool IsValid { get; set; }
        public int HoursRemaining { get; set; }
        public int MinutesRemaining { get; set; }
        public int SecondsRemaining { get; set; }
        public bool IsNearExpiry { get; set; }
    }
}
