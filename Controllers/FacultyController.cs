using Microsoft.AspNetCore.Mvc;
using AttendanceApp_ASPNET.Controllers.Base;
using AttendanceApp_ASPNET.Services;
using AttendanceApp_ASPNET.Models;  // Add this line

namespace AttendanceApp_ASPNET.Controllers
{
    public class FacultyController : FacultyBaseController
    {
        private readonly IClassService _classService;

        public FacultyController(IApiService apiService, IClassService classService) 
            : base(apiService)
        {
            _classService = classService;
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

        public async Task<IActionResult> Classes()
        {
            try
            {
                // Perform base class authorization check but handle the response
                var faculty = GetCurrentFacultyInfo();
                if (faculty == null || string.IsNullOrEmpty(faculty.Email))
                {
                    TempData["ErrorMessage"] = "Please log in to access the faculty portal.";
                    return RedirectToAction("Login", "Auth");
                }

                if (!faculty.Verified)
                {
                    TempData["WarningMessage"] = "Your account needs to be verified to access all features.";
                }

                // Get JWT token from session with debug logging
                var jwtToken = HttpContext.Session.GetString("AuthToken");
                
                Console.WriteLine($"=== JWT TOKEN DEBUG ===");
                Console.WriteLine($"JWT Token found: {!string.IsNullOrEmpty(jwtToken)}");
                Console.WriteLine($"Session keys present: {string.Join(", ", HttpContext.Session.Keys)}");
                Console.WriteLine($"Token value: {(string.IsNullOrEmpty(jwtToken) ? "null" : "present")}");
                Console.WriteLine($"Faculty Info: {faculty.Email} - {faculty.FullName}");
                Console.WriteLine($"====================");

                if (string.IsNullOrEmpty(jwtToken))
                {
                    TempData["ErrorMessage"] = "Authentication token not found. Please login again.";
                    return RedirectToAction("Login", "Auth");
                }

                // Extend session before making API call
                ExtendSession();

                // Fetch faculty courses with the auth token
                var coursesResponse = await _classService.GetFacultyCoursesAsync(jwtToken);
                
                // Log API response for debugging
                Console.WriteLine($"=== API RESPONSE DEBUG ===");
                Console.WriteLine($"API call success: {coursesResponse.Success}");
                Console.WriteLine($"Courses count: {coursesResponse.CurrentCourses?.Count ?? 0}");
                Console.WriteLine($"======================");
                
                // Pass data to view
                return View(coursesResponse);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== ERROR DEBUG ===");
                Console.WriteLine($"Error type: {ex.GetType().Name}");
                Console.WriteLine($"Error message: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                Console.WriteLine($"=================");

                TempData["ErrorMessage"] = "Failed to load courses. Please try again later.";
                return View(new FacultyCoursesResponse 
                { 
                    Success = false,
                    Message = "An error occurred while fetching courses.",
                    CurrentCourses = new List<FacultyCourse>()
                });
            }
        }

        public IActionResult Attendance()
        {
            // Call base class authorization checks
            var faculty = GetCurrentFacultyInfo();
            
            if (!faculty.Verified)
            {
                TempData["WarningMessage"] = "Your account needs to be verified to access all features.";
            }
            
            // Extend session
            ExtendSession();
            
            return View();
        }
    }
}

