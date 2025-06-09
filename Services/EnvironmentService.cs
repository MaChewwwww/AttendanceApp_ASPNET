using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public class EnvironmentService : IEnvironmentService
    {
        private readonly HttpClient _httpClient;
        private const string WeatherApiKey = "87dbe1388ca54392a53202040250906";

        public EnvironmentService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.Timeout = TimeSpan.FromSeconds(10);
        }

        // Location methods (from LocationService)
        public async Task<string> GetUserLocationAsync(HttpContext httpContext)
        {
            try
            {
                var storedLocation = httpContext.Session.GetString("UserLocation");
                if (!string.IsNullOrEmpty(storedLocation))
                {
                    Console.WriteLine($"Using stored user location: {storedLocation}");
                    return storedLocation;
                }

                var ipLocation = await GetLocationFromIPAsync(httpContext);
                if (!string.IsNullOrEmpty(ipLocation))
                {
                    Console.WriteLine($"Using IP-based location: {ipLocation}");
                    return ipLocation;
                }

                Console.WriteLine("Using default location: Quezon City");
                return "Quezon City";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user location: {ex.Message}");
                return "Manila, Philippines";
            }
        }

        public async Task<string?> GetLocationFromIPAsync(HttpContext httpContext)
        {
            try
            {
                var clientIP = GetClientIPAddress(httpContext);
                
                if (string.IsNullOrEmpty(clientIP) || IsPrivateIP(clientIP))
                {
                    return null;
                }

                _httpClient.Timeout = TimeSpan.FromSeconds(5);
                var response = await _httpClient.GetAsync($"https://ipapi.co/{clientIP}/json/");
                
                if (response.IsSuccessStatusCode)
                {
                    var jsonResponse = await response.Content.ReadAsStringAsync();
                    var locationData = JsonSerializer.Deserialize<JsonElement>(jsonResponse);
                    
                    if (locationData.TryGetProperty("city", out var city) &&
                        locationData.TryGetProperty("country_name", out var country))
                    {
                        var cityName = city.GetString();
                        var countryName = country.GetString();
                        
                        if (!string.IsNullOrEmpty(cityName) && !string.IsNullOrEmpty(countryName))
                        {
                            var location = $"{cityName}, {countryName}";
                            httpContext.Session.SetString("UserLocation", location);
                            return location;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"IP geolocation failed: {ex.Message}");
            }
            
            return null;
        }

        public string GetClientIPAddress(HttpContext httpContext)
        {
            try
            {
                var forwardedFor = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
                if (!string.IsNullOrEmpty(forwardedFor))
                {
                    return forwardedFor.Split(',')[0].Trim();
                }

                var realIP = httpContext.Request.Headers["X-Real-IP"].FirstOrDefault();
                if (!string.IsNullOrEmpty(realIP))
                {
                    return realIP;
                }

                return httpContext.Connection.RemoteIpAddress?.ToString() ?? "";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting client IP: {ex.Message}");
                return "";
            }
        }

        public bool SetUserLocation(HttpContext httpContext, string location)
        {
            try
            {
                if (!string.IsNullOrEmpty(location))
                {
                    httpContext.Session.SetString("UserLocation", location);
                    Console.WriteLine($"User location set to: {location}");
                    return true;
                }
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting user location: {ex.Message}");
                return false;
            }
        }

        public LocationUpdateResult UpdateUserLocation(HttpContext httpContext, JsonElement locationData)
        {
            try
            {
                if (locationData.TryGetProperty("location", out var locationProperty))
                {
                    var location = locationProperty.GetString();
                    if (SetUserLocation(httpContext, location))
                    {
                        return new LocationUpdateResult
                        {
                            Success = true,
                            Message = "Location updated successfully",
                            Location = location
                        };
                    }
                }
                
                return new LocationUpdateResult
                {
                    Success = false,
                    Message = "Invalid location data"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting user location: {ex.Message}");
                return new LocationUpdateResult
                {
                    Success = false,
                    Message = "Failed to update location"
                };
            }
        }

        // Weather methods (from WeatherService)
        public async Task<WeatherData> GetWeatherForUserAsync(HttpContext httpContext)
        {
            var location = await GetUserLocationAsync(httpContext);
            return await GetWeatherDataAsync(location);
        }

        public async Task<WeatherData> GetWeatherDataAsync(string location)
        {
            try
            {
                var apiUrl = $"https://api.weatherapi.com/v1/forecast.json?key={WeatherApiKey}&q={location}&days=1&aqi=no&alerts=no";
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

        public async Task SetWeatherViewBagAsync(dynamic controller, HttpContext httpContext)
        {
            try
            {
                var weatherData = await GetWeatherForUserAsync(httpContext);
                
                controller.ViewBag.WeatherDataAvailable = weatherData.IsAvailable;
                controller.ViewBag.WeatherError = weatherData.Error;
                controller.ViewBag.Temperature = weatherData.Temperature;
                controller.ViewBag.HeatIndex = weatherData.HeatIndex;
                controller.ViewBag.WeatherCondition = weatherData.Condition;
                controller.ViewBag.WeatherIcon = weatherData.Icon;
                controller.ViewBag.Humidity = weatherData.Humidity;
                controller.ViewBag.WindSpeed = weatherData.WindSpeed;
                controller.ViewBag.UVIndex = weatherData.UVIndex;
                controller.ViewBag.Visibility = weatherData.Visibility;
                controller.ViewBag.WeatherLocation = weatherData.Location;
                controller.ViewBag.WeatherRegion = weatherData.Region;
                controller.ViewBag.WeatherCountry = weatherData.Country;
                controller.ViewBag.WeatherTime = weatherData.LocalTime;
                controller.ViewBag.MaxTemperature = weatherData.MaxTemperature;
                controller.ViewBag.MinTemperature = weatherData.MinTemperature;
                controller.ViewBag.AvgTemperature = weatherData.AvgTemperature;
                controller.ViewBag.RainChance = weatherData.RainChance;
                
                if (weatherData.IsAvailable)
                {
                    Console.WriteLine($"Weather data fetched successfully for {weatherData.Location} - {weatherData.Temperature}°C (Feels like {weatherData.HeatIndex}°C)");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting weather data: {ex.Message}");
                controller.ViewBag.WeatherDataAvailable = false;
                controller.ViewBag.WeatherError = "Weather service unavailable";
            }
        }

        // Private helper methods
        private static bool IsPrivateIP(string ip)
        {
            return ip == "127.0.0.1" || 
                   ip == "::1" || 
                   ip.StartsWith("192.168.") ||
                   ip.StartsWith("10.") ||
                   ip.StartsWith("172.");
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
