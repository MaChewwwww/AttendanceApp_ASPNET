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
        private readonly ICourseService _courseService;

        public StudentController(
            IApiService apiService,
            IStudentManagementService studentManagementService,
            IEnvironmentService environmentService,
            ICourseService courseService) : base(apiService)
        {
            _studentManagementService = studentManagementService;
            _environmentService = environmentService;
            _courseService = courseService;
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

        // Student courses page.
        public async Task<IActionResult> Courses()
        {
            var studentInfo = _studentManagementService.GetCurrentStudentInfo(HttpContext);
            ViewBag.StudentInfo = studentInfo;
            
            try
            {
                var jwtToken = HttpContext.Session.GetString("AuthToken");
                if (string.IsNullOrEmpty(jwtToken))
                {
                    Console.WriteLine("No JWT token found in session");
                    ViewBag.ErrorMessage = "Authentication required. Please log in again.";
                    return View(new CourseDataResult { Success = false, Message = "Authentication required" });
                }

                Console.WriteLine($"Attempting to fetch courses with JWT token: {jwtToken.Substring(0, Math.Min(20, jwtToken.Length))}...");
                
                var courseData = await _courseService.GetStudentCoursesAsync(jwtToken);
                
                Console.WriteLine($"Course service response - Success: {courseData.Success}, Message: {courseData.Message}");
                Console.WriteLine($"Current courses count: {courseData.CurrentCourses?.Count ?? 0}");
                Console.WriteLine($"Previous courses count: {courseData.PreviousCourses?.Count ?? 0}");
                
                if (!courseData.Success)
                {
                    // Check if it's a connection error
                    if (courseData.Message.Contains("timeout", StringComparison.OrdinalIgnoreCase) ||
                        courseData.Message.Contains("connect", StringComparison.OrdinalIgnoreCase) ||
                        courseData.Message.Contains("server", StringComparison.OrdinalIgnoreCase))
                    {
                        ViewBag.ErrorMessage = "Unable to connect to the server. Please check that the API is running and try again.";
                    }
                    else
                    {
                        ViewBag.ErrorMessage = courseData.Message;
                    }
                }
                
                return View(courseData);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading courses page: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                // Provide more specific error messages
                if (ex.Message.Contains("timeout") || ex.Message.Contains("connect"))
                {
                    ViewBag.ErrorMessage = "Connection timeout. Please verify the API server is running on http://localhost:8000 and try again.";
                }
                else
                {
                    ViewBag.ErrorMessage = "Unable to load courses at this time. Please try again later.";
                }
                
                return View(new CourseDataResult { 
                    Success = false, 
                    Message = ex.Message.Contains("timeout") || ex.Message.Contains("connect") ? 
                              "API server connection failed" : "System error occurred" 
                });
            }
        }

        // Course details page.
        [Route("Student/Courses/{courseId:int}")]
        public async Task<IActionResult> CourseDetails(int courseId)
        {
            var studentInfo = _studentManagementService.GetCurrentStudentInfo(HttpContext);
            ViewBag.StudentInfo = studentInfo;
            
            try
            {
                var jwtToken = HttpContext.Session.GetString("AuthToken");
                if (string.IsNullOrEmpty(jwtToken))
                {
                    ViewBag.ErrorMessage = "Authentication required. Please log in again.";
                    return View(new CourseDetailsResult { Success = false, Message = "Authentication required" });
                }

                var courseDetails = await _courseService.GetCourseDetailsAsync(courseId, jwtToken);
                
                if (!courseDetails.Success)
                {
                    ViewBag.ErrorMessage = courseDetails.Message;
                }
                
                ViewBag.CourseId = courseId;
                return View(courseDetails);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading course details for course {courseId}: {ex.Message}");
                ViewBag.ErrorMessage = "Unable to load course details at this time. Please try again later.";
                return View(new CourseDetailsResult { Success = false, Message = "System error occurred" });
            }
        }
    }
}
