using AttendanceApp_ASPNET.Models;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    // ABSTRACTION: Interface hides complex HTTP communication details
    // Only exposes essential operations that controllers need
    public interface IApiService
    {
        // ABSTRACTION: Abstract method signatures - no implementation details exposed
        Task<string> ValidateStudentRegistrationAsync(object formData);
        Task<string> ValidateFaceImageAsync(object faceData);
        Task<string> SendRegistrationOTPAsync(object otpData);
        Task<string> VerifyOTPAndCompleteRegistrationAsync(object verifyData);
        Task<string> ValidateLoginCredentialsAsync(object loginData);
        Task<string> SendLoginOTPAsync(object loginOTPData);
        Task<string> VerifyLoginOTPAsync(object verifyLoginData);
        Task<string> ValidateForgotPasswordEmailAsync(object emailData);
        Task<string> SendPasswordResetOTPAsync(object resetData);
        Task<string> VerifyPasswordResetOTPAsync(object verifyData);
        Task<string> ResetPasswordWithTokenAsync(object resetData);
        string GetApiKey();
        string GetApiBaseUrl();
        Task<string> GetAuthenticatedDataAsync(string endpoint, string jwtToken);
        Task<string> CheckStudentOnboardingStatusAsync(string jwtToken);
        Task<string> GetAvailableProgramsAsync(string jwtToken);
        Task<string> GetAvailableSectionsByProgramAsync(int programId, string jwtToken);
        Task<string> GetAvailableCoursesBySectionAsync(int sectionId, string jwtToken);
        Task<string> CompleteStudentOnboardingAsync(object onboardingData, string jwtToken);
    }

    // INHERITANCE: ApiService implements IApiService interface
    // Inherits the contract and must implement all interface methods
    public class ApiService : IApiService
    {
        // ENCAPSULATION: Private fields - data hiding from external access
        // Internal implementation details are protected
        private readonly string _apiKey;
        private readonly string _apiBaseUrl;
        private readonly HttpClient _httpClient;

        // ENCAPSULATION: Constructor provides controlled initialization
        // DEPENDENCY INJECTION: Demonstrates polymorphism - can inject different configurations
        public ApiService(IOptions<ApiSettings> apiSettings, HttpClient httpClient)
        {
            _apiKey = apiSettings.Value.ApiKey;
            _apiBaseUrl = apiSettings.Value.ApiBaseUrl;
            _httpClient = httpClient;
        }

        // ENCAPSULATION: Public methods provide controlled access to private data
        public string GetApiKey()
        {
            return _apiKey; // Controlled access to private field
        }

        public string GetApiBaseUrl()
        {
            return _apiBaseUrl; // Controlled access to private field
        }

        // POLYMORPHISM: Same method signature, different implementations possible
        // ABSTRACTION: Complex HTTP logic hidden behind simple method interface
        public async Task<string> ValidateStudentRegistrationAsync(object formData)
        {
            try
            {
                // ENCAPSULATION: Internal HTTP setup logic hidden from caller
                var apiUrl = $"{_apiBaseUrl}/registerStudent/validate-fields";
                
                // ABSTRACTION: JSON serialization complexity hidden
                var json = JsonSerializer.Serialize(formData);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                // ENCAPSULATION: HTTP header configuration encapsulated
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                // ABSTRACTION: HTTP communication complexity abstracted away
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                // ENCAPSULATION: Error handling logic encapsulated within method
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"API returned {response.StatusCode}: {responseContent}");
                }
                
                return responseContent;
            }
            // POLYMORPHISM: Different exception types handled uniformly
            catch (HttpRequestException httpEx)
            {
                // ENCAPSULATION: Error transformation logic hidden from caller
                throw new Exception($"HTTP request failed: {httpEx.Message}", httpEx);
            }
            catch (TaskCanceledException tcEx)
            {
                throw new Exception($"Request timeout: {tcEx.Message}", tcEx);
            }
            catch (Exception ex)
            {
                // POLYMORPHISM: Base Exception type can handle any derived exception
                throw new Exception($"API validation failed: {ex.Message}", ex);
            }
        }

        // POLYMORPHISM: Same method pattern, different endpoint and error messages
        // ABSTRACTION: Face validation complexity hidden behind simple interface
        public async Task<string> ValidateFaceImageAsync(object faceData)
        {
            try
            {
                // ENCAPSULATION: Similar logic pattern but encapsulated separately
                var apiUrl = $"{_apiBaseUrl}/registerStudent/validate-face";
                
                var json = JsonSerializer.Serialize(faceData);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    // POLYMORPHISM: Same exception type, different message content
                    throw new Exception($"Face validation API returned {response.StatusCode}: {responseContent}");
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                // ABSTRACTION: Complex error details abstracted to simple message
                throw new Exception($"Face validation failed: {ex.Message}", ex);
            }
        }

        // POLYMORPHISM: Consistent method signature across different operations
        public async Task<string> SendRegistrationOTPAsync(object otpData)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}/registerStudent/send-otp";
                
                var json = JsonSerializer.Serialize(otpData);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"OTP API returned {response.StatusCode}: {responseContent}");
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                throw new Exception($"Send OTP failed: {ex.Message}", ex);
            }
        }

        // INHERITANCE: Must implement all interface methods due to contract
        public async Task<string> VerifyOTPAndCompleteRegistrationAsync(object verifyData)
        {
            try
            {
                // ENCAPSULATION: Implementation details will be hidden here
                var apiUrl = $"{_apiBaseUrl}/registerStudent/verify-registration";
                
                var json = JsonSerializer.Serialize(verifyData);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Verify OTP API returned {response.StatusCode}: {responseContent}");
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                throw new Exception($"Verify OTP and complete registration failed: {ex.Message}", ex);
            }
        }

        public async Task<string> ValidateLoginCredentialsAsync(object loginData)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}/loginStudent/validate-fields";
                
                var json = JsonSerializer.Serialize(loginData);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Login validation API returned {response.StatusCode}: {responseContent}");
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                throw new Exception($"Login validation failed: {ex.Message}", ex);
            }
        }

        public async Task<string> SendLoginOTPAsync(object loginOTPData)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}/loginStudent/send-login-otp";
                
                var json = JsonSerializer.Serialize(loginOTPData);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Login OTP API returned {response.StatusCode}: {responseContent}");
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                throw new Exception($"Send login OTP failed: {ex.Message}", ex);
            }
        }

        public async Task<string> VerifyLoginOTPAsync(object verifyLoginData)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}/loginStudent/verify-login-otp";
                
                var json = JsonSerializer.Serialize(verifyLoginData);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    // Return a structured error response instead of throwing
                    var errorResponse = new
                    {
                        success = false,
                        message = $"API returned {response.StatusCode}: {responseContent}",
                        user = (object)null,
                        token = (object)null,
                        redirect_url = (object)null
                    };
                    return JsonSerializer.Serialize(errorResponse);
                }
                
                // Ensure we always return valid JSON
                if (string.IsNullOrWhiteSpace(responseContent))
                {
                    var emptyResponse = new
                    {
                        success = false,
                        message = "Empty response from API",
                        user = (object)null,
                        token = (object)null,
                        redirect_url = (object)null
                    };
                    return JsonSerializer.Serialize(emptyResponse);
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                // Return structured error response instead of throwing
                var errorResponse = new
                {
                    success = false,
                    message = $"OTP verification failed: {ex.Message}",
                    user = (object)null,
                    token = (object)null,
                    redirect_url = (object)null
                };
                return JsonSerializer.Serialize(errorResponse);
            }
        }

        public async Task<string> ValidateForgotPasswordEmailAsync(object emailData)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}/forgotPassword/validate-email";
                
                var json = JsonSerializer.Serialize(emailData);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Forgot password email validation API returned {response.StatusCode}: {responseContent}");
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                throw new Exception($"Forgot password email validation failed: {ex.Message}", ex);
            }
        }

        public async Task<string> SendPasswordResetOTPAsync(object resetData)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}/forgotPassword/send-reset-otp";
                
                var json = JsonSerializer.Serialize(resetData);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Send password reset OTP API returned {response.StatusCode}: {responseContent}");
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                throw new Exception($"Send password reset OTP failed: {ex.Message}", ex);
            }
        }

        public async Task<string> VerifyPasswordResetOTPAsync(object verifyData)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}/forgotPassword/verify-otp";
                
                var json = JsonSerializer.Serialize(verifyData);
                
                // Debug: Log what we're sending
                Console.WriteLine($"=== API SERVICE DEBUG ===");
                Console.WriteLine($"Sending to: {apiUrl}");
                Console.WriteLine($"JSON payload: {json}");
                Console.WriteLine("=========================");
                
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                // Debug: Log the response
                Console.WriteLine($"=== API RESPONSE DEBUG ===");
                Console.WriteLine($"Status: {response.StatusCode}");
                Console.WriteLine($"Response: {responseContent}");
                Console.WriteLine("==========================");
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Verify password reset OTP API returned {response.StatusCode}: {responseContent}");
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                throw new Exception($"Verify password reset OTP failed: {ex.Message}", ex);
            }
        }

        public async Task<string> ResetPasswordWithTokenAsync(object resetData)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}/forgotPassword/reset-password";
                
                var json = JsonSerializer.Serialize(resetData);
                
                // Debug: Log what we're sending
                Console.WriteLine($"=== RESET PASSWORD API SERVICE DEBUG ===");
                Console.WriteLine($"Sending to: {apiUrl}");
                Console.WriteLine($"JSON payload: {json}");
                Console.WriteLine("========================================");
                
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                // Debug: Log the response
                Console.WriteLine($"=== RESET PASSWORD API RESPONSE DEBUG ===");
                Console.WriteLine($"Status: {response.StatusCode}");
                Console.WriteLine($"Response: {responseContent}");
                Console.WriteLine("==========================================");
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Reset password API returned {response.StatusCode}: {responseContent}");
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                throw new Exception($"Reset password with token failed: {ex.Message}", ex);
            }
        }

        public async Task<string> GetAuthenticatedDataAsync(string endpoint, string jwtToken)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}/{endpoint}";
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                // Add JWT token to Authorization header
                if (!string.IsNullOrEmpty(jwtToken))
                {
                    _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {jwtToken}");
                }
                
                var response = await _httpClient.GetAsync(apiUrl);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Authenticated API call failed {response.StatusCode}: {responseContent}");
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                throw new Exception($"Authenticated API call failed: {ex.Message}", ex);
            }
        }

        public async Task<string> CheckStudentOnboardingStatusAsync(string jwtToken)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}/student/onboarding/status";
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                // Add JWT token to Authorization header
                if (!string.IsNullOrEmpty(jwtToken))
                {
                    _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {jwtToken}");
                }
                
                var response = await _httpClient.GetAsync(apiUrl);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    // Return structured error response instead of throwing
                    var errorResponse = new
                    {
                        is_onboarded = false,
                        message = $"API returned {response.StatusCode}: {responseContent}",
                        has_section = false,
                        student_info = (object)null
                    };
                    return JsonSerializer.Serialize(errorResponse);
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                // Return structured error response instead of throwing
                var errorResponse = new
                {
                    is_onboarded = false,
                    message = $"Onboarding status check failed: {ex.Message}",
                    has_section = false,
                    student_info = (object)null
                };
                return JsonSerializer.Serialize(errorResponse);
            }
        }

        public async Task<string> GetAvailableProgramsAsync(string jwtToken)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}/student/onboarding/programs";
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                // Add JWT token to Authorization header
                if (!string.IsNullOrEmpty(jwtToken))
                {
                    _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {jwtToken}");
                }
                
                var response = await _httpClient.GetAsync(apiUrl);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorResponse = new
                    {
                        programs = new object[0],
                        message = $"API returned {response.StatusCode}: {responseContent}"
                    };
                    return JsonSerializer.Serialize(errorResponse);
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                var errorResponse = new
                {
                    programs = new object[0],
                    message = $"Failed to fetch programs: {ex.Message}"
                };
                return JsonSerializer.Serialize(errorResponse);
            }
        }

        public async Task<string> GetAvailableSectionsByProgramAsync(int programId, string jwtToken)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}/student/onboarding/sections/{programId}";
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                // Add JWT token to Authorization header
                if (!string.IsNullOrEmpty(jwtToken))
                {
                    _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {jwtToken}");
                }
                
                var response = await _httpClient.GetAsync(apiUrl);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorResponse = new
                    {
                        sections = new object[0],
                        message = $"API returned {response.StatusCode}: {responseContent}"
                    };
                    return JsonSerializer.Serialize(errorResponse);
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                var errorResponse = new
                {
                    sections = new object[0],
                    message = $"Failed to fetch sections: {ex.Message}"
                };
                return JsonSerializer.Serialize(errorResponse);
            }
        }

        public async Task<string> GetAvailableCoursesBySectionAsync(int sectionId, string jwtToken)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}/student/onboarding/courses/{sectionId}";
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                // Add JWT token to Authorization header
                if (!string.IsNullOrEmpty(jwtToken))
                {
                    _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {jwtToken}");
                }
                
                var response = await _httpClient.GetAsync(apiUrl);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorResponse = new
                    {
                        courses = new object[0],
                        message = $"API returned {response.StatusCode}: {responseContent}"
                    };
                    return JsonSerializer.Serialize(errorResponse);
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                var errorResponse = new
                {
                    courses = new object[0],
                    message = $"Failed to fetch assigned courses: {ex.Message}"
                };
                return JsonSerializer.Serialize(errorResponse);
            }
        }

        public async Task<string> CompleteStudentOnboardingAsync(object onboardingData, string jwtToken)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}/student/onboarding/assign-section";
                
                var json = JsonSerializer.Serialize(onboardingData);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                // Add JWT token to Authorization header
                if (!string.IsNullOrEmpty(jwtToken))
                {
                    _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {jwtToken}");
                }
                
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorResponse = new
                    {
                        success = false,
                        message = $"API returned {response.StatusCode}: {responseContent}"
                    };
                    return JsonSerializer.Serialize(errorResponse);
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                var errorResponse = new
                {
                    success = false,
                    message = $"Failed to complete onboarding: {ex.Message}"
                };
                return JsonSerializer.Serialize(errorResponse);
            }
        }
    }
}
