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

        [HttpPost]
        public async Task<IActionResult> SendRegistrationOTP([FromBody] JsonElement requestData)
        {
            try
            {
                // Extract registration data and face image
                var registrationData = requestData.GetProperty("registration_data");
                var faceImage = requestData.GetProperty("face_image").GetString() ?? "";

                // Convert registration data to the format expected by Python API
                var registrationDataObject = new
                {
                    first_name = registrationData.GetProperty("first_name").GetString() ?? "",
                    last_name = registrationData.GetProperty("last_name").GetString() ?? "",
                    birthday = registrationData.GetProperty("birthday").GetString() ?? "",
                    contact_number = registrationData.GetProperty("contact_number").GetString() ?? "",
                    student_number = registrationData.GetProperty("student_number").GetString() ?? "",
                    email = registrationData.GetProperty("email").GetString() ?? "",
                    password = registrationData.GetProperty("password").GetString() ?? ""
                };

                var otpRequestData = new
                {
                    registration_data = registrationDataObject,
                    face_image = faceImage
                };

                var result = await _apiService.SendRegistrationOTPAsync(otpRequestData);
                
                // Parse the API response
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                bool success = false;
                string message = "Failed to send OTP";
                string otpId = "";
                
                if (apiResponse.TryGetProperty("success", out var successProperty))
                {
                    success = successProperty.GetBoolean();
                }
                
                if (apiResponse.TryGetProperty("message", out var messageProperty))
                {
                    message = messageProperty.GetString() ?? message;
                }
                
                if (apiResponse.TryGetProperty("otp_id", out var otpIdProperty))
                {
                    // Handle both string and number types for otp_id
                    if (otpIdProperty.ValueKind == JsonValueKind.String)
                    {
                        otpId = otpIdProperty.GetString() ?? "";
                    }
                    else if (otpIdProperty.ValueKind == JsonValueKind.Number)
                    {
                        otpId = otpIdProperty.GetInt64().ToString();
                    }
                    else
                    {
                        otpId = otpIdProperty.ToString();
                    }
                }
                
                var response = new { 
                    success = success,
                    message = message,
                    otp_id = otpId
                };
                
                return Json(response);
            }
            catch (Exception ex)
            {
                return Json(new { 
                    success = false, 
                    message = $"Failed to send OTP: {ex.Message}",
                    otp_id = ""
                });
            }
        }

        public IActionResult RegisterStep2()
        {
            return View();
        }

        public IActionResult RegisterStep3()
        {
            return View();
        }

        public IActionResult RegisterStep4()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> VerifyOTPAndCompleteRegistration([FromBody] JsonElement requestData)
        {
            try
            {
                // Extract OTP ID and OTP code
                var otpId = requestData.GetProperty("otp_id").GetString() ?? "";
                var otpCode = requestData.GetProperty("otp_code").GetString() ?? "";

                // Convert to the format expected by Python API
                var verifyOtpData = new
                {
                    otp_id = otpId,
                    otp_code = otpCode
                };

                var result = await _apiService.VerifyOTPAndCompleteRegistrationAsync(verifyOtpData);
                
                // Parse the API response
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                bool success = false;
                string message = "Registration failed";
                JsonElement userInfo = default;
                
                if (apiResponse.TryGetProperty("status", out var statusProperty))
                {
                    success = statusProperty.GetString() == "success";
                }
                
                if (apiResponse.TryGetProperty("message", out var messageProperty))
                {
                    message = messageProperty.GetString() ?? message;
                }
                
                if (apiResponse.TryGetProperty("user", out var userProperty))
                {
                    userInfo = userProperty;
                }
                
                var response = new { 
                    success = success,
                    message = message,
                    user = userInfo.ValueKind != JsonValueKind.Undefined ? userInfo : (object?)null
                };
                
                return Json(response);
            }
            catch (Exception ex)
            {
                return Json(new { 
                    success = false, 
                    message = $"Failed to verify OTP and complete registration: {ex.Message}",
                    user = (object?)null
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> ResendRegistrationOTP([FromBody] JsonElement requestData)
        {
            try
            {
                // This can reuse the same SendRegistrationOTP endpoint
                return await SendRegistrationOTP(requestData);
            }
            catch (Exception ex)
            {
                return Json(new { 
                    success = false, 
                    message = $"Failed to resend OTP: {ex.Message}",
                    otp_id = ""
                });
            }
        }
    }
}
