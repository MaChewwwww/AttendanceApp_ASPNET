using AttendanceApp_ASPNET.Models;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Services
{
    public interface IApiService
    {
        Task<string> ValidateStudentRegistrationAsync(object formData);
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
                
                var json = JsonSerializer.Serialize(formData);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("AttendanceApp-API-Key", _apiKey);
                
                var response = await _httpClient.PostAsync(apiUrl, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                return responseContent;
            }
            catch (Exception ex)
            {
                throw new Exception($"API validation failed: {ex.Message}", ex);
            }
        }
    }
}
