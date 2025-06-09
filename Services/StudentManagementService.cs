using AttendanceApp_ASPNET.Controllers.Base;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public class StudentManagementService : IStudentManagementService
    {
        private readonly IApiService _apiService;

        public StudentManagementService(IApiService apiService)
        {
            _apiService = apiService;
        }

        // Session management (from SessionService)
        public bool ValidateAuthentication(HttpContext httpContext)
        {
            var jwtToken = httpContext.Session.GetString("AuthToken");
            return !string.IsNullOrEmpty(jwtToken);
        }

        public string GetJwtToken(HttpContext httpContext)
        {
            return httpContext.Session.GetString("AuthToken") ?? string.Empty;
        }

        public SessionStatusResult CheckSessionStatus(HttpContext httpContext)
        {
            var sessionExpiry = httpContext.Session.GetString("SessionExpiry");
            var isAuthenticated = httpContext.Session.GetString("IsAuthenticated") == "true";
            
            if (DateTime.TryParse(sessionExpiry, out var expiryTime))
            {
                var timeUntilExpiry = expiryTime - DateTime.UtcNow;
                
                return new SessionStatusResult
                {
                    IsAuthenticated = isAuthenticated,
                    IsValid = timeUntilExpiry.TotalSeconds > 0,
                    HoursRemaining = Math.Max(0, (int)timeUntilExpiry.TotalHours),
                    MinutesRemaining = Math.Max(0, (int)timeUntilExpiry.TotalMinutes),
                    SecondsRemaining = Math.Max(0, (int)timeUntilExpiry.TotalSeconds),
                    IsNearExpiry = timeUntilExpiry.TotalHours <= 1
                };
            }

            return new SessionStatusResult
            {
                IsAuthenticated = isAuthenticated,
                IsValid = false,
                HoursRemaining = 0,
                MinutesRemaining = 0,
                SecondsRemaining = 0,
                IsNearExpiry = true
            };
        }

        public bool IsSessionNearExpiry(HttpContext httpContext)
        {
            var status = CheckSessionStatus(httpContext);
            return status.IsNearExpiry;
        }

        // Student data management
        public StudentSessionInfo GetCurrentStudentInfo(HttpContext httpContext)
        {
            return new StudentSessionInfo
            {
                StudentId = int.Parse(httpContext.Session.GetString("StudentId") ?? "0"),
                FirstName = httpContext.Session.GetString("FirstName") ?? "",
                LastName = httpContext.Session.GetString("LastName") ?? "",
                Email = httpContext.Session.GetString("UserEmail") ?? "",
                StudentNumber = httpContext.Session.GetString("StudentNumber") ?? "",
                Verified = httpContext.Session.GetString("IsVerified") == "true",
                IsOnboarded = httpContext.Session.GetString("IsOnboarded") == "true",
                HasSection = httpContext.Session.GetString("HasSection") == "true",
                SectionName = httpContext.Session.GetString("SectionName") ?? "No Section Assigned",
                SectionId = int.TryParse(httpContext.Session.GetString("SectionId"), out var sectionId) ? sectionId : null,
                ProgramName = httpContext.Session.GetString("ProgramName") ?? ""
            };
        }

        public void SetDashboardViewBag(dynamic controller, StudentSessionInfo studentInfo, dynamic tempData, bool isNearExpiry)
        {
            controller.ViewBag.WelcomeMessage = $"Welcome back, {studentInfo.FirstName}!";
            controller.ViewBag.IsNearExpiry = isNearExpiry;
            
            // Check if we need to force show onboarding modal
            var forceOnboarding = tempData["ForceOnboarding"]?.ToString() == "true";
            if (forceOnboarding)
            {
                controller.ViewBag.ShowOnboardingAlert = true;
                controller.ViewBag.OnboardingAlertType = "warning";
                controller.ViewBag.OnboardingAlertMessage = "Please complete your account setup to access all features.";
            }
            
            // Check for important notifications
            if (!studentInfo.Verified)
            {
                controller.ViewBag.ShowVerificationAlert = true;
            }
        }

        public IActionResult PerformLegacyLogout(HttpContext httpContext)
        {
            try
            {
                httpContext.Session.Clear();
                System.Threading.Thread.Sleep(800);
                return new RedirectToActionResult("Login", "Auth", new { logout = "true" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Logout error: {ex.Message}");
                return new RedirectToActionResult("Login", "Auth", new { logout = "true" });
            }
        }

        // Onboarding management (from StudentOnboardingService)
        public async Task<OnboardingDataResult> GetAvailableProgramsAsync(string jwtToken)
        {
            try
            {
                var result = await _apiService.GetAvailableProgramsAsync(jwtToken);
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                return new OnboardingDataResult
                {
                    Success = true,
                    Message = "Programs loaded successfully",
                    Data = ParseJsonElementArray(apiResponse, "programs")
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching programs: {ex.Message}");
                return new OnboardingDataResult
                {
                    Success = false,
                    Message = "Unable to load programs",
                    Data = Array.Empty<object>()
                };
            }
        }

        public async Task<OnboardingDataResult> GetAvailableSectionsByProgramAsync(int programId, string jwtToken)
        {
            try
            {
                if (programId <= 0)
                {
                    return new OnboardingDataResult
                    {
                        Success = false,
                        Message = "Invalid program ID",
                        Data = Array.Empty<object>()
                    };
                }

                var result = await _apiService.GetAvailableSectionsByProgramAsync(programId, jwtToken);
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                return new OnboardingDataResult
                {
                    Success = true,
                    Message = "Sections loaded successfully",
                    Data = ParseJsonElementArray(apiResponse, "sections")
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching sections for program {programId}: {ex.Message}");
                return new OnboardingDataResult
                {
                    Success = false,
                    Message = "Unable to load sections",
                    Data = Array.Empty<object>()
                };
            }
        }

        public async Task<OnboardingDataResult> GetAvailableCoursesBySectionAsync(int sectionId, string jwtToken)
        {
            try
            {
                if (sectionId <= 0)
                {
                    return new OnboardingDataResult
                    {
                        Success = false,
                        Message = "Invalid section ID",
                        Data = Array.Empty<object>()
                    };
                }

                var result = await _apiService.GetAvailableCoursesBySectionAsync(sectionId, jwtToken);
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                return new OnboardingDataResult
                {
                    Success = true,
                    Message = "Courses loaded successfully",
                    Data = ParseJsonElementArray(apiResponse, "courses")
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching courses for section {sectionId}: {ex.Message}");
                return new OnboardingDataResult
                {
                    Success = false,
                    Message = "Unable to load courses",
                    Data = Array.Empty<object>()
                };
            }
        }

        public async Task<OnboardingCompletionResult> CompleteOnboardingAsync(JsonElement onboardingData, string jwtToken)
        {
            try
            {
                // Validate that section_id is provided
                if (!onboardingData.TryGetProperty("section_id", out var sectionIdProperty))
                {
                    return new OnboardingCompletionResult
                    {
                        Success = false,
                        Message = "Section selection is required"
                    };
                }

                var sectionId = sectionIdProperty.GetInt32();
                if (sectionId <= 0)
                {
                    return new OnboardingCompletionResult
                    {
                        Success = false,
                        Message = "Invalid section selection"
                    };
                }

                var result = await _apiService.CompleteStudentOnboardingAsync(onboardingData, jwtToken);
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                var completionResult = new OnboardingCompletionResult { SectionId = sectionId };

                if (apiResponse.TryGetProperty("success", out var successProperty))
                    completionResult.Success = successProperty.GetBoolean();
                
                if (apiResponse.TryGetProperty("message", out var messageProperty))
                    completionResult.Message = messageProperty.GetString() ?? "Failed to complete onboarding";
                
                if (apiResponse.TryGetProperty("assigned_courses_count", out var coursesCountProperty))
                    completionResult.AssignedCoursesCount = coursesCountProperty.GetInt32();
                
                if (apiResponse.TryGetProperty("approval_records_created", out var approvalsProperty))
                    completionResult.ApprovalRecordsCreated = approvalsProperty.GetInt32();
                
                if (apiResponse.TryGetProperty("section_name", out var sectionNameProperty))
                    completionResult.SectionName = sectionNameProperty.GetString() ?? "";

                return completionResult;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error completing onboarding: {ex.Message}");
                return new OnboardingCompletionResult
                {
                    Success = false,
                    Message = "Unable to complete onboarding setup. Please try again."
                };
            }
        }

        public void UpdateSessionAfterOnboarding(HttpContext httpContext, OnboardingCompletionResult result)
        {
            if (result.Success)
            {
                httpContext.Session.SetString("IsOnboarded", "true");
                httpContext.Session.SetString("HasSection", "true");
                httpContext.Session.SetString("SectionId", result.SectionId.ToString());
                
                if (!string.IsNullOrEmpty(result.SectionName))
                {
                    httpContext.Session.SetString("SectionName", result.SectionName);
                }
                
                // Log successful onboarding
                var userEmail = httpContext.Session.GetString("UserEmail") ?? "Unknown";
                Console.WriteLine($"Student onboarding completed: {userEmail} assigned to section {result.SectionName} ({result.SectionId}) with {result.AssignedCoursesCount} courses");
            }
        }

        // Private helper methods
        private object[] ParseJsonElementArray(JsonElement apiResponse, string propertyName)
        {
            JsonElement arrayProperty = default;
            
            if (apiResponse.TryGetProperty(propertyName, out arrayProperty))
            {
                // Property found
            }
            else if (apiResponse.ValueKind == JsonValueKind.Array)
            {
                // If the root is an array, treat it as the items list
                arrayProperty = apiResponse;
            }
            
            if (arrayProperty.ValueKind == JsonValueKind.Array)
            {
                var itemsList = new List<object>();
                foreach (var item in arrayProperty.EnumerateArray())
                {
                    var itemDict = new Dictionary<string, object>();
                    
                    foreach (var prop in item.EnumerateObject())
                    {
                        itemDict[prop.Name] = prop.Value.ValueKind switch
                        {
                            JsonValueKind.String => prop.Value.GetString(),
                            JsonValueKind.Number => prop.Value.GetInt32(),
                            JsonValueKind.True => true,
                            JsonValueKind.False => false,
                            _ => prop.Value.ToString()
                        };
                    }
                    
                    itemsList.Add(itemDict);
                }
                
                return itemsList.ToArray();
            }
            
            return Array.Empty<object>();
        }
    }
}
