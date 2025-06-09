using AttendanceApp_ASPNET.Controllers.Base;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public interface IStudentManagementService
    {
        // Session management
        bool ValidateAuthentication(HttpContext httpContext);
        string GetJwtToken(HttpContext httpContext);
        SessionStatusResult CheckSessionStatus(HttpContext httpContext);
        bool IsSessionNearExpiry(HttpContext httpContext);
        
        // Student data management
        StudentSessionInfo GetCurrentStudentInfo(HttpContext httpContext);
        void SetDashboardViewBag(dynamic controller, StudentSessionInfo studentInfo, dynamic tempData, bool isNearExpiry);
        Microsoft.AspNetCore.Mvc.IActionResult PerformLegacyLogout(HttpContext httpContext);
        
        // Onboarding management
        Task<OnboardingDataResult> GetAvailableProgramsAsync(string jwtToken);
        Task<OnboardingDataResult> GetAvailableSectionsByProgramAsync(int programId, string jwtToken);
        Task<OnboardingDataResult> GetAvailableCoursesBySectionAsync(int sectionId, string jwtToken);
        Task<OnboardingCompletionResult> CompleteOnboardingAsync(JsonElement onboardingData, string jwtToken);
        void UpdateSessionAfterOnboarding(HttpContext httpContext, OnboardingCompletionResult result);
    }

    public class SessionStatusResult
    {
        public bool IsAuthenticated { get; set; }
        public bool IsValid { get; set; }
        public int HoursRemaining { get; set; }
        public int MinutesRemaining { get; set; }
        public int SecondsRemaining { get; set; }
        public bool IsNearExpiry { get; set; }
    }

    public class OnboardingDataResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public object[] Data { get; set; } = Array.Empty<object>();
    }

    public class OnboardingCompletionResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int AssignedCoursesCount { get; set; }
        public int ApprovalRecordsCreated { get; set; }
        public string SectionName { get; set; } = string.Empty;
        public int SectionId { get; set; }
    }
}
