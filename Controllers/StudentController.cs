using AttendanceApp_ASPNET.Controllers.Base;
using AttendanceApp_ASPNET.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Controllers
{
    // Student dashboard controller with enhanced security and authentication.
    public class StudentController : StudentBaseController
    {
        private readonly IStudentManagementService _studentManagementService;
        private readonly IEnvironmentService _environmentService;

        public StudentController(
            IApiService apiService,
            IStudentManagementService studentManagementService,
            IEnvironmentService environmentService) : base(apiService)
        {
            _studentManagementService = studentManagementService;
            _environmentService = environmentService;
        }

        public async Task<IActionResult> Dashboard()
        {
            // All authentication, role checks, and onboarding enforcement are handled by StudentBaseController
            
            var studentInfo = _studentManagementService.GetCurrentStudentInfo(HttpContext);
            var isNearExpiry = _studentManagementService.IsSessionNearExpiry(HttpContext);
            
            // Set dashboard data using consolidated service
            _studentManagementService.SetDashboardViewBag(this, studentInfo, TempData, isNearExpiry);
            
            // Fetch weather data using consolidated service
            await _environmentService.SetWeatherViewBagAsync(this, HttpContext);
            
            return View();
        }

        // Student profile page.
        public IActionResult Profile()
        {
            var studentInfo = _studentManagementService.GetCurrentStudentInfo(HttpContext);
            return View(studentInfo);
        }

        // Student attendance records.
        public IActionResult Attendance()
        {
            var studentInfo = _studentManagementService.GetCurrentStudentInfo(HttpContext);
            // Add attendance-specific logic here
            return View();
        }

        // Mark attendance using face recognition.
        public IActionResult MarkAttendance()
        {
            var studentInfo = _studentManagementService.GetCurrentStudentInfo(HttpContext);
            // Add face recognition attendance logic here
            return View();
        }

        // AJAX endpoint to check session status.
        [HttpGet]
        public IActionResult CheckSessionStatus()
        {
            var status = _studentManagementService.CheckSessionStatus(HttpContext);
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
            return _studentManagementService.PerformLegacyLogout(HttpContext);
        }

        [HttpGet]
        public async Task<IActionResult> GetAvailablePrograms()
        {
            if (!_studentManagementService.ValidateAuthentication(HttpContext))
            {
                return Json(new { success = false, message = "Authentication required", programs = new object[0] });
            }

            var jwtToken = _studentManagementService.GetJwtToken(HttpContext);
            var result = await _studentManagementService.GetAvailableProgramsAsync(jwtToken);
            
            return Json(new { 
                success = result.Success,
                message = result.Message,
                programs = result.Data
            });
        }

        [HttpGet]
        [Route("Student/GetAvailableSections/{id:int}")]
        public async Task<IActionResult> GetAvailableSections(int id)
        {
            if (!_studentManagementService.ValidateAuthentication(HttpContext))
            {
                return Json(new { success = false, message = "Authentication required", sections = new object[0] });
            }

            var jwtToken = _studentManagementService.GetJwtToken(HttpContext);
            var result = await _studentManagementService.GetAvailableSectionsByProgramAsync(id, jwtToken);
            
            return Json(new { 
                success = result.Success,
                message = result.Message,
                sections = result.Data
            });
        }

        [HttpGet]
        [Route("Student/GetAvailableCourses/{id:int}")]
        public async Task<IActionResult> GetAvailableCourses(int id)
        {
            if (!_studentManagementService.ValidateAuthentication(HttpContext))
            {
                return Json(new { success = false, message = "Authentication required", courses = new object[0] });
            }

            var jwtToken = _studentManagementService.GetJwtToken(HttpContext);
            var result = await _studentManagementService.GetAvailableCoursesBySectionAsync(id, jwtToken);
            
            return Json(new { 
                success = result.Success,
                message = result.Message,
                courses = result.Data
            });
        }

        [HttpPost]
        public async Task<IActionResult> CompleteOnboarding([FromBody] JsonElement onboardingData)
        {
            if (!_studentManagementService.ValidateAuthentication(HttpContext))
            {
                return Json(new { success = false, message = "Authentication required" });
            }

            var jwtToken = _studentManagementService.GetJwtToken(HttpContext);
            var result = await _studentManagementService.CompleteOnboardingAsync(onboardingData, jwtToken);
            
            // Update session if successful
            _studentManagementService.UpdateSessionAfterOnboarding(HttpContext, result);
            
            return Json(new { 
                success = result.Success,
                message = result.Message,
                assigned_courses_count = result.AssignedCoursesCount,
                approval_records_created = result.ApprovalRecordsCreated,
                section_name = result.SectionName,
                section_id = result.SectionId
            });
        }

        [HttpPost]
        public IActionResult SetUserLocation([FromBody] JsonElement locationData)
        {
            var result = _environmentService.UpdateUserLocation(HttpContext, locationData);
            
            return Json(new { 
                success = result.Success, 
                message = result.Message,
                location = result.Location
            });
        }

        // Add missing Courses action for the courses page
        public async Task<IActionResult> Courses()
        {
            var studentInfo = _studentManagementService.GetCurrentStudentInfo(HttpContext);
            ViewBag.StudentInfo = studentInfo;
            
            // For now, return a simple view. This can be expanded with course data later
            return View();
        }
    }
}
