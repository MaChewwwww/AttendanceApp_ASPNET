namespace AttendanceApp_ASPNET.Services
{
    public class SessionService : ISessionService
    {
        public SessionStatusResult CheckSessionStatus(HttpContext httpContext)
        {
            var sessionExpiry = httpContext.Session.GetString("SessionExpiry");
            var isAuthenticated = httpContext.Session.GetString("IsAuthenticated") == "true";
            
            if (DateTime.TryParse(sessionExpiry, out var expiryTime))
            {
                var timeUntilExpiry = expiryTime - DateTime.UtcNow;
                
                return new SessionStatusResult
                {
                    IsAuthenticated = isAuthenticated,
                    IsValid = timeUntilExpiry.TotalSeconds > 0,
                    HoursRemaining = Math.Max(0, (int)timeUntilExpiry.TotalHours),
                    MinutesRemaining = Math.Max(0, (int)timeUntilExpiry.TotalMinutes),
                    SecondsRemaining = Math.Max(0, (int)timeUntilExpiry.TotalSeconds),
                    IsNearExpiry = timeUntilExpiry.TotalHours <= 1
                };
            }

            return new SessionStatusResult
            {
                IsAuthenticated = isAuthenticated,
                IsValid = false,
                HoursRemaining = 0,
                MinutesRemaining = 0,
                SecondsRemaining = 0,
                IsNearExpiry = true
            };
        }

        public bool IsSessionNearExpiry(HttpContext httpContext)
        {
            var status = CheckSessionStatus(httpContext);
            return status.IsNearExpiry;
        }
    }
}
