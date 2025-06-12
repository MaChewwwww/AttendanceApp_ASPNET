using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using AttendanceApp_ASPNET.Services;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Controllers.Base
{
    public abstract class FacultyBaseController : Controller
    {
        protected readonly IApiService _apiService;

        public FacultyBaseController(IApiService apiService)
        {
            _apiService = apiService;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            // 1. Check if user is authenticated
            var isAuthenticated = HttpContext.Session.GetString("IsAuthenticated");
            if (string.IsNullOrEmpty(isAuthenticated) || isAuthenticated != "true")
            {
                LogSecurityEvent("Unauthorized access attempt", "User not authenticated");
                
                var returnUrl = HttpContext.Request.Path + HttpContext.Request.QueryString;
                TempData["ReturnUrl"] = returnUrl;
                TempData["ErrorMessage"] = "Please log in to access the faculty portal.";
                
                context.Result = RedirectToAction("Login", "Auth");
                return;
            }

            // 2. Check if user has faculty role
            var userRole = HttpContext.Session.GetString("UserRole");
            if (string.IsNullOrEmpty(userRole) || 
                !(userRole.Equals("faculty", StringComparison.OrdinalIgnoreCase) || 
                  userRole.Equals("teacher", StringComparison.OrdinalIgnoreCase) || 
                  userRole.Equals("instructor", StringComparison.OrdinalIgnoreCase)))
            {
                LogSecurityEvent("Role-based access violation", $"User with role '{userRole}' attempted to access faculty area");
                
                TempData["ErrorMessage"] = "Access denied. You don't have permission to access the faculty portal.";
                
                if (userRole.Equals("student", StringComparison.OrdinalIgnoreCase))
                {
                    context.Result = RedirectToAction("Dashboard", "Student");
                }
                else if (userRole.Equals("admin", StringComparison.OrdinalIgnoreCase) || 
                         userRole.Equals("administrator", StringComparison.OrdinalIgnoreCase))
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
                    LogSecurityEvent("Session expired", $"User session expired at {expiryTime}");
                    
                    HttpContext.Session.Clear();
                    TempData["ErrorMessage"] = "Your session has expired. Please log in again.";
                    context.Result = RedirectToAction("Login", "Auth");
                    return;
                }
            }

            // 4. Check account verification status
            var verified = HttpContext.Session.GetString("Verified");
            if (verified != "1")
            {
                ViewBag.AccountNotVerified = true;
                ViewBag.VerificationMessage = "Your account is pending verification. Some features may be limited.";
            }

            // 5. Check if trying to access auth pages while authenticated
            var currentController = context.RouteData.Values["controller"]?.ToString();
            var currentAction = context.RouteData.Values["action"]?.ToString();
            
            if (IsAuthenticationPage(currentController, currentAction))
            {
                LogSecurityEvent("Authenticated user accessing auth pages", 
                    $"Faculty member attempted to access {currentController}/{currentAction}");
                
                TempData["InfoMessage"] = "You are already logged in.";
                context.Result = RedirectToAction("Dashboard", "Faculty");
                return;
            }

            // 6. Set common ViewBag data
            SetCommonViewData();

            // 7. Add security headers
            AddSecurityHeaders();

            base.OnActionExecuting(context);
        }

        protected virtual void SetCommonViewData()
        {
            ViewBag.UserEmail = HttpContext.Session.GetString("UserEmail") ?? "";
            ViewBag.FirstName = HttpContext.Session.GetString("FirstName") ?? "";
            ViewBag.LastName = HttpContext.Session.GetString("LastName") ?? "";
            ViewBag.EmployeeNumber = HttpContext.Session.GetString("EmployeeNumber") ?? "";
            ViewBag.Department = HttpContext.Session.GetString("Department") ?? "";
            ViewBag.LoginTime = HttpContext.Session.GetString("LoginTime") ?? "";
            ViewBag.UserRole = HttpContext.Session.GetString("UserRole") ?? "";
            ViewBag.UserId = HttpContext.Session.GetString("UserId") ?? "";
            ViewBag.Verified = HttpContext.Session.GetString("Verified") ?? "";
            ViewBag.LastActivity = HttpContext.Session.GetString("LastActivity") ?? "";
            
            ViewBag.SessionExpiry = HttpContext.Session.GetString("SessionExpiry") ?? "";
            
            if (DateTime.TryParse(ViewBag.SessionExpiry, out DateTime expiryTime))
            {
                var timeUntilExpiry = expiryTime - DateTime.UtcNow;
                ViewBag.HoursUntilExpiry = Math.Max(0, (int)timeUntilExpiry.TotalHours);
                ViewBag.MinutesUntilExpiry = Math.Max(0, (int)timeUntilExpiry.TotalMinutes);
            }
        }

        protected virtual void AddSecurityHeaders()
        {
            HttpContext.Response.Headers.Add("X-Frame-Options", "DENY");
            HttpContext.Response.Headers.Add("X-Content-Type-Options", "nosniff");
            HttpContext.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
            HttpContext.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
            HttpContext.Response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate");
            HttpContext.Response.Headers.Add("Pragma", "no-cache");
            HttpContext.Response.Headers.Add("Expires", "0");
        }

        protected virtual void LogSecurityEvent(string eventType, string details)
        {
            try
            {
                var userEmail = HttpContext?.Session?.GetString("UserEmail") ?? "Anonymous";
                var userAgent = HttpContext?.Request?.Headers["User-Agent"].ToString() ?? "Unknown";
                var ipAddress = HttpContext?.Connection?.RemoteIpAddress?.ToString() ?? "Unknown";
                var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC");
                
                Console.WriteLine($"[FACULTY SECURITY EVENT] {timestamp} | {eventType} | User: {userEmail} | IP: {ipAddress} | Details: {details} | UserAgent: {userAgent}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LOG ERROR] Failed to log faculty security event: {ex.Message}");
            }
        }

        protected void ExtendSession()
        {
            var newExpiry = DateTime.UtcNow.AddMinutes(30);
            HttpContext.Session.SetString("SessionExpiry", newExpiry.ToString("yyyy-MM-dd HH:mm:ss"));
            HttpContext.Session.SetString("LastActivity", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"));
        }

        private bool IsAuthenticationPage(string controller, string action)
        {
            if (string.IsNullOrEmpty(controller)) return false;
            return controller.Equals("Auth", StringComparison.OrdinalIgnoreCase);
        }

        [HttpPost]
        public virtual IActionResult SecureLogout()
        {
            var userEmail = HttpContext.Session.GetString("UserEmail") ?? "Unknown";
            LogSecurityEvent("User logout", $"Faculty {userEmail} logged out");
            
            HttpContext.Session.Clear();
            
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

        protected FacultySessionInfo GetCurrentFacultyInfo()
        {
            return new FacultySessionInfo
            {
                FacultyId = int.Parse(HttpContext.Session.GetString("FacultyId") ?? "0"),
                FirstName = HttpContext.Session.GetString("FirstName") ?? "",
                LastName = HttpContext.Session.GetString("LastName") ?? "",
                Email = HttpContext.Session.GetString("UserEmail") ?? "",
                EmployeeNumber = HttpContext.Session.GetString("EmployeeNumber") ?? "",
                Department = HttpContext.Session.GetString("Department") ?? "",
                Verified = HttpContext.Session.GetString("Verified") == "1",
                IsActive = HttpContext.Session.GetString("IsActive") == "1"
            };
        }

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

    public class FacultySessionInfo
    {
        public int FacultyId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string EmployeeNumber { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public bool Verified { get; set; }
        public bool IsActive { get; set; }
        public string FullName => $"{FirstName} {LastName}";
    }
}