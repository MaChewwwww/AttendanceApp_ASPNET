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
                // Convert JsonElement to object for API call - matching Python model structure
                var formDataObject = new
                {
                    first_name = formData.GetProperty("first_name").GetString() ?? "",
                    last_name = formData.GetProperty("last_name").GetString() ?? "",
                    birthday = formData.GetProperty("birthday").GetString() ?? "",
                    contact_number = formData.GetProperty("contact_number").GetString() ?? "",
                    student_number = formData.GetProperty("student_number").GetString() ?? "",
                    email = formData.GetProperty("email").GetString() ?? "",
                    password = formData.GetProperty("password").GetString() ?? ""
                    // Note: We don't send confirm_password and terms to Python API
                };

                var result = await _apiService.ValidateStudentRegistrationAsync(formDataObject);
                
                // Parse the API response
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                // Handle your Python API's response format
                bool isValid = false;
                string[] errors = Array.Empty<string>();
                string message = "";
                
                if (apiResponse.TryGetProperty("is_valid", out var isValidProperty))
                {
                    isValid = isValidProperty.GetBoolean();
                }
                
                if (apiResponse.TryGetProperty("message", out var messageProperty))
                {
                    message = messageProperty.GetString() ?? "";
                }
                
                if (apiResponse.TryGetProperty("errors", out var errorsProperty) && errorsProperty.ValueKind == JsonValueKind.Array)
                {
                    errors = errorsProperty.EnumerateArray()
                        .Select(e => e.GetString())
                        .Where(e => !string.IsNullOrEmpty(e))
                        .ToArray();
                }
                
                var response = new { 
                    success = isValid,
                    message = message,
                    errors = errors
                };
                
                return Json(response);
            }
            catch (Exception ex)
            {
                return Json(new { 
                    success = false, 
                    message = "Validation failed",
                    errors = new[] { $"Validation failed: {ex.Message}" } 
                });
            }
        }

        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> ValidateFaceImage([FromBody] JsonElement faceData)
        {
            try
            {
                // Convert JsonElement to object for API call
                var faceDataObject = new
                {
                    face_image = faceData.GetProperty("face_image").GetString() ?? ""
                };

                var result = await _apiService.ValidateFaceImageAsync(faceDataObject);
                
                // Parse the API response
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                // Handle your Python API's response format
                bool isValid = false;
                string message = "Face validation failed";
                
                if (apiResponse.TryGetProperty("is_valid", out var isValidProperty))
                {
                    isValid = isValidProperty.GetBoolean();
                }
                
                if (apiResponse.TryGetProperty("message", out var messageProperty))
                {
                    message = messageProperty.GetString() ?? message;
                }
                
                var response = new { 
                    success = isValid,
                    message = message
                };
                
                return Json(response);
            }
            catch (Exception ex)
            {
                return Json(new { 
                    success = false, 
                    message = $"Face validation failed: {ex.Message}" 
                });
            }
        }
    }
}
