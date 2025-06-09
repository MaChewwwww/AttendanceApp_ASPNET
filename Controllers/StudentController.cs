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
                        
                        // Add debugging
                        Console.WriteLine($"Student {studentInfo.Email} - Setting ShowOnboardingAlert to true");
                        Console.WriteLine($"IsOnboarded: {isOnboarded}, HasSection: {hasSection}");
                    }
                    else
                    {
                        ViewBag.ShowOnboardingAlert = false;
                        Console.WriteLine($"Student {studentInfo.Email} onboarding check: Complete");
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
                
                Console.WriteLine("Setting ShowOnboardingAlert to true due to missing JWT token");
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
    }
}
