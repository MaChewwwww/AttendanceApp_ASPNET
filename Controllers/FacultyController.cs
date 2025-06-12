using Microsoft.AspNetCore.Mvc;
using AttendanceApp_ASPNET.Controllers.Base;
using AttendanceApp_ASPNET.Services;

namespace AttendanceApp_ASPNET.Controllers
{
    public class FacultyController : FacultyBaseController
    {
        public FacultyController(IApiService apiService) : base(apiService)
        {
        }
        public IActionResult Dashboard()
        {
            // Check if user is authenticated
            var isAuthenticated = HttpContext.Session.GetString("IsAuthenticated");

            if (string.IsNullOrEmpty(isAuthenticated) || isAuthenticated != "true")
            {
                TempData["ErrorMessage"] = "Please log in to access the faculty dashboard.";
                return RedirectToAction("Login", "Auth");
            }

            // Check if user has faculty role
            var userRole = HttpContext.Session.GetString("UserRole");
            if (string.IsNullOrEmpty(userRole) ||
                (userRole.ToLower() != "faculty" && userRole.ToLower() != "teacher" && userRole.ToLower() != "instructor"))
            {
                TempData["ErrorMessage"] = "Access denied. You don't have permission to access the faculty dashboard.";

                if (userRole == "student")
                {
                    return RedirectToAction("Dashboard", "Student");
                }
                else if (userRole == "admin" || userRole == "administrator")
                {
                    return RedirectToAction("Dashboard", "Admin");
                }
                else
                {
                    return RedirectToAction("Login", "Auth");
                }
            }

            // Check session expiry
            var sessionExpiry = HttpContext.Session.GetString("SessionExpiry");
            if (!string.IsNullOrEmpty(sessionExpiry) && DateTime.TryParse(sessionExpiry, out var expiryTime))
            {
                if (DateTime.UtcNow > expiryTime)
                {
                    HttpContext.Session.Clear();
                    TempData["ErrorMessage"] = "Your session has expired. Please log in again.";
                    return RedirectToAction("Login", "Auth");
                }
            }

            // Get user information from session
            ViewBag.UserEmail = HttpContext.Session.GetString("UserEmail") ?? "";
            ViewBag.FirstName = HttpContext.Session.GetString("FirstName") ?? "";
            ViewBag.LastName = HttpContext.Session.GetString("LastName") ?? "";
            ViewBag.EmployeeNumber = HttpContext.Session.GetString("EmployeeNumber") ?? "";
            ViewBag.Department = HttpContext.Session.GetString("Department") ?? "";
            ViewBag.LoginTime = HttpContext.Session.GetString("LoginTime") ?? "";
            ViewBag.UserRole = userRole;
            ViewBag.UserId = HttpContext.Session.GetString("UserId") ?? "";
            ViewBag.Verified = HttpContext.Session.GetString("Verified") ?? "";

            return View();
        }
        
        [HttpPost]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            TempData["SuccessMessage"] = "You have been logged out successfully.";
            return RedirectToAction("Login", "Auth");
        }
    }
}
