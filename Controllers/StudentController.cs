using AttendanceApp_ASPNET.Controllers.Base;
using AttendanceApp_ASPNET.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Controllers
{
    // Student dashboard controller with enhanced security and authentication.
    public class StudentController : StudentBaseController
    {
        private readonly IApiService _apiService;
        
        public StudentController(IApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<IActionResult> Dashboard()
        {
            // All authentication and role checks are handled by StudentBaseController
            // ViewBag data is automatically set by the base controller
            
            var studentInfo = GetCurrentStudentInfo();
            
            // Check onboarding status using JWT token
            var authToken = HttpContext.Session.GetString("AuthToken");
            
            if (!string.IsNullOrEmpty(authToken))
            {
                try
                {
                    var onboardingResult = await _apiService.CheckStudentOnboardingStatusAsync(authToken);
                    var onboardingResponse = JsonSerializer.Deserialize<JsonElement>(onboardingResult);
                    
                    bool isOnboarded = false;
                    bool hasSection = false;
                    string onboardingMessage = "";
                    
                    // Parse onboarding response
                    if (onboardingResponse.TryGetProperty("is_onboarded", out var isOnboardedProp))
                    {
                        isOnboarded = isOnboardedProp.GetBoolean();
                    }
                    
                    if (onboardingResponse.TryGetProperty("has_section", out var hasSectionProp))
                    {
                        hasSection = hasSectionProp.GetBoolean();
                    }
                    
                    if (onboardingResponse.TryGetProperty("message", out var messageProp))
                    {
                        onboardingMessage = messageProp.GetString() ?? "";
                    }
                    
                    // Update student info with latest data from API if available
                    if (onboardingResponse.TryGetProperty("student_info", out var studentInfoProp) && 
                        studentInfoProp.ValueKind != JsonValueKind.Null)
                    {
                        // Update session with latest student info
                        if (studentInfoProp.TryGetProperty("section_id", out var sectionIdProp) && 
                            sectionIdProp.ValueKind != JsonValueKind.Null)
                        {
                            HttpContext.Session.SetString("SectionId", sectionIdProp.ToString());
                        }
                        
                        if (studentInfoProp.TryGetProperty("verified", out var verifiedProp))
                        {
                            HttpContext.Session.SetString("Verified", verifiedProp.ToString());
                        }
                    }
                    
                    // Set onboarding-related ViewBag data
                    ViewBag.IsOnboarded = isOnboarded;
                    ViewBag.HasSection = hasSection;
                    ViewBag.OnboardingMessage = onboardingMessage;
                    
                    // If not onboarded, show modal instead of alert
                    if (!isOnboarded)
                    {
                        ViewBag.ShowOnboardingAlert = true; // This will trigger the modal
                        ViewBag.OnboardingAlertType = hasSection ? "warning" : "info";
                        ViewBag.OnboardingAlertMessage = hasSection ? 
                            "Your section assignment is being processed. Some features may be limited." :
                            "Please complete your account setup to access all features.";
                    }
                    else
                    {
                        ViewBag.ShowOnboardingAlert = false;
                    }
                }
                catch (Exception ex)
                {
                    // Log error but don't block dashboard access
                    Console.WriteLine($"Onboarding status check error for {studentInfo.Email}: {ex.Message}");
                    
                    // Set fallback values
                    ViewBag.IsOnboarded = true; // Assume onboarded if check fails
                    ViewBag.HasSection = false;
                    ViewBag.ShowOnboardingAlert = true;
                    ViewBag.OnboardingAlertType = "warning";
                    ViewBag.OnboardingAlertMessage = "Unable to verify account status. Some features may be limited.";
                }
            }
            else
            {
                // No JWT token available - shouldn't happen if base controller works correctly
                Console.WriteLine($"No JWT token available for onboarding check: {studentInfo.Email}");
                ViewBag.IsOnboarded = false;
                ViewBag.HasSection = false;
                ViewBag.ShowOnboardingAlert = true; // Force show modal for testing
                ViewBag.OnboardingAlertType = "error";
                ViewBag.OnboardingAlertMessage = "Authentication error. Please log out and log back in.";
            }
            
            // Add any dashboard-specific data
            ViewBag.WelcomeMessage = $"Welcome back, {studentInfo.FirstName}!";
            ViewBag.IsNearExpiry = IsSessionNearExpiry();
            
            // Check for any important notifications
            if (!studentInfo.Verified)
            {
                ViewBag.ShowVerificationAlert = true;
            }
            
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

                var result = await _apiService.CompleteStudentOnboardingAsync(onboardingData, jwtToken);
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                bool success = false;
                string message = "Failed to complete onboarding";
                
                if (apiResponse.TryGetProperty("success", out var successProperty))
                {
                    success = successProperty.GetBoolean();
                }
                
                if (apiResponse.TryGetProperty("message", out var messageProperty))
                {
                    message = messageProperty.GetString() ?? message;
                }
                
                return Json(new { 
                    success = success,
                    message = message
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error completing onboarding: {ex.Message}");
                return Json(new { success = false, message = "Unable to complete onboarding setup" });
            }
        }
    }
}
