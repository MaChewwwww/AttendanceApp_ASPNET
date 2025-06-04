using AttendanceApp_ASPNET.Models;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public interface IApiService
    {
        Task<string> ValidateStudentRegistrationAsync(object formData);
        Task<string> ValidateFaceImageAsync(object faceData);
        Task<string> SendRegistrationOTPAsync(object otpData);
        string GetApiKey();
        string GetApiBaseUrl();
    }

    public class ApiService : IApiService
    {
        private readonly string _apiKey;
        private readonly string _apiBaseUrl;
        private readonly HttpClient _httpClient;

        public ApiService(IOptions<ApiSettings> apiSettings, HttpClient httpClient)
        {
            _apiKey = apiSettings.Value.ApiKey;
            _apiBaseUrl = apiSettings.Value.ApiBaseUrl;
            _httpClient = httpClient;
        }

        public string GetApiKey()
        {
            return _apiKey;
        }

        public string GetApiBaseUrl()
        {
            return _apiBaseUrl;
        }

        public async Task<string> ValidateStudentRegistrationAsync(object formData)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}/registerStudent/validate-fields";
                
                var json = JsonSerializer.Serialize(formData);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"API returned {response.StatusCode}: {responseContent}");
                }
                
                return responseContent;
            }
            catch (HttpRequestException httpEx)
            {
                throw new Exception($"HTTP request failed: {httpEx.Message}", httpEx);
            }
            catch (TaskCanceledException tcEx)
            {
                throw new Exception($"Request timeout: {tcEx.Message}", tcEx);
            }
            catch (Exception ex)
            {
                throw new Exception($"API validation failed: {ex.Message}", ex);
            }
        }

        public async Task<string> ValidateFaceImageAsync(object faceData)
        {
            try
            {
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
                    throw new Exception($"Face validation API returned {response.StatusCode}: {responseContent}");
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                throw new Exception($"Face validation failed: {ex.Message}", ex);
            }
        }

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
    }
}
