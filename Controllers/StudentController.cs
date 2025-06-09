using AttendanceApp_ASPNET.Controllers.Base;
using AttendanceApp_ASPNET.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Controllers
{
    // Student dashboard controller with enhanced security and authentication.
    public class StudentController : StudentBaseController
    {
        public StudentController(IApiService apiService) : base(apiService)
        {
        }

        public async Task<IActionResult> Dashboard()
        {
            // All authentication, role checks, and onboarding enforcement are handled by StudentBaseController
            // ViewBag data is automatically set by the base controller
            
            var studentInfo = GetCurrentStudentInfo();
            
            // Check if we need to force show onboarding modal
            var forceOnboarding = TempData["ForceOnboarding"]?.ToString() == "true";
            if (forceOnboarding)
            {
                ViewBag.ShowOnboardingAlert = true;
                ViewBag.OnboardingAlertType = "warning";
                ViewBag.OnboardingAlertMessage = "Please complete your account setup to access all features.";
            }
            
            // Add any dashboard-specific data
            ViewBag.WelcomeMessage = $"Welcome back, {studentInfo.FirstName}!";
            ViewBag.IsNearExpiry = IsSessionNearExpiry();
            
            // Check for any important notifications
            if (!studentInfo.Verified)
            {
                ViewBag.ShowVerificationAlert = true;
            }
            
            // Fetch weather data for Quezon City
            await FetchWeatherDataAsync();
            
            return View();
        }

        // Student profile page.
        public IActionResult Profile()
        {
            var studentInfo = GetCurrentStudentInfo();
            return View(studentInfo);
        }

        // Student attendance records.
        public IActionResult Attendance()
        {
            var studentInfo = GetCurrentStudentInfo();
            // Add attendance-specific logic here
            return View();
        }

        // Mark attendance using face recognition.
        public IActionResult MarkAttendance()
        {
            var studentInfo = GetCurrentStudentInfo();
            // Add face recognition attendance logic here
            return View();
        }

        // AJAX endpoint to check session status.
        [HttpGet]
        public IActionResult CheckSessionStatus()
        {
            var sessionExpiry = HttpContext.Session.GetString("SessionExpiry");
            var isAuthenticated = HttpContext.Session.GetString("IsAuthenticated") == "true";
            
            if (DateTime.TryParse(sessionExpiry, out var expiryTime))
            {
                var timeUntilExpiry = expiryTime - DateTime.UtcNow;
                
                return Json(new {
                    isAuthenticated = isAuthenticated,
                    isValid = timeUntilExpiry.TotalSeconds > 0,
                    hoursRemaining = Math.Max(0, (int)timeUntilExpiry.TotalHours),
                    minutesRemaining = Math.Max(0, (int)timeUntilExpiry.TotalMinutes),
                    secondsRemaining = Math.Max(0, (int)timeUntilExpiry.TotalSeconds),
                    isNearExpiry = timeUntilExpiry.TotalHours <= 1
                });
            }

            return Json(new {
                isAuthenticated = isAuthenticated,
                isValid = false,
                hoursRemaining = 0,
                minutesRemaining = 0,
                secondsRemaining = 0,
                isNearExpiry = true
            });
        }

        // Override the base logout to use the secure logout method.
        [HttpPost]
        public override IActionResult SecureLogout()
        {
            return base.SecureLogout();
        }

        // Legacy logout endpoint for backward compatibility.
        [HttpPost]
        public IActionResult Logout()
        {
            try
            {
                // Clear all session data
                HttpContext.Session.Clear();
                
                // Add a small delay to allow animation to complete
                System.Threading.Thread.Sleep(800);
                
                // Redirect to login with logout parameter for animation
                return RedirectToAction("Login", "Auth", new { logout = "true" });
            }
            catch (Exception ex)
            {
                // Log error but still redirect to login
                Console.WriteLine($"Logout error: {ex.Message}");
                return RedirectToAction("Login", "Auth", new { logout = "true" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAvailablePrograms()
        {
            try
            {
                var jwtToken = HttpContext.Session.GetString("AuthToken");
                if (string.IsNullOrEmpty(jwtToken))
                {
                    return Json(new { success = false, message = "Authentication required", programs = new object[0] });
                }

                var result = await _apiService.GetAvailableProgramsAsync(jwtToken);
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                bool success = false;
                object programs = new object[0];
                string message = "Failed to load programs";
                
                // Check if response has "programs" property or if the array is at root level
                JsonElement programsProperty = default;
                
                if (apiResponse.TryGetProperty("programs", out programsProperty))
                {
                    // Programs found in property
                }
                else if (apiResponse.ValueKind == JsonValueKind.Array)
                {
                    // If the root is an array, treat it as the programs list
                    programsProperty = apiResponse;
                }
                
                if (programsProperty.ValueKind == JsonValueKind.Array)
                {
                    var programsList = new List<object>();
                    foreach (var program in programsProperty.EnumerateArray())
                    {
                        var programDict = new Dictionary<string, object>();
                        
                        foreach (var prop in program.EnumerateObject())
                        {
                            programDict[prop.Name] = prop.Value.ValueKind switch
                            {
                                JsonValueKind.String => prop.Value.GetString(),
                                JsonValueKind.Number => prop.Value.GetInt32(),
                                JsonValueKind.True => true,
                                JsonValueKind.False => false,
                                _ => prop.Value.ToString()
                            };
                        }
                        
                        programsList.Add(programDict);
                    }
                    
                    programs = programsList.ToArray();
                    success = true;
                    message = "Programs loaded successfully";
                }
                else if (apiResponse.TryGetProperty("message", out var messageProperty))
                {
                    message = messageProperty.GetString() ?? message;
                }
                
                return Json(new { 
                    success = success,
                    message = message,
                    programs = programs
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching programs: {ex.Message}");
                return Json(new { success = false, message = "Unable to load programs", programs = new object[0] });
            }
        }

        [HttpGet]
        [Route("Student/GetAvailableSections/{id:int}")]
        public async Task<IActionResult> GetAvailableSections(int id)
        {
            try
            {
                var jwtToken = HttpContext.Session.GetString("AuthToken");
                if (string.IsNullOrEmpty(jwtToken))
                {
                    return Json(new { success = false, message = "Authentication required", sections = new object[0] });
                }
                
                // Validate programId
                if (id <= 0)
                {
                    return Json(new { success = false, message = "Invalid program ID", sections = new object[0] });
                }

                var result = await _apiService.GetAvailableSectionsByProgramAsync(id, jwtToken);
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                bool success = false;
                object sections = new object[0];
                string message = "Failed to load sections";
                
                // Check if response has "sections" property or if the array is at root level
                JsonElement sectionsProperty = default;
                
                if (apiResponse.TryGetProperty("sections", out sectionsProperty))
                {
                    // Sections found in property
                }
                else if (apiResponse.ValueKind == JsonValueKind.Array)
                {
                    // If the root is an array, treat it as the sections list
                    sectionsProperty = apiResponse;
                }
                
                if (sectionsProperty.ValueKind == JsonValueKind.Array)
                {
                    var sectionsList = new List<object>();
                    foreach (var section in sectionsProperty.EnumerateArray())
                    {
                        var sectionDict = new Dictionary<string, object>();
                        
                        foreach (var prop in section.EnumerateObject())
                        {
                            sectionDict[prop.Name] = prop.Value.ValueKind switch
                            {
                                JsonValueKind.String => prop.Value.GetString(),
                                JsonValueKind.Number => prop.Value.GetInt32(),
                                JsonValueKind.True => true,
                                JsonValueKind.False => false,
                                _ => prop.Value.ToString()
                            };
                        }
                        
                        sectionsList.Add(sectionDict);
                    }
                    
                    sections = sectionsList.ToArray();
                    success = true;
                    message = "Sections loaded successfully";
                }
                else if (apiResponse.TryGetProperty("message", out var messageProperty))
                {
                    message = messageProperty.GetString() ?? message;
                }
                
                return Json(new { 
                    success = success,
                    message = message,
                    sections = sections
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching sections for program {id}: {ex.Message}");
                return Json(new { success = false, message = "Unable to load sections", sections = new object[0] });
            }
        }

        [HttpGet]
        [Route("Student/GetAvailableCourses/{id:int}")]
        public async Task<IActionResult> GetAvailableCourses(int id)
        {
            try
            {
                var jwtToken = HttpContext.Session.GetString("AuthToken");
                if (string.IsNullOrEmpty(jwtToken))
                {
                    return Json(new { success = false, message = "Authentication required", courses = new object[0] });
                }

                // Validate sectionId
                if (id <= 0)
                {
                    return Json(new { success = false, message = "Invalid section ID", courses = new object[0] });
                }

                var result = await _apiService.GetAvailableCoursesBySectionAsync(id, jwtToken);
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                bool success = false;
                object courses = new object[0];
                string message = "Failed to load courses";
                
                // Check if response has "courses" property or if the array is at root level
                JsonElement coursesProperty = default;
                
                if (apiResponse.TryGetProperty("courses", out coursesProperty))
                {
                    // Courses found in property
                }
                else if (apiResponse.ValueKind == JsonValueKind.Array)
                {
                    // If the root is an array, treat it as the courses list
                    coursesProperty = apiResponse;
                }
                
                if (coursesProperty.ValueKind == JsonValueKind.Array)
                {
                    var coursesList = new List<object>();
                    foreach (var course in coursesProperty.EnumerateArray())
                    {
                        var courseDict = new Dictionary<string, object>();
                        
                        foreach (var prop in course.EnumerateObject())
                        {
                            courseDict[prop.Name] = prop.Value.ValueKind switch
                            {
                                JsonValueKind.String => prop.Value.GetString(),
                                JsonValueKind.Number => prop.Value.GetInt32(),
                                JsonValueKind.True => true,
                                JsonValueKind.False => false,
                                _ => prop.Value.ToString()
                            };
                        }
                        
                        coursesList.Add(courseDict);
                    }
                    
                    courses = coursesList.ToArray();
                    success = true;
                    message = "Courses loaded successfully";
                }
                else if (apiResponse.TryGetProperty("message", out var messageProperty))
                {
                    message = messageProperty.GetString() ?? message;
                }
                
                return Json(new { 
                    success = success,
                    message = message,
                    courses = courses
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching courses for section {id}: {ex.Message}");
                return Json(new { success = false, message = "Unable to load courses", courses = new object[0] });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CompleteOnboarding([FromBody] JsonElement onboardingData)
        {
            try
            {
                var jwtToken = HttpContext.Session.GetString("AuthToken");
                if (string.IsNullOrEmpty(jwtToken))
                {
                    return Json(new { success = false, message = "Authentication required" });
                }

                // Validate that section_id is provided
                if (!onboardingData.TryGetProperty("section_id", out var sectionIdProperty))
                {
                    return Json(new { success = false, message = "Section selection is required" });
                }

                var sectionId = sectionIdProperty.GetInt32();
                if (sectionId <= 0)
                {
                    return Json(new { success = false, message = "Invalid section selection" });
                }

                var result = await _apiService.CompleteStudentOnboardingAsync(onboardingData, jwtToken);
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                bool success = false;
                string message = "Failed to complete onboarding";
                int assignedCoursesCount = 0;
                int approvalRecordsCreated = 0;
                string sectionName = "";
                
                if (apiResponse.TryGetProperty("success", out var successProperty))
                {
                    success = successProperty.GetBoolean();
                }
                
                if (apiResponse.TryGetProperty("message", out var messageProperty))
                {
                    message = messageProperty.GetString() ?? message;
                }
                
                // Extract additional information from the new endpoint response
                if (apiResponse.TryGetProperty("assigned_courses_count", out var coursesCountProperty))
                {
                    assignedCoursesCount = coursesCountProperty.GetInt32();
                }
                
                if (apiResponse.TryGetProperty("approval_records_created", out var approvalsProperty))
                {
                    approvalRecordsCreated = approvalsProperty.GetInt32();
                }
                
                if (apiResponse.TryGetProperty("section_name", out var sectionNameProperty))
                {
                    sectionName = sectionNameProperty.GetString() ?? "";
                }

                // Update session with successful assignment
                if (success)
                {
                    HttpContext.Session.SetString("IsOnboarded", "true");
                    HttpContext.Session.SetString("HasSection", "true");
                    HttpContext.Session.SetString("SectionId", sectionId.ToString());
                    
                    if (!string.IsNullOrEmpty(sectionName))
                    {
                        HttpContext.Session.SetString("SectionName", sectionName);
                    }
                    
                    // Log successful onboarding
                    var userEmail = HttpContext.Session.GetString("UserEmail") ?? "Unknown";
                    Console.WriteLine($"Student onboarding completed: {userEmail} assigned to section {sectionName} ({sectionId}) with {assignedCoursesCount} courses");
                }
                
                return Json(new { 
                    success = success,
                    message = message,
                    assigned_courses_count = assignedCoursesCount,
                    approval_records_created = approvalRecordsCreated,
                    section_name = sectionName,
                    section_id = sectionId
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error completing onboarding: {ex.Message}");
                return Json(new { 
                    success = false, 
                    message = "Unable to complete onboarding setup. Please try again.",
                    error_details = ex.Message // For debugging - remove in production
                });
            }
        }

        private async Task FetchWeatherDataAsync()
        {
            try
            {
                const string apiKey = "87dbe1388ca54392a53202040250906";
                
                // Get location dynamically - priority order:
                // 1. User's stored location preference
                // 2. IP-based location detection
                // 3. Default to Manila, Philippines
                string location = await GetUserLocationAsync();
                
                var apiUrl = $"https://api.weatherapi.com/v1/forecast.json?key={apiKey}&q={location}&days=1&aqi=no&alerts=no";
                
                using var httpClient = new HttpClient();
                httpClient.Timeout = TimeSpan.FromSeconds(10); // Set timeout to avoid hanging
                
                var response = await httpClient.GetAsync(apiUrl);
                
                if (response.IsSuccessStatusCode)
                {
                    var weatherJson = await response.Content.ReadAsStringAsync();
                    var weatherData = JsonSerializer.Deserialize<JsonElement>(weatherJson);
                    
                    // Extract current weather data
                    if (weatherData.TryGetProperty("current", out var current))
                    {
                        // Temperature
                        if (current.TryGetProperty("temp_c", out var tempC))
                        {
                            ViewBag.Temperature = Math.Round(tempC.GetDouble(), 1);
                        }
                        
                        // Feels like temperature (heat index equivalent)
                        if (current.TryGetProperty("feelslike_c", out var feelsLikeC))
                        {
                            ViewBag.HeatIndex = Math.Round(feelsLikeC.GetDouble(), 1);
                        }
                        
                        // Weather condition
                        if (current.TryGetProperty("condition", out var condition))
                        {
                            if (condition.TryGetProperty("text", out var conditionText))
                            {
                                ViewBag.WeatherCondition = conditionText.GetString();
                            }
                            if (condition.TryGetProperty("icon", out var conditionIcon))
                            {
                                ViewBag.WeatherIcon = conditionIcon.GetString();
                            }
                        }
                        
                        // Humidity
                        if (current.TryGetProperty("humidity", out var humidity))
                        {
                            ViewBag.Humidity = humidity.GetInt32();
                        }
                        
                        // Wind speed
                        if (current.TryGetProperty("wind_kph", out var windKph))
                        {
                            ViewBag.WindSpeed = Math.Round(windKph.GetDouble(), 1);
                        }
                        
                        // UV Index
                        if (current.TryGetProperty("uv", out var uv))
                        {
                            ViewBag.UVIndex = Math.Round(uv.GetDouble(), 1);
                        }
                        
                        // Visibility
                        if (current.TryGetProperty("vis_km", out var visKm))
                        {
                            ViewBag.Visibility = Math.Round(visKm.GetDouble(), 1);
                        }
                    }
                    
                    // Extract location data
                    if (weatherData.TryGetProperty("location", out var locationData))
                    {
                        if (locationData.TryGetProperty("name", out var locationName))
                        {
                            ViewBag.WeatherLocation = locationName.GetString();
                        }
                        if (locationData.TryGetProperty("region", out var region))
                        {
                            var regionName = region.GetString();
                            if (!string.IsNullOrEmpty(regionName) && regionName != ViewBag.WeatherLocation?.ToString())
                            {
                                ViewBag.WeatherRegion = regionName;
                                ViewBag.WeatherLocation = $"{ViewBag.WeatherLocation}, {regionName}";
                            }
                        }
                        if (locationData.TryGetProperty("country", out var country))
                        {
                            ViewBag.WeatherCountry = country.GetString();
                        }
                        if (locationData.TryGetProperty("localtime", out var localTime))
                        {
                            ViewBag.WeatherTime = localTime.GetString();
                        }
                    }
                    
                    // Extract today's forecast for min/max temps
                    if (weatherData.TryGetProperty("forecast", out var forecast) &&
                        forecast.TryGetProperty("forecastday", out var forecastDays) &&
                        forecastDays.ValueKind == JsonValueKind.Array)
                    {
                        var todayForecast = forecastDays.EnumerateArray().FirstOrDefault();
                        if (todayForecast.ValueKind != JsonValueKind.Undefined &&
                            todayForecast.TryGetProperty("day", out var day))
                        {
                            if (day.TryGetProperty("maxtemp_c", out var maxTemp))
                            {
                                ViewBag.MaxTemperature = Math.Round(maxTemp.GetDouble(), 1);
                            }
                            if (day.TryGetProperty("mintemp_c", out var minTemp))
                            {
                                ViewBag.MinTemperature = Math.Round(minTemp.GetDouble(), 1);
                            }
                            if (day.TryGetProperty("avgtemp_c", out var avgTemp))
                            {
                                ViewBag.AvgTemperature = Math.Round(avgTemp.GetDouble(), 1);
                            }
                            if (day.TryGetProperty("daily_chance_of_rain", out var rainChance))
                            {
                                ViewBag.RainChance = rainChance.GetInt32();
                            }
                        }
                    }
                    
                    ViewBag.WeatherDataAvailable = true;
                    
                    // Log successful weather fetch
                    Console.WriteLine($"Weather data fetched successfully for {ViewBag.WeatherLocation} - {ViewBag.Temperature}°C (Feels like {ViewBag.HeatIndex}°C)");
                }
                else
                {
                    ViewBag.WeatherDataAvailable = false;
                    ViewBag.WeatherError = $"Weather service returned {response.StatusCode}";
                    ViewBag.WeatherLocation = location; // Still show the location we tried
                    Console.WriteLine($"Weather API error: {response.StatusCode} - {response.ReasonPhrase}");
                }
            }
            catch (HttpRequestException httpEx)
            {
                ViewBag.WeatherDataAvailable = false;
                ViewBag.WeatherError = "Network error fetching weather data";
                Console.WriteLine($"Weather API network error: {httpEx.Message}");
            }
            catch (TaskCanceledException)
            {
                ViewBag.WeatherDataAvailable = false;
                ViewBag.WeatherError = "Weather service timeout";
                Console.WriteLine("Weather API request timed out");
            }
            catch (JsonException jsonEx)
            {
                ViewBag.WeatherDataAvailable = false;
                ViewBag.WeatherError = "Invalid weather data format";
                Console.WriteLine($"Weather API JSON error: {jsonEx.Message}");
            }
            catch (Exception ex)
            {
                ViewBag.WeatherDataAvailable = false;
                ViewBag.WeatherError = "Weather service unavailable";
                Console.WriteLine($"Weather API unexpected error: {ex.Message}");
            }
        }

        private async Task<string> GetUserLocationAsync()
        {
            try
            {
                // Priority 1: Check if user has a stored location preference
                var storedLocation = HttpContext.Session.GetString("UserLocation");
                if (!string.IsNullOrEmpty(storedLocation))
                {
                    Console.WriteLine($"Using stored user location: {storedLocation}");
                    return storedLocation;
                }

                // Priority 2: Try to get location from IP address
                var ipLocation = await GetLocationFromIPAsync();
                if (!string.IsNullOrEmpty(ipLocation))
                {
                    Console.WriteLine($"Using IP-based location: {ipLocation}");
                    return ipLocation;
                }

                // Priority 3: Default to Manila, Philippines for Filipino students
                Console.WriteLine("Using default location: Quezon City");
                return "Quezon City";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user location: {ex.Message}");
                return "Manila, Philippines"; // Safe fallback
            }
        }

        private async Task<string> GetLocationFromIPAsync()
        {
            try
            {
                // Get client IP address
                var clientIP = GetClientIPAddress();
                
                // Skip local/private IPs
                if (string.IsNullOrEmpty(clientIP) || 
                    clientIP == "127.0.0.1" || 
                    clientIP == "::1" || 
                    clientIP.StartsWith("192.168.") ||
                    clientIP.StartsWith("10.") ||
                    clientIP.StartsWith("172."))
                {
                    return null; // Skip IP geolocation for local/private IPs
                }

                // Use a free IP geolocation service
                using var httpClient = new HttpClient();
                httpClient.Timeout = TimeSpan.FromSeconds(5);
                
                // Using ipapi.co (free tier: 1000 requests/day)
                var response = await httpClient.GetAsync($"https://ipapi.co/{clientIP}/json/");
                
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
                            
                            // Store the detected location for future use
                            HttpContext.Session.SetString("UserLocation", location);
                            
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

        private string GetClientIPAddress()
        {
            try
            {
                // Check for forwarded IP first (useful when behind proxy/load balancer)
                var forwardedFor = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
                if (!string.IsNullOrEmpty(forwardedFor))
                {
                    // Take the first IP if there are multiple
                    return forwardedFor.Split(',')[0].Trim();
                }

                // Check for real IP header
                var realIP = HttpContext.Request.Headers["X-Real-IP"].FirstOrDefault();
                if (!string.IsNullOrEmpty(realIP))
                {
                    return realIP;
                }

                // Fall back to connection remote IP
                return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting client IP: {ex.Message}");
                return "";
            }
        }

        // New endpoint to manually set user location
        [HttpPost]
        public IActionResult SetUserLocation([FromBody] JsonElement locationData)
        {
            try
            {
                if (locationData.TryGetProperty("location", out var locationProperty))
                {
                    var location = locationProperty.GetString();
                    if (!string.IsNullOrEmpty(location))
                    {
                        HttpContext.Session.SetString("UserLocation", location);
                        Console.WriteLine($"User location set to: {location}");
                        
                        return Json(new { 
                            success = true, 
                            message = "Location updated successfully",
                            location = location
                        });
                    }
                }
                
                return Json(new { 
                    success = false, 
                    message = "Invalid location data" 
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting user location: {ex.Message}");
                return Json(new { 
                    success = false, 
                    message = "Failed to update location" 
                });
            }
        }
    }
}
