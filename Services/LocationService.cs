using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public class LocationService : ILocationService
    {
        private readonly HttpClient _httpClient;

        public LocationService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.Timeout = TimeSpan.FromSeconds(5);
        }

        public async Task<string> GetUserLocationAsync(HttpContext httpContext)
        {
            try
            {
                // Priority 1: Check if user has a stored location preference
                var storedLocation = httpContext.Session.GetString("UserLocation");
                if (!string.IsNullOrEmpty(storedLocation))
                {
                    Console.WriteLine($"Using stored user location: {storedLocation}");
                    return storedLocation;
                }

                // Priority 2: Try to get location from IP address
                var ipLocation = await GetLocationFromIPAsync(httpContext);
                if (!string.IsNullOrEmpty(ipLocation))
                {
                    Console.WriteLine($"Using IP-based location: {ipLocation}");
                    return ipLocation;
                }

                // Priority 3: Default to Quezon City for Filipino students
                Console.WriteLine("Using default location: Quezon City");
                return "Quezon City";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user location: {ex.Message}");
                return "Manila, Philippines"; // Safe fallback
            }
        }

        public async Task<string?> GetLocationFromIPAsync(HttpContext httpContext)
        {
            try
            {
                var clientIP = GetClientIPAddress(httpContext);
                
                // Skip local/private IPs
                if (string.IsNullOrEmpty(clientIP) || IsPrivateIP(clientIP))
                {
                    return null;
                }

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

        private static bool IsPrivateIP(string ip)
        {
            return ip == "127.0.0.1" || 
                   ip == "::1" || 
                   ip.StartsWith("192.168.") ||
                   ip.StartsWith("10.") ||
                   ip.StartsWith("172.");
        }
    }
}
