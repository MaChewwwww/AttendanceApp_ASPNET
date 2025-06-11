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
        private readonly IStudentHistoryService _studentHistoryService;
        private readonly IDashboardService _dashboardService;
        private readonly IAttendanceService _attendanceService;

        public StudentController(
            IApiService apiService,
            IStudentManagementService studentManagementService,
            IEnvironmentService environmentService,
            ICourseService courseService,
            IStudentHistoryService studentHistoryService,
            IDashboardService dashboardService,
            IAttendanceService attendanceService) : base(apiService)
        {
            _studentManagementService = studentManagementService;
            _environmentService = environmentService;
            _courseService = courseService;
            _studentHistoryService = studentHistoryService;
            _dashboardService = dashboardService;
            _attendanceService = attendanceService;
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
            
            var jwtToken = HttpContext.Session.GetString("AuthToken");
            
            // Fetch dashboard data from API
            try
            {
                if (!string.IsNullOrEmpty(jwtToken))
                {
                    var dashboardData = await _dashboardService.GetStudentDashboardAsync(jwtToken);
                    
                    if (dashboardData.Success && dashboardData.Data != null)
                    {
                        ViewBag.DashboardData = dashboardData.Data;
                        ViewBag.HasDashboardData = true;
                        
                        // Update ViewBag with current class information
                        if (dashboardData.Data.ScheduleSummary.CurrentClass != null)
                        {
                            ViewBag.CurrentClass = dashboardData.Data.ScheduleSummary.CurrentClass;
                            ViewBag.HasCurrentClass = true;
                        }
                        else
                        {
                            ViewBag.HasCurrentClass = false;
                        }
                        
                        ViewBag.TotalEnrolledCourses = dashboardData.Data.TotalEnrolledCourses;
                        ViewBag.PendingApprovals = dashboardData.Data.PendingApprovals;
                    }
                    else
                    {
                        ViewBag.HasDashboardData = false;
                        ViewBag.DashboardError = dashboardData.Message;
                        Console.WriteLine($"Dashboard data fetch failed: {dashboardData.Message}");
                    }
                }
                else
                {
                    ViewBag.HasDashboardData = false;
                    ViewBag.DashboardError = "Authentication token not found";
                }
            }
            catch (Exception ex)
            {
                ViewBag.HasDashboardData = false;
                ViewBag.DashboardError = "Unable to load dashboard data";
                Console.WriteLine($"Error fetching dashboard data: {ex.Message}");
            }
            
            // Fetch attendance rate
            try
            {
                if (!string.IsNullOrEmpty(jwtToken))
                {
                    Console.WriteLine("=== CONTROLLER: Starting attendance rate calculation ===");
                    var attendanceRate = await _attendanceService.CalculateAttendanceRateAsync(jwtToken);
                    
                    Console.WriteLine($"CONTROLLER: Attendance service result - Success: {attendanceRate.Success}");
                    Console.WriteLine($"CONTROLLER: Message: {attendanceRate.Message}");
                    Console.WriteLine($"CONTROLLER: Rate: {attendanceRate.AttendanceRate}%");
                    Console.WriteLine($"CONTROLLER: Total: {attendanceRate.TotalClasses}, Present: {attendanceRate.PresentClasses}, Absent: {attendanceRate.AbsentClasses}, Late: {attendanceRate.LateClasses}");
                    
                    if (attendanceRate.Success)
                    {
                        // Set ViewBag data regardless of total classes count
                        ViewBag.AttendanceRate = attendanceRate.AttendanceRate;
                        ViewBag.AttendanceDetails = new
                        {
                            TotalClasses = attendanceRate.TotalClasses,
                            PresentClasses = attendanceRate.PresentClasses,
                            AbsentClasses = attendanceRate.AbsentClasses,
                            LateClasses = attendanceRate.LateClasses,
                            AcademicYear = attendanceRate.AcademicYear ?? "2023-2024",
                            Semester = attendanceRate.Semester ?? "1st Semester"
                        };
                        ViewBag.HasAttendanceRate = true;
                        
                        Console.WriteLine($"CONTROLLER: ViewBag set successfully");
                        Console.WriteLine($"CONTROLLER: HasAttendanceRate = {ViewBag.HasAttendanceRate}");
                        Console.WriteLine($"CONTROLLER: AttendanceRate = {ViewBag.AttendanceRate}");
                        
                        // Also fetch and pre-load charts data
                        try
                        {
                            var chartsData = await _attendanceService.GetAttendanceChartsDataAsync(jwtToken);
                            if (chartsData.Success)
                            {
                                ViewBag.AttendanceChartsData = chartsData;
                                ViewBag.HasAttendanceChartsData = true;
                                Console.WriteLine($"CONTROLLER: Charts data loaded - Weekly: {chartsData.WeeklyData.Count}, Monthly: {chartsData.MonthlyData.Count}, Course: {chartsData.CourseWiseData.Count}");
                            }
                            else
                            {
                                ViewBag.HasAttendanceChartsData = false;
                                Console.WriteLine($"CONTROLLER: Charts data failed: {chartsData.Message}");
                            }
                        }
                        catch (Exception chartsEx)
                        {
                            Console.WriteLine($"CONTROLLER: Error loading charts data: {chartsEx.Message}");
                            ViewBag.HasAttendanceChartsData = false;
                        }
                    }
                    else
                    {
                        ViewBag.AttendanceRate = 0;
                        ViewBag.HasAttendanceRate = false;
                        ViewBag.HasAttendanceChartsData = false;
                        Console.WriteLine($"CONTROLLER: Attendance service failed - {attendanceRate.Message}");
                    }
                }
                else
                {
                    ViewBag.AttendanceRate = 0;
                    ViewBag.HasAttendanceRate = false;
                    ViewBag.HasAttendanceChartsData = false;
                    Console.WriteLine("CONTROLLER: No JWT token available for attendance rate calculation");
                }
            }
            catch (Exception ex)
            {
                ViewBag.AttendanceRate = 0;
                ViewBag.HasAttendanceRate = false;
                ViewBag.HasAttendanceChartsData = false;
                Console.WriteLine($"CONTROLLER: Exception in attendance rate calculation: {ex.Message}");
                Console.WriteLine($"CONTROLLER: Stack trace: {ex.StackTrace}");
            }
            
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

        // Student attendance history page.
        public async Task<IActionResult> AttendanceHistory()
        {
            var studentInfo = _studentManagementService.GetCurrentStudentInfo(HttpContext);
            ViewBag.StudentInfo = studentInfo;
            
            try
            {
                var jwtToken = HttpContext.Session.GetString("AuthToken");
                if (string.IsNullOrEmpty(jwtToken))
                {
                    ViewBag.ErrorMessage = "Authentication required. Please log in again.";
                    return View(new StudentAttendanceResult { Success = false, Message = "Authentication required" });
                }

                Console.WriteLine($"Attempting to fetch attendance history with JWT token: {jwtToken.Substring(0, Math.Min(20, jwtToken.Length))}...");
                
                var attendanceData = await _studentHistoryService.GetStudentAttendanceHistoryAsync(jwtToken);
                
                Console.WriteLine($"Attendance service response - Success: {attendanceData.Success}, Message: {attendanceData.Message}");
                Console.WriteLine($"Total attendance records: {attendanceData.TotalRecords}");
                
                if (!attendanceData.Success)
                {
                    if (attendanceData.Message.Contains("timeout", StringComparison.OrdinalIgnoreCase) ||
                        attendanceData.Message.Contains("connect", StringComparison.OrdinalIgnoreCase) ||
                        attendanceData.Message.Contains("server", StringComparison.OrdinalIgnoreCase))
                    {
                        ViewBag.ErrorMessage = "Unable to connect to the server. Please check that the API is running and try again.";
                    }
                    else
                    {
                        ViewBag.ErrorMessage = attendanceData.Message;
                    }
                }
                
                return View(attendanceData);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading attendance history: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                if (ex.Message.Contains("timeout") || ex.Message.Contains("connect"))
                {
                    ViewBag.ErrorMessage = "Connection timeout. Please verify the API server is running on http://localhost:8000 and try again.";
                }
                else
                {
                    ViewBag.ErrorMessage = "Unable to load attendance history at this time. Please try again later.";
                }
                
                return View(new StudentAttendanceResult { 
                    Success = false, 
                    Message = ex.Message.Contains("timeout") || ex.Message.Contains("connect") ? 
                              "API server connection failed" : "System error occurred" 
                });
            }
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

        [HttpGet]
        [Route("Student/Courses/{assignedCourseId:int}/Students")]
        public async Task<IActionResult> GetCourseStudents(int assignedCourseId)
        {
            try
            {
                var jwtToken = HttpContext.Session.GetString("AuthToken");
                if (string.IsNullOrEmpty(jwtToken))
                {
                    return Json(new { success = false, message = "Authentication required. Please log in again." });
                }

                var courseStudents = await _courseService.GetCourseStudentsAsync(assignedCourseId, jwtToken);
                
                return Json(new
                {
                    success = courseStudents.Success,
                    message = courseStudents.Message,
                    course_info = courseStudents.CourseInfo,
                    students = courseStudents.Students,
                    total_students = courseStudents.TotalStudents,
                    enrollment_summary = courseStudents.EnrollmentSummary,
                    attendance_summary = courseStudents.AttendanceSummary
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading course students for assigned course {assignedCourseId}: {ex.Message}");
                return Json(new { success = false, message = "Unable to load course students at this time. Please try again later." });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAttendanceChartsData()
        {
            try
            {
                var jwtToken = HttpContext.Session.GetString("AuthToken");
                if (string.IsNullOrEmpty(jwtToken))
                {
                    return Json(new { success = false, message = "Authentication required" });
                }

                var chartsData = await _attendanceService.GetAttendanceChartsDataAsync(jwtToken);
                
                return Json(new
                {
                    success = chartsData.Success,
                    message = chartsData.Message,
                    weeklyData = chartsData.WeeklyData,
                    monthlyData = chartsData.MonthlyData,
                    courseWiseData = chartsData.CourseWiseData,
                    overallStats = chartsData.OverallStats
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting attendance charts data: {ex.Message}");
                return Json(new { success = false, message = "Unable to load charts data" });
            }
        }
    }
}
