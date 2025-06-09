using Microsoft.AspNetCore.Mvc;

namespace AttendanceApp_ASPNET.Services
{
    public interface IWeatherService
    {
        Task<WeatherData> GetWeatherDataAsync(string location);
        Task<WeatherData> GetWeatherForUserAsync(HttpContext httpContext);
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
        public int? RainChance { get; set; }
    }
}
