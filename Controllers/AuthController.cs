using AttendanceApp_ASPNET.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace AttendanceApp_ASPNET.Controllers
{
    public class AuthController : Controller
    {
        private readonly IApiService _apiService;

        public AuthController(IApiService apiService)
        {
            _apiService = apiService;
        }

        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> ValidateRegistration([FromBody] JsonElement formData)
        {
            try
            {
                // Convert JsonElement to object for API call
                var formDataObject = new
                {
                    first_name = formData.GetProperty("first_name").GetString(),
                    last_name = formData.GetProperty("last_name").GetString(),
                    birthday = formData.GetProperty("birthday").GetString(),
                    contact_number = formData.GetProperty("contact_number").GetString(),
                    student_number = formData.GetProperty("student_number").GetString(),
                    email = formData.GetProperty("email").GetString(),
                    password = formData.GetProperty("password").GetString(),
                    confirm_password = formData.GetProperty("confirm_password").GetString(),
                    terms = formData.GetProperty("terms").GetBoolean()
                };

                var result = await _apiService.ValidateStudentRegistrationAsync(formDataObject);
                
                // Parse the API response
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                // Handle your Python API's response format with is_valid
                bool isValid = false;
                string[] errors = new string[0];
                
                if (apiResponse.TryGetProperty("is_valid", out var isValidProperty))
                {
                    isValid = isValidProperty.GetBoolean();
                }
                
                if (apiResponse.TryGetProperty("errors", out var errorsProperty) && errorsProperty.ValueKind == JsonValueKind.Array)
                {
                    errors = errorsProperty.EnumerateArray().Select(e => e.GetString()).ToArray();
                }
                
                return Json(new { 
                    success = isValid,
                    errors = errors
                });
            }
            catch (Exception ex)
            {
                return Json(new { 
                    success = false, 
                    errors = new[] { $"Validation failed: {ex.Message}" } 
                });
            }
        }

        public IActionResult Login()
        {
            return View();
        }
    }
}
