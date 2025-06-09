using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public class WeatherService : IWeatherService
    {
        private readonly ILocationService _locationService;
        private readonly HttpClient _httpClient;
        private const string ApiKey = "87dbe1388ca54392a53202040250906";

        public WeatherService(ILocationService locationService, HttpClient httpClient)
        {
            _locationService = locationService;
            _httpClient = httpClient;
            _httpClient.Timeout = TimeSpan.FromSeconds(10);
        }

        public async Task<WeatherData> GetWeatherForUserAsync(HttpContext httpContext)
        {
            var location = await _locationService.GetUserLocationAsync(httpContext);
            return await GetWeatherDataAsync(location);
        }

        public async Task<WeatherData> GetWeatherDataAsync(string location)
        {
            try
            {
                var apiUrl = $"https://api.weatherapi.com/v1/forecast.json?key={ApiKey}&q={location}&days=1&aqi=no&alerts=no";
                var response = await _httpClient.GetAsync(apiUrl);
                
                if (response.IsSuccessStatusCode)
                {
                    var weatherJson = await response.Content.ReadAsStringAsync();
                    var weatherData = JsonSerializer.Deserialize<JsonElement>(weatherJson);
                    
                    return ParseWeatherData(weatherData);
                }
                else
                {
                    return new WeatherData 
                    { 
                        IsAvailable = false, 
                        Error = $"Weather service returned {response.StatusCode}",
                        Location = location
                    };
                }
            }
            catch (HttpRequestException)
            {
                return new WeatherData { IsAvailable = false, Error = "Network error fetching weather data" };
            }
            catch (TaskCanceledException)
            {
                return new WeatherData { IsAvailable = false, Error = "Weather service timeout" };
            }
            catch (JsonException)
            {
                return new WeatherData { IsAvailable = false, Error = "Invalid weather data format" };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Weather API unexpected error: {ex.Message}");
                return new WeatherData { IsAvailable = false, Error = "Weather service unavailable" };
            }
        }

        private WeatherData ParseWeatherData(JsonElement weatherData)
        {
            var result = new WeatherData { IsAvailable = true };

            // Extract current weather data
            if (weatherData.TryGetProperty("current", out var current))
            {
                if (current.TryGetProperty("temp_c", out var tempC))
                    result.Temperature = Math.Round(tempC.GetDouble(), 1);
                
                if (current.TryGetProperty("feelslike_c", out var feelsLikeC))
                    result.HeatIndex = Math.Round(feelsLikeC.GetDouble(), 1);
                
                if (current.TryGetProperty("condition", out var condition))
                {
                    if (condition.TryGetProperty("text", out var conditionText))
                        result.Condition = conditionText.GetString();
                    if (condition.TryGetProperty("icon", out var conditionIcon))
                        result.Icon = conditionIcon.GetString();
                }
                
                if (current.TryGetProperty("humidity", out var humidity))
                    result.Humidity = humidity.GetInt32();
                
                if (current.TryGetProperty("wind_kph", out var windKph))
                    result.WindSpeed = Math.Round(windKph.GetDouble(), 1);
                
                if (current.TryGetProperty("uv", out var uv))
                    result.UVIndex = Math.Round(uv.GetDouble(), 1);
                
                if (current.TryGetProperty("vis_km", out var visKm))
                    result.Visibility = Math.Round(visKm.GetDouble(), 1);
            }

            // Extract location data
            if (weatherData.TryGetProperty("location", out var locationData))
            {
                if (locationData.TryGetProperty("name", out var locationName))
                    result.Location = locationName.GetString();
                
                if (locationData.TryGetProperty("region", out var region))
                {
                    var regionName = region.GetString();
                    if (!string.IsNullOrEmpty(regionName) && regionName != result.Location)
                    {
                        result.Region = regionName;
                        result.Location = $"{result.Location}, {regionName}";
                    }
                }
                
                if (locationData.TryGetProperty("country", out var country))
                    result.Country = country.GetString();
                
                if (locationData.TryGetProperty("localtime", out var localTime))
                    result.LocalTime = localTime.GetString();
            }

            // Extract forecast data
            if (weatherData.TryGetProperty("forecast", out var forecast) &&
                forecast.TryGetProperty("forecastday", out var forecastDays) &&
                forecastDays.ValueKind == JsonValueKind.Array)
            {
                var todayForecast = forecastDays.EnumerateArray().FirstOrDefault();
                if (todayForecast.ValueKind != JsonValueKind.Undefined &&
                    todayForecast.TryGetProperty("day", out var day))
                {
                    if (day.TryGetProperty("maxtemp_c", out var maxTemp))
                        result.MaxTemperature = Math.Round(maxTemp.GetDouble(), 1);
                    
                    if (day.TryGetProperty("mintemp_c", out var minTemp))
                        result.MinTemperature = Math.Round(minTemp.GetDouble(), 1);
                    
                    if (day.TryGetProperty("avgtemp_c", out var avgTemp))
                        result.AvgTemperature = Math.Round(avgTemp.GetDouble(), 1);
                    
                    if (day.TryGetProperty("daily_chance_of_rain", out var rainChance))
                        result.RainChance = rainChance.GetInt32();
                }
            }

            return result;
        }
    }
}
