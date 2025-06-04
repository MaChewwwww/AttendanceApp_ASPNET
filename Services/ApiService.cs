using AttendanceApp_ASPNET.Models;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public interface IApiService
    {
        Task<string> ValidateStudentRegistrationAsync(object formData);
        Task<string> ValidateFaceImageAsync(object faceData);
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
                var apiUrl = $"{_apiBaseUrl}/registerStudent/validate-fields";  // http://localhost:8000/registerStudent/validate-fields
                
                Console.WriteLine($"=== API Service Call ===");
                Console.WriteLine($"API URL: {apiUrl}");
                Console.WriteLine($"API Key: {(_apiKey != null && _apiKey.Length > 10 ? _apiKey.Substring(0, 10) + "..." : _apiKey ?? "null")}");
                
                var json = JsonSerializer.Serialize(formData);
                Console.WriteLine($"Request body: {json}");
                
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                Console.WriteLine("Sending HTTP request...");
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                Console.WriteLine($"Response status: {response.StatusCode}");
                Console.WriteLine($"Response content: {responseContent}");
                
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"API returned error status: {response.StatusCode}");
                    throw new Exception($"API returned {response.StatusCode}: {responseContent}");
                }
                
                return responseContent;
            }
            catch (HttpRequestException httpEx)
            {
                Console.WriteLine($"HTTP Request failed: {httpEx.Message}");
                throw new Exception($"HTTP request failed: {httpEx.Message}", httpEx);
            }
            catch (TaskCanceledException tcEx)
            {
                Console.WriteLine($"Request timeout: {tcEx.Message}");
                throw new Exception($"Request timeout: {tcEx.Message}", tcEx);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"API call failed: {ex.Message}");
                throw new Exception($"API validation failed: {ex.Message}", ex);
            }
        }

        public async Task<string> ValidateFaceImageAsync(object faceData)
        {
            try
            {
                var apiUrl = $"{_apiBaseUrl}/registerStudent/validate-face";  // http://localhost:8000/registerStudent/validate-face
                
                Console.WriteLine($"=== Face Validation API Call ===");
                Console.WriteLine($"API URL: {apiUrl}");
                
                var json = JsonSerializer.Serialize(faceData);
                Console.WriteLine($"Face validation request sent");
                
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AttendanceApp-ASPNET/1.0");
                
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                Console.WriteLine($"Face validation response status: {response.StatusCode}");
                Console.WriteLine($"Face validation response: {responseContent}");
                
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Face validation API returned {response.StatusCode}: {responseContent}");
                }
                
                return responseContent;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Face validation API call failed: {ex.Message}");
                throw new Exception($"Face validation failed: {ex.Message}", ex);
            }
        }
    }
}
