using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public interface IEnvironmentService
    {
        // Location methods
        Task<string> GetUserLocationAsync(HttpContext httpContext);
        Task<string?> GetLocationFromIPAsync(HttpContext httpContext);
        string GetClientIPAddress(HttpContext httpContext);
        bool SetUserLocation(HttpContext httpContext, string location);
        LocationUpdateResult UpdateUserLocation(HttpContext httpContext, JsonElement locationData);
        
        // Weather methods
        Task<WeatherData> GetWeatherDataAsync(string location);
        Task<WeatherData> GetWeatherForUserAsync(HttpContext httpContext);
        Task SetWeatherViewBagAsync(dynamic controller, HttpContext httpContext);
    }

    public class LocationUpdateResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Location { get; set; }
    }

    public class WeatherData
    {
        public bool IsAvailable { get; set; }
        public string? Error { get; set; }
        public double? Temperature { get; set; }
        public double? HeatIndex { get; set; }
        public string? Condition { get; set; }
        public string? Icon { get; set; }
        public int? Humidity { get; set; }
        public double? WindSpeed { get; set; }
        public double? UVIndex { get; set; }
        public double? Visibility { get; set; }
        public string? Location { get; set; }
        public string? Region { get; set; }
        public string? Country { get; set; }
        public string? LocalTime { get; set; }
        public double? MaxTemperature { get; set; }
        public double? MinTemperature { get; set; }
        public double? AvgTemperature { get; set; }
        public double? MaxFeelsLike { get; set; }
        public int? RainChance { get; set; }
    }
}
