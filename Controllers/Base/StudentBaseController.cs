using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace AttendanceApp_ASPNET.Controllers.Base
{
    // Base controller for all student-related controllers.
    // Handles authentication, role validation, and security measures.
    public abstract class StudentBaseController : Controller
    {
        // Executes before any action in derived controllers.
        // Validates authentication, role, and session status.
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            // 1. Check if user is authenticated
            var isAuthenticated = HttpContext.Session.GetString("IsAuthenticated");
            if (string.IsNullOrEmpty(isAuthenticated) || isAuthenticated != "true")
            {
                // Log unauthorized access attempt
                LogSecurityEvent("Unauthorized access attempt", "User not authenticated");
                
                // Store the attempted URL for redirect after login
                var returnUrl = HttpContext.Request.Path + HttpContext.Request.QueryString;
                TempData["ReturnUrl"] = returnUrl;
                TempData["ErrorMessage"] = "Please log in to access the student portal.";
                
                context.Result = RedirectToAction("Login", "Auth");
                return;
            }

            // 2. Check if user has student role
            var userRole = HttpContext.Session.GetString("UserRole");
            if (string.IsNullOrEmpty(userRole) || userRole.ToLower() != "student")
            {
                // Log role-based access violation
                LogSecurityEvent("Role-based access violation", $"User with role '{userRole}' attempted to access student area");
                
                TempData["ErrorMessage"] = "Access denied. You don't have permission to access the student portal.";
                
                // Redirect to appropriate dashboard based on role
                if (userRole == "faculty" || userRole == "teacher" || userRole == "instructor")
                {
                    context.Result = RedirectToAction("Dashboard", "Faculty");
                }
                else if (userRole == "admin" || userRole == "administrator")
                {
                    context.Result = RedirectToAction("Dashboard", "Admin");
                }
                else
                {
                    context.Result = RedirectToAction("Login", "Auth");
                }
                return;
            }

            // 3. Check session expiry
            var sessionExpiry = HttpContext.Session.GetString("SessionExpiry");
            if (!string.IsNullOrEmpty(sessionExpiry) && DateTime.TryParse(sessionExpiry, out var expiryTime))
            {
                if (DateTime.UtcNow > expiryTime)
                {
                    // Log session expiry
                    LogSecurityEvent("Session expired", $"User session expired at {expiryTime}");
                    
                    HttpContext.Session.Clear();
                    TempData["ErrorMessage"] = "Your session has expired. Please log in again.";
                    context.Result = RedirectToAction("Login", "Auth");
                    return;
                }
            }

            // 4. Validate account status
            var verified = HttpContext.Session.GetString("Verified");
            var statusId = HttpContext.Session.GetString("StatusId");
            
            if (verified == "0")
            {
                // Account not verified - could redirect to verification page
                ViewBag.AccountNotVerified = true;
                ViewBag.VerificationMessage = "Your account is pending verification. Some features may be limited.";
            }

            // 5. Check if trying to access auth pages while authenticated
            var currentController = context.RouteData.Values["controller"]?.ToString();
            var currentAction = context.RouteData.Values["action"]?.ToString();
            
            if (IsAuthenticationPage(currentController, currentAction))
            {
                // Authenticated student trying to access login/register - redirect to dashboard
                LogSecurityEvent("Authenticated user accessing auth pages", $"Student attempted to access {currentController}/{currentAction}");
                
                TempData["InfoMessage"] = "You are already logged in.";
                context.Result = RedirectToAction("Dashboard", "Student");
                return;
            }

            // 6. Set common ViewBag data for all student pages
            SetCommonViewData();

            // 7. Add security headers
            AddSecurityHeaders();

            base.OnActionExecuting(context);
        }

        // Extends the current session by 30 minutes.
        protected void ExtendSession()
        {
            var newExpiry = DateTime.UtcNow.AddMinutes(30);
            HttpContext.Session.SetString("SessionExpiry", newExpiry.ToString("yyyy-MM-dd HH:mm:ss"));
            
            // Update last activity timestamp
            HttpContext.Session.SetString("LastActivity", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"));
        }

        // Checks if the current request is for authentication pages.
        private bool IsAuthenticationPage(string controller, string action)
        {
            if (string.IsNullOrEmpty(controller)) return false;
            
            // Check for Auth controller - any action should redirect authenticated students
            if (controller.Equals("Auth", StringComparison.OrdinalIgnoreCase))
            {
                return true; // Any Auth controller action should redirect authenticated students
            }
            
            return false;
        }

        // Sets common ViewBag data used across all student pages.
        protected virtual void SetCommonViewData()
        {
            ViewBag.UserEmail = HttpContext.Session.GetString("UserEmail") ?? "";
            ViewBag.FirstName = HttpContext.Session.GetString("FirstName") ?? "";
            ViewBag.LastName = HttpContext.Session.GetString("LastName") ?? "";
            ViewBag.StudentNumber = HttpContext.Session.GetString("StudentNumber") ?? "";
            ViewBag.LoginTime = HttpContext.Session.GetString("LoginTime") ?? "";
            ViewBag.UserRole = HttpContext.Session.GetString("UserRole") ?? "";
            ViewBag.UserId = HttpContext.Session.GetString("UserId") ?? "";
            ViewBag.Verified = HttpContext.Session.GetString("Verified") ?? "";
            ViewBag.StatusId = HttpContext.Session.GetString("StatusId") ?? "";
            ViewBag.LastActivity = HttpContext.Session.GetString("LastActivity") ?? "";
            
            // Session info for frontend
            ViewBag.SessionExpiry = HttpContext.Session.GetString("SessionExpiry") ?? "";
            
            // Calculate time until session expires (in hours for 24-hour session)
            if (DateTime.TryParse(ViewBag.SessionExpiry, out DateTime expiryTime))
            {
                var timeUntilExpiry = expiryTime - DateTime.UtcNow;
                ViewBag.HoursUntilExpiry = Math.Max(0, (int)timeUntilExpiry.TotalHours);
                ViewBag.MinutesUntilExpiry = Math.Max(0, (int)timeUntilExpiry.TotalMinutes);
            }
        }

        // Adds security headers to the response.
        protected virtual void AddSecurityHeaders()
        {
            // Prevent clickjacking
            HttpContext.Response.Headers.Add("X-Frame-Options", "DENY");
            
            // Prevent MIME type sniffing
            HttpContext.Response.Headers.Add("X-Content-Type-Options", "nosniff");
            
            // Enable XSS protection
            HttpContext.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
            
            // Referrer policy
            HttpContext.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
            
            // Cache control for sensitive pages
            HttpContext.Response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate");
            HttpContext.Response.Headers.Add("Pragma", "no-cache");
            HttpContext.Response.Headers.Add("Expires", "0");
        }

        // Logs security-related events for monitoring and auditing.
        protected virtual void LogSecurityEvent(string eventType, string details)
        {
            var userEmail = HttpContext.Session.GetString("UserEmail") ?? "Anonymous";
            var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC");
            
            // Log to console (in production, use proper logging framework)
            Console.WriteLine($"[SECURITY EVENT] {timestamp} | {eventType} | User: {userEmail} | IP: {ipAddress} | Details: {details} | UserAgent: {userAgent}");
            
            // In production, you might want to:
            // - Log to database
            // - Send alerts for critical events
            // - Integrate with SIEM systems
        }

        // Secure logout that clears all session data and logs the event.
        [HttpPost]
        public virtual IActionResult SecureLogout()
        {
            var userEmail = HttpContext.Session.GetString("UserEmail") ?? "Unknown";
            
            // Log logout event
            LogSecurityEvent("User logout", $"Student {userEmail} logged out");
            
            // Clear all session data
            HttpContext.Session.Clear();
            
            // Clear any authentication cookies if they exist
            foreach (var cookie in Request.Cookies.Keys)
            {
                if (cookie.StartsWith("AspNetCore", StringComparison.OrdinalIgnoreCase))
                {
                    Response.Cookies.Delete(cookie);
                }
            }
            
            TempData["SuccessMessage"] = "You have been logged out successfully.";
            return RedirectToAction("Login", "Auth");
        }

        // Gets the current student's session information.
        protected StudentSessionInfo GetCurrentStudentInfo()
        {
            return new StudentSessionInfo
            {
                UserId = HttpContext.Session.GetString("UserId") ?? "",
                Email = HttpContext.Session.GetString("UserEmail") ?? "",
                FirstName = HttpContext.Session.GetString("FirstName") ?? "",
                LastName = HttpContext.Session.GetString("LastName") ?? "",
                StudentNumber = HttpContext.Session.GetString("StudentNumber") ?? "",
                Role = HttpContext.Session.GetString("UserRole") ?? "",
                Verified = HttpContext.Session.GetString("Verified") == "1",
                StatusId = HttpContext.Session.GetString("StatusId") ?? "",
                LoginTime = DateTime.TryParse(HttpContext.Session.GetString("LoginTime"), out var login) ? login : DateTime.MinValue,
                SessionExpiry = DateTime.TryParse(HttpContext.Session.GetString("SessionExpiry"), out var expiry) ? expiry : DateTime.MinValue
            };
        }

        // Checks if the current session is about to expire (within 1 hour).
        protected bool IsSessionNearExpiry()
        {
            var sessionExpiry = HttpContext.Session.GetString("SessionExpiry");
            if (DateTime.TryParse(sessionExpiry, out var expiryTime))
            {
                var timeUntilExpiry = expiryTime - DateTime.UtcNow;
                return timeUntilExpiry.TotalHours <= 1;
            }
            return false;
        }
    }

    // Data model for current student session information.
    public class StudentSessionInfo
    {
        public string UserId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string StudentNumber { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool Verified { get; set; }
        public string StatusId { get; set; } = string.Empty;
        public DateTime LoginTime { get; set; }
        public DateTime SessionExpiry { get; set; }
        
        public string FullName => $"{FirstName} {LastName}".Trim();
        public bool IsSessionValid => SessionExpiry > DateTime.UtcNow;
        public TimeSpan TimeUntilExpiry => SessionExpiry - DateTime.UtcNow;
    }
}
