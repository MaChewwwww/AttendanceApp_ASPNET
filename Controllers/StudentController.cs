using AttendanceApp_ASPNET.Controllers.Base;
using Microsoft.AspNetCore.Mvc;

namespace AttendanceApp_ASPNET.Controllers
{
    // Student dashboard controller with enhanced security and authentication.
    public class StudentController : StudentBaseController
    {
        public IActionResult Dashboard()
        {
            // All authentication and role checks are handled by StudentBaseController
            // ViewBag data is automatically set by the base controller
            
            var studentInfo = GetCurrentStudentInfo();
            
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
            return SecureLogout();
        }
    }
}
