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
                
                return Json(new { 
                    success = apiResponse.GetProperty("success").GetBoolean(),
                    errors = apiResponse.TryGetProperty("errors", out var errorsProperty) 
                        ? errorsProperty.EnumerateArray().Select(e => e.GetString()).ToArray()
                        : new string[0]
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
