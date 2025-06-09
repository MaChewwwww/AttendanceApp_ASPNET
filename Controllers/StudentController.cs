using AttendanceApp_ASPNET.Controllers.Base;
using AttendanceApp_ASPNET.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Controllers
{
    // Student dashboard controller with enhanced security and authentication.
    public class StudentController : StudentBaseController
    {
        private readonly IWeatherService _weatherService;
        private readonly ILocationService _locationService;
        private readonly ISessionService _sessionService;

        public StudentController(
            IApiService apiService,
            IWeatherService weatherService,
            ILocationService locationService,
            ISessionService sessionService) : base(apiService)
        {
            _weatherService = weatherService;
            _locationService = locationService;
            _sessionService = sessionService;
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
            ViewBag.IsNearExpiry = _sessionService.IsSessionNearExpiry(HttpContext);
            
            // Check for any important notifications
            if (!studentInfo.Verified)
            {
                ViewBag.ShowVerificationAlert = true;
            }
            
            // Fetch weather data
            await SetWeatherDataAsync();
            
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
            var status = _sessionService.CheckSessionStatus(HttpContext);
            return Json(status);
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

        private async Task SetWeatherDataAsync()
        {
            try
            {
                var weatherData = await _weatherService.GetWeatherForUserAsync(HttpContext);
                
                ViewBag.WeatherDataAvailable = weatherData.IsAvailable;
                ViewBag.WeatherError = weatherData.Error;
                ViewBag.Temperature = weatherData.Temperature;
                ViewBag.HeatIndex = weatherData.HeatIndex;
                ViewBag.WeatherCondition = weatherData.Condition;
                ViewBag.WeatherIcon = weatherData.Icon;
                ViewBag.Humidity = weatherData.Humidity;
                ViewBag.WindSpeed = weatherData.WindSpeed;
                ViewBag.UVIndex = weatherData.UVIndex;
                ViewBag.Visibility = weatherData.Visibility;
                ViewBag.WeatherLocation = weatherData.Location;
                ViewBag.WeatherRegion = weatherData.Region;
                ViewBag.WeatherCountry = weatherData.Country;
                ViewBag.WeatherTime = weatherData.LocalTime;
                ViewBag.MaxTemperature = weatherData.MaxTemperature;
                ViewBag.MinTemperature = weatherData.MinTemperature;
                ViewBag.AvgTemperature = weatherData.AvgTemperature;
                ViewBag.RainChance = weatherData.RainChance;
                
                if (weatherData.IsAvailable)
                {
                    Console.WriteLine($"Weather data fetched successfully for {weatherData.Location} - {weatherData.Temperature}°C (Feels like {weatherData.HeatIndex}°C)");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error setting weather data: {ex.Message}");
                ViewBag.WeatherDataAvailable = false;
                ViewBag.WeatherError = "Weather service unavailable";
            }
        }
    }
}
