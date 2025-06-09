namespace AttendanceApp_ASPNET.Services
{
    public interface ILocationService
    {
        Task<string> GetUserLocationAsync(HttpContext httpContext);
        Task<string?> GetLocationFromIPAsync(HttpContext httpContext);
        string GetClientIPAddress(HttpContext httpContext);
        bool SetUserLocation(HttpContext httpContext, string location);
    }
}
