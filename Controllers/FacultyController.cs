using Microsoft.AspNetCore.Mvc;
using AttendanceApp_ASPNET.Controllers.Base;
using AttendanceApp_ASPNET.Services;
using AttendanceApp_ASPNET.Models;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Controllers
{
    public class FacultyController : FacultyBaseController
    {
        private readonly IClassService _classService;
        private readonly IFacultyPersonalAttendanceService _facultyPersonalAttendanceService;
        private readonly IFacultyAttendanceValidationService _facultyAttendanceValidationService;
        private readonly IFacultyAttendanceSubmissionService _facultyAttendanceSubmissionService;
        private readonly IEnvironmentService _environmentService;
        private readonly IDashboardService _dashboardService;

        public FacultyController(IApiService apiService, IClassService classService, IFacultyPersonalAttendanceService facultyPersonalAttendanceService, IFacultyAttendanceValidationService facultyAttendanceValidationService, IFacultyAttendanceSubmissionService facultyAttendanceSubmissionService, IEnvironmentService environmentService, IDashboardService dashboardService) 
            : base(apiService)
        {
            _classService = classService;
            _facultyPersonalAttendanceService = facultyPersonalAttendanceService;
            _facultyAttendanceValidationService = facultyAttendanceValidationService;
            _facultyAttendanceSubmissionService = facultyAttendanceSubmissionService;
            _environmentService = environmentService;
            _dashboardService = dashboardService;
        }

        public async Task<IActionResult> Dashboard()
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

            // Get weather data using EnvironmentService
            await _environmentService.SetWeatherViewBagAsync(this, HttpContext);

            var jwtToken = HttpContext.Session.GetString("AuthToken");
            
            // Fetch faculty dashboard data from API
            try
            {
                if (!string.IsNullOrEmpty(jwtToken))
                {
                    Console.WriteLine("=== FACULTY CONTROLLER: Starting dashboard data fetch ===");
                    Console.WriteLine($"FACULTY CONTROLLER: Using JWT token: {jwtToken.Substring(0, Math.Min(20, jwtToken.Length))}...");
                    
                    var dashboardData = await _dashboardService.GetFacultyDashboardAsync(jwtToken);
                    
                    Console.WriteLine($"FACULTY CONTROLLER: Dashboard service result - Success: {dashboardData.Success}");
                    Console.WriteLine($"FACULTY CONTROLLER: Message: {dashboardData.Message}");
                    
                    if (dashboardData.Success && dashboardData.Data != null)
                    {
                        Console.WriteLine("FACULTY CONTROLLER: Faculty dashboard data loaded successfully");
                        ViewBag.FacultyDashboardData = dashboardData.Data;
                        ViewBag.HasFacultyDashboardData = true;
                        ViewBag.FacultyDashboardError = null;
                        
                        // Set statistics from real data
                        ViewBag.TotalCourses = dashboardData.Data.TotalCurrentCourses;
                        ViewBag.TotalStudents = dashboardData.Data.CurrentCourses.Sum(c => c.EnrolledStudents);
                        ViewBag.PendingReviews = dashboardData.Data.TotalPendingApprovals;
                        ViewBag.TodayAttendanceCount = dashboardData.Data.TodayAttendanceCount;
                        
                        Console.WriteLine($"FACULTY CONTROLLER: Total courses: {dashboardData.Data.TotalCurrentCourses}");
                        Console.WriteLine($"FACULTY CONTROLLER: Today's schedule count: {dashboardData.Data.TodaySchedule.Count}");
                        Console.WriteLine($"FACULTY CONTROLLER: All schedules count: {dashboardData.Data.AllSchedules.Count}");
                    }
                    else
                    {
                        Console.WriteLine($"FACULTY CONTROLLER: Faculty dashboard data fetch failed - {dashboardData.Message}");
                        ViewBag.HasFacultyDashboardData = false;
                        ViewBag.FacultyDashboardError = !string.IsNullOrEmpty(dashboardData.Message) ? 
                                                        dashboardData.Message : "Failed to load faculty dashboard data";
                        
                        // Set fallback placeholder data
                        ViewBag.TotalCourses = 6;
                        ViewBag.TotalStudents = 256;
                        ViewBag.PendingReviews = 12;
                        ViewBag.TodayAttendanceCount = 8;
                    }
                }
                else
                {
                    Console.WriteLine("FACULTY CONTROLLER: No JWT token available");
                    ViewBag.HasFacultyDashboardData = false;
                    ViewBag.FacultyDashboardError = "Authentication token not found";
                    
                    // Set fallback placeholder data
                    ViewBag.TotalCourses = 6;
                    ViewBag.TotalStudents = 256;
                    ViewBag.PendingReviews = 12;
                    ViewBag.TodayAttendanceCount = 8;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"FACULTY CONTROLLER: Exception in faculty dashboard data fetch: {ex.Message}");
                Console.WriteLine($"FACULTY CONTROLLER: Stack trace: {ex.StackTrace}");
                ViewBag.HasFacultyDashboardData = false;
                ViewBag.FacultyDashboardError = "Unable to load dashboard data due to system error";
                
                // Set fallback placeholder data
                ViewBag.TotalCourses = 6;
                ViewBag.TotalStudents = 256;
                ViewBag.PendingReviews = 12;
                ViewBag.TodayAttendanceCount = 8;
            }

            // Keep existing mock data approach for now
            ViewBag.AverageAttendance = 87;

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
                // Remove the redundant authorization check since it's handled by the base controller
                var faculty = GetCurrentFacultyInfo();
                
                if (!faculty.Verified)
                {
                    TempData["WarningMessage"] = "Your account needs to be verified to access all features.";
                }

                var jwtToken = HttpContext.Session.GetString("AuthToken");
                
                // Debug logging...
                Console.WriteLine($"=== JWT TOKEN DEBUG ===");
                Console.WriteLine($"JWT Token found: {!string.IsNullOrEmpty(jwtToken)}");
                Console.WriteLine($"Session keys present: {string.Join(", ", HttpContext.Session.Keys)}");
                Console.WriteLine($"Token value: {(string.IsNullOrEmpty(jwtToken) ? "null" : "present")}");
                Console.WriteLine($"Faculty Info: {faculty.Email} - {faculty.FullName}");
                Console.WriteLine($"====================");

                if (string.IsNullOrEmpty(jwtToken))
                {
                    return RedirectToAction("Login", "Auth");
                }

                // Extend session before making API call
                ExtendSession();

                var coursesResponse = await _classService.GetFacultyCoursesAsync(jwtToken);
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

        public async Task<IActionResult> Attendance()
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

        [HttpGet]
        public async Task<IActionResult> GetCourseDetails(int assignedCourseId)
        {
            try
            {
                var faculty = GetCurrentFacultyInfo();
                var jwtToken = HttpContext.Session.GetString("AuthToken");
                
                if (string.IsNullOrEmpty(jwtToken))
                {
                    return Json(new { success = false, message = "Authentication required" });
                }

                // Extend session before making API call
                ExtendSession();

                var courseDetailsResponse = await _classService.GetFacultyCourseDetailsAsync(assignedCourseId, jwtToken);

                // Return the structured response directly
                return Json(courseDetailsResponse);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting course details: {ex.Message}");
                return Json(new FacultyCourseDetailsResponse
                { 
                    Success = false, 
                    Message = "Failed to load course details. Please try again later."
                });
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdateStudentStatus(int assignedCourseId, int studentId, [FromBody] UpdateStudentStatusRequest request)
        {
            try
            {
                var faculty = GetCurrentFacultyInfo();
                var jwtToken = HttpContext.Session.GetString("AuthToken");
                
                if (string.IsNullOrEmpty(jwtToken))
                {
                    return Json(new { success = false, message = "Authentication required" });
                }

                // Extend session before making API call
                ExtendSession();

                // Send the request object directly to match the API expectation
                var updateResult = await _classService.UpdateStudentStatusAsync(assignedCourseId, studentId, request.Status, request.RejectionReason ?? "", jwtToken);
                return Json(updateResult);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating student status: {ex.Message}");
                return Json(new { 
                    success = false, 
                    message = "Failed to update student status. Please try again later.",
                    error = ex.Message 
                });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetCourseAttendance(int assignedCourseId, int? month = null, int? day = null)
        {
            try
            {
                var faculty = GetCurrentFacultyInfo();
                var jwtToken = HttpContext.Session.GetString("AuthToken");
                
                Console.WriteLine($"=== FACULTY CONTROLLER GET COURSE ATTENDANCE ===");
                Console.WriteLine($"Request Parameters:");
                Console.WriteLine($"  - assignedCourseId: {assignedCourseId}");
                Console.WriteLine($"  - month: {month?.ToString() ?? "null"}");
                Console.WriteLine($"  - day: {day?.ToString() ?? "null"}");
                Console.WriteLine($"Faculty: {faculty.FullName} ({faculty.Email})");
                Console.WriteLine($"JWT Token present: {!string.IsNullOrEmpty(jwtToken)}");
                Console.WriteLine("===============================================");
                
                if (string.IsNullOrEmpty(jwtToken))
                {
                    Console.WriteLine("ERROR: No JWT token available");
                    return Json(new { success = false, message = "Authentication required" });
                }

                if (assignedCourseId <= 0)
                {
                    Console.WriteLine($"ERROR: Invalid assignedCourseId: {assignedCourseId}");
                    return Json(new { success = false, message = "Invalid course ID" });
                }

                // Extend session before making API call
                ExtendSession();

                var attendanceResponse = await _classService.GetCourseAttendanceAsync(assignedCourseId, null, month, day, jwtToken);
                
                Console.WriteLine($"=== CONTROLLER RESPONSE SUMMARY ===");
                Console.WriteLine($"Response Success: {attendanceResponse.Success}");
                Console.WriteLine($"Response Message: {attendanceResponse.Message}");
                Console.WriteLine($"Records Count: {attendanceResponse.AttendanceRecords?.Count ?? 0}");
                Console.WriteLine($"Total Records: {attendanceResponse.TotalRecords}");
                Console.WriteLine($"Is Current Course: {attendanceResponse.IsCurrentCourse}");
                
                if (attendanceResponse.AttendanceRecords?.Any() == true)
                {
                    var recordsWithValidIds = attendanceResponse.AttendanceRecords.Where(r => r.AttendanceId > 0).Count();
                    var recordsWithInvalidIds = attendanceResponse.AttendanceRecords.Where(r => r.AttendanceId <= 0).Count();
                    Console.WriteLine($"Records with valid IDs: {recordsWithValidIds}");
                    Console.WriteLine($"Records with invalid IDs: {recordsWithInvalidIds}");
                    
                    // Log first few records for debugging
                    Console.WriteLine("First 3 records:");
                    foreach (var record in attendanceResponse.AttendanceRecords.Take(3))
                    {
                        Console.WriteLine($"  - ID: {record.AttendanceId}, Student: {record.StudentName}, Status: {record.Status}");
                    }
                }
                Console.WriteLine("==================================");
                
                return Json(attendanceResponse);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR in GetCourseAttendance: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return Json(new { 
                    success = false, 
                    message = "Failed to load course attendance. Please try again later.",
                    error = ex.Message 
                });
            }
        }

        [HttpPut("UpdateAttendanceStatus/{attendanceId:int}")]
        public async Task<IActionResult> UpdateAttendanceStatus(int attendanceId, [FromBody] UpdateAttendanceStatusRequest request)
        {
            try
            {
                var faculty = GetCurrentFacultyInfo();
                var jwtToken = HttpContext.Session.GetString("AuthToken");
                
                Console.WriteLine($"=== UPDATE ATTENDANCE STATUS REQUEST ===");
                Console.WriteLine($"URL Parameter - Attendance ID: {attendanceId} (type: {attendanceId.GetType()})");
                Console.WriteLine($"Route Values: {string.Join(", ", RouteData.Values.Select(kv => $"{kv.Key}={kv.Value}"))}");
                Console.WriteLine($"Request Path: {Request.Path}");
                Console.WriteLine($"Request Body - Status: {request.Status}");
                Console.WriteLine($"Request Body - AssignedCourseId: {request.AssignedCourseId}");
                Console.WriteLine($"Request Body - StudentId: {request.StudentId}");
                Console.WriteLine($"Request Body - StudentName: {request.StudentName}");
                Console.WriteLine($"Request Body - AttendanceDate: {request.AttendanceDate}");
                Console.WriteLine($"Request Body - AttendanceTime: {request.AttendanceTime}");
                Console.WriteLine($"Faculty: {faculty.FullName} ({faculty.Email})");
                Console.WriteLine($"JWT Token present: {!string.IsNullOrEmpty(jwtToken)}");
                Console.WriteLine("==========================================");
                
                if (string.IsNullOrEmpty(jwtToken))
                {
                    return Json(new { success = false, message = "Authentication required" });
                }

                // Validate attendance ID from URL parameter
                if (attendanceId <= 0)
                {
                    Console.WriteLine($"Invalid attendance ID from URL: {attendanceId}");
                    return Json(new { 
                        success = false, 
                        message = $"Invalid attendance ID: {attendanceId}" 
                    });
                }

                // Validate status value
                var validStatuses = new[] { "present", "absent", "late" };
                if (!validStatuses.Contains(request.Status.ToLower()))
                {
                    return Json(new { 
                        success = false, 
                        message = $"Invalid status. Must be one of: {string.Join(", ", validStatuses)}" 
                    });
                }

                // Validate assigned course ID (required for the new API)
                if (request.AssignedCourseId <= 0)
                {
                    return Json(new { 
                        success = false, 
                        message = "Assigned course ID is required" 
                    });
                }

                // Extend session before making API call
                ExtendSession();

                // Use the new API endpoint through ClassService
                var updateResult = await _classService.UpdateAttendanceStatusAsync(request.AssignedCourseId, attendanceId, request.Status.ToLower(), jwtToken);
                
                Console.WriteLine($"Update result - Success: {updateResult.Success}, Message: {updateResult.Message}");
                
                // Transform the response to match frontend expectations
                var response = new
                {
                    success = updateResult.Success,
                    message = updateResult.Message,
                    updated_record = updateResult.UpdatedRecord != null ? new
                    {
                        attendance_id = updateResult.UpdatedRecord.AttendanceId,
                        status = updateResult.UpdatedRecord.Status,
                        student_id = updateResult.UpdatedRecord.StudentId,
                        student_name = updateResult.UpdatedRecord.StudentName,
                        attendance_date = request.AttendanceDate, // Preserve from request since API doesn't return this
                        attendance_time = request.AttendanceTime, // Preserve from request since API doesn't return this
                        updated_at = updateResult.UpdatedRecord.UpdatedAt
                    } : null
                };
                
                return Json(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating attendance status: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return Json(new
                {
                    success = false,
                    message = "Failed to update attendance status. Please try again later.",
                    error = ex.Message
                });
            }
        }

        // Alternative method if the explicit route doesn't work
        [HttpPut]
        [Route("Faculty/UpdateAttendanceStatus/{attendanceId}")]
        public async Task<IActionResult> UpdateAttendanceStatusAlternative(int attendanceId, [FromBody] UpdateAttendanceStatusRequest request)
        {
            // Same implementation as above
            return await UpdateAttendanceStatus(attendanceId, request);
        }

        [HttpGet]
        public async Task<IActionResult> GetPersonalAttendanceData()
        {
            try
            {
                var faculty = GetCurrentFacultyInfo();
                var jwtToken = HttpContext.Session.GetString("AuthToken");
                
                Console.WriteLine($"=== FACULTY CONTROLLER GET PERSONAL ATTENDANCE DATA ===");
                Console.WriteLine($"Faculty: {faculty.FullName} ({faculty.Email})");
                Console.WriteLine($"JWT Token present: {!string.IsNullOrEmpty(jwtToken)}");
                Console.WriteLine("======================================================");
                
                if (string.IsNullOrEmpty(jwtToken))
                {
                    Console.WriteLine("ERROR: No JWT token available");
                    return Json(new { success = false, message = "Authentication required" });
                }

                // Extend session before making API call
                ExtendSession();

                var personalAttendanceResponse = await _facultyPersonalAttendanceService.GetFacultyPersonalAttendanceAsync(jwtToken);
                
                Console.WriteLine($"=== CONTROLLER PERSONAL ATTENDANCE RESPONSE SUMMARY ===");
                Console.WriteLine($"Response Success: {personalAttendanceResponse.Success}");
                Console.WriteLine($"Response Message: {personalAttendanceResponse.Message}");
                Console.WriteLine($"Records Count: {personalAttendanceResponse.AttendanceRecords?.Count ?? 0}");
                Console.WriteLine($"Total Records: {personalAttendanceResponse.TotalRecords}");
                Console.WriteLine($"Faculty Name: {personalAttendanceResponse.FacultyInfo?.Name}");
                Console.WriteLine($"Attendance Percentage: {personalAttendanceResponse.AttendanceSummary?.AttendancePercentage ?? 0:F2}%");
                Console.WriteLine("=======================================================");
                
                return Json(personalAttendanceResponse);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR in GetPersonalAttendanceData: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return Json(new { 
                    success = false, 
                    message = "Failed to load personal attendance data. Please try again later.",
                    error = ex.Message 
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> ValidateFacultyAttendanceSubmission([FromBody] FacultyAttendanceValidationRequest request)
        {
            try
            {
                var faculty = GetCurrentFacultyInfo();
                var jwtToken = HttpContext.Session.GetString("AuthToken");
                
                Console.WriteLine($"=== FACULTY CONTROLLER VALIDATE ATTENDANCE SUBMISSION ===");
                Console.WriteLine($"Request - Assigned Course ID: {request.AssignedCourseId}");
                Console.WriteLine($"Faculty: {faculty.FullName} ({faculty.Email})");
                Console.WriteLine($"JWT Token present: {!string.IsNullOrEmpty(jwtToken)}");
                Console.WriteLine("========================================================");
                
                if (string.IsNullOrEmpty(jwtToken))
                {
                    Console.WriteLine("ERROR: No JWT token available");
                    return Json(new { success = false, message = "Authentication required" });
                }

                if (request.AssignedCourseId <= 0)
                {
                    Console.WriteLine($"ERROR: Invalid assigned course ID: {request.AssignedCourseId}");
                    return Json(new { success = false, message = "Invalid course ID" });
                }

                // Extend session before making API call
                ExtendSession();

                var validationResponse = await _facultyAttendanceValidationService.ValidateFacultyAttendanceAsync(request.AssignedCourseId, jwtToken);
                
                Console.WriteLine($"=== CONTROLLER VALIDATION RESPONSE SUMMARY ===");
                Console.WriteLine($"Can Submit: {validationResponse.CanSubmit}");
                Console.WriteLine($"Message: {validationResponse.Message}");
                Console.WriteLine($"Schedule Info Present: {validationResponse.ScheduleInfo != null}");
                Console.WriteLine($"Existing Attendance Present: {validationResponse.ExistingAttendance != null}");
                Console.WriteLine("=============================================");
                
                // Create response with explicit camelCase property names for JavaScript compatibility
                var response = new
                {
                    canSubmit = validationResponse.CanSubmit,
                    message = validationResponse.Message,
                    scheduleInfo = validationResponse.ScheduleInfo,
                    existingAttendance = validationResponse.ExistingAttendance
                };
                
                Console.WriteLine($"=== EXPLICIT RESPONSE OBJECT ===");
                Console.WriteLine($"Response canSubmit: {response.canSubmit}");
                Console.WriteLine($"Response message: {response.message}");
                Console.WriteLine("===============================");
                
                return Json(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR in ValidateFacultyAttendanceSubmission: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return Json(new 
                { 
                    canSubmit = false, 
                    message = "Failed to validate attendance submission eligibility. Please try again later.",
                    scheduleInfo = (object?)null,
                    existingAttendance = (object?)null
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> SubmitFacultyAttendance([FromBody] Models.FacultyAttendanceSubmissionRequest request)
        {
            try
            {
                var faculty = GetCurrentFacultyInfo();
                var jwtToken = HttpContext.Session.GetString("AuthToken");
                
                Console.WriteLine($"=== FACULTY CONTROLLER SUBMIT ATTENDANCE ===");
                Console.WriteLine($"Request - Assigned Course ID: {request.AssignedCourseId}");
                Console.WriteLine($"Request - Face Image Length: {request.FaceImage?.Length ?? 0}");
                Console.WriteLine($"Request - Has Location: {request.Latitude.HasValue && request.Longitude.HasValue}");
                Console.WriteLine($"Faculty: {faculty.FullName} ({faculty.Email})");
                Console.WriteLine($"JWT Token present: {!string.IsNullOrEmpty(jwtToken)}");
                Console.WriteLine("============================================");
                
                if (string.IsNullOrEmpty(jwtToken))
                {
                    Console.WriteLine("ERROR: No JWT token available");
                    return Json(new { success = false, message = "Authentication required" });
                }

                if (request.AssignedCourseId <= 0)
                {
                    Console.WriteLine($"ERROR: Invalid assigned course ID: {request.AssignedCourseId}");
                    return Json(new { success = false, message = "Invalid course ID" });
                }

                if (string.IsNullOrEmpty(request.FaceImage))
                {
                    Console.WriteLine("ERROR: Face image is required");
                    return Json(new { success = false, message = "Face image is required for attendance verification" });
                }

                // Extend session before making API call
                ExtendSession();

                var submissionResponse = await _facultyAttendanceSubmissionService.SubmitFacultyAttendanceAsync(request, jwtToken);
                
                Console.WriteLine($"=== CONTROLLER SUBMISSION RESPONSE SUMMARY ===");
                Console.WriteLine($"Success: {submissionResponse.Success}");
                Console.WriteLine($"Message: {submissionResponse.Message}");
                Console.WriteLine($"Attendance ID: {submissionResponse.AttendanceId}");
                Console.WriteLine($"Status: {submissionResponse.Status}");
                Console.WriteLine($"Submitted At: {submissionResponse.SubmittedAt}");
                Console.WriteLine("==============================================");
                
                // Create response with explicit camelCase property names for JavaScript compatibility
                var response = new
                {
                    success = submissionResponse.Success,
                    message = submissionResponse.Message,
                    attendanceId = submissionResponse.AttendanceId,
                    status = submissionResponse.Status,
                    submittedAt = submissionResponse.SubmittedAt,
                    courseInfo = submissionResponse.CourseInfo
                };
                
                Console.WriteLine($"=== EXPLICIT RESPONSE OBJECT ===");
                Console.WriteLine($"Response success: {response.success}");
                Console.WriteLine($"Response message: {response.message}");
                Console.WriteLine($"Response status: {response.status}");
                Console.WriteLine("===============================");
                
                return Json(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR in SubmitFacultyAttendance: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return Json(new 
                { 
                    success = false, 
                    message = "Failed to submit faculty attendance. Please try again later.",
                    attendanceId = (int?)null,
                    status = (string?)null,
                    submittedAt = (string?)null,
                    courseInfo = (object?)null
                });
            }
        }
    }

    public class UpdateStudentStatusRequest
    {
        public string Status { get; set; } = string.Empty;
        public string RejectionReason { get; set; } = string.Empty;
    }

    public class UpdateAttendanceStatusRequest
    {
        public int AssignedCourseId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string AttendanceDate { get; set; } = string.Empty;
        public string AttendanceTime { get; set; } = string.Empty;
    }

    public class FacultyAttendanceValidationRequest
    {
        public int AssignedCourseId { get; set; }
    }

    public class FacultyAttendanceValidationResponse
    {
        public bool CanSubmit { get; set; }
        public string Message { get; set; } = string.Empty;
        public object? ScheduleInfo { get; set; }
        public object? ExistingAttendance { get; set; }
    }

    public class FacultyAttendanceSubmissionRequest
    {
        public int AssignedCourseId { get; set; }
        public string FaceImage { get; set; } = string.Empty;
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }

    public class FacultyAttendanceSubmissionResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int AttendanceId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string SubmittedAt { get; set; } = string.Empty;
        public object? CourseInfo { get; set; }
    }
}

