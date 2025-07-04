﻿using AttendanceApp_ASPNET.Services;
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
            // Check if user is already authenticated
            var isAuthenticated = HttpContext.Session.GetString("IsAuthenticated");
            if (!string.IsNullOrEmpty(isAuthenticated) && isAuthenticated == "true")
            {
                var userRole = HttpContext.Session.GetString("UserRole");
                
                // Redirect based on role
                switch (userRole?.ToLower())
                {
                    case "student":
                        TempData["InfoMessage"] = "You are already logged in.";
                        return RedirectToAction("Dashboard", "Student");
                    case "faculty":
                    case "teacher":
                    case "instructor":
                        TempData["InfoMessage"] = "You are already logged in.";
                        return RedirectToAction("Dashboard", "Faculty");
                    case "admin":
                    case "administrator":
                        TempData["InfoMessage"] = "You are already logged in.";
                        return RedirectToAction("Dashboard", "Admin");
                    default:
                        // Default to student dashboard
                        TempData["InfoMessage"] = "You are already logged in.";
                        return RedirectToAction("Dashboard", "Student");
                }
            }
            
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
            // Check if user is already authenticated
            var isAuthenticated = HttpContext.Session.GetString("IsAuthenticated");
            if (!string.IsNullOrEmpty(isAuthenticated) && isAuthenticated == "true")
            {
                var userRole = HttpContext.Session.GetString("UserRole");
                
                // Debug output to trace role and redirection
                Console.WriteLine($"=== LOGIN REDIRECTION DEBUG ===");
                Console.WriteLine($"User is authenticated: {isAuthenticated}");
                Console.WriteLine($"User role from session: '{userRole}'");
                Console.WriteLine($"Role type: {(userRole == null ? "null" : userRole.GetType().Name)}");
                Console.WriteLine($"Role lowercase: '{userRole?.ToLower()}'");
                
                // Add standard message for all redirects
                TempData["InfoMessage"] = "You are already logged in.";
                
                // Debug the switch case evaluation
                string redirectTarget = "Unknown";
                
                switch (userRole?.ToLower())
                {
                    case "student":
                        redirectTarget = "Student/Dashboard";
                        Console.WriteLine("Role matched: student");
                        break;
                    case "faculty":
                        redirectTarget = "Faculty/Dashboard";
                        Console.WriteLine("Role matched: faculty");
                        break;
                    case "teacher":
                        redirectTarget = "Faculty/Dashboard";
                        Console.WriteLine("Role matched: teacher");
                        break;
                    case "instructor":
                        redirectTarget = "Faculty/Dashboard";
                        Console.WriteLine("Role matched: instructor");
                        break;
                    case "admin":
                        redirectTarget = "Admin/Dashboard";
                        Console.WriteLine("Role matched: admin");
                        break;
                    case "administrator":
                        redirectTarget = "Admin/Dashboard";
                        Console.WriteLine("Role matched: administrator");
                        break;
                    default:
                        redirectTarget = "Student/Dashboard";
                        Console.WriteLine("Role match defaulted to: Student/Dashboard");
                        break;
                }
                
                Console.WriteLine($"Redirecting to: {redirectTarget}");
                Console.WriteLine("===============================");
                
                // Redirect based on role with simplified switch expression
                return userRole?.ToLower() switch
                {
                    "student" => RedirectToAction("Dashboard", "Student"),
                    "faculty" => RedirectToAction("Dashboard", "Faculty"),
                    "teacher" => RedirectToAction("Dashboard", "Faculty"),
                    "instructor" => RedirectToAction("Dashboard", "Faculty"),
                    "admin" => RedirectToAction("Dashboard", "Admin"),
                    "administrator" => RedirectToAction("Dashboard", "Admin"),
                    _ => RedirectToAction("Dashboard", "Student") // Default to Student dashboard
                };
            }
            
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
            // Check if user is already authenticated
            var isAuthenticated = HttpContext.Session.GetString("IsAuthenticated");
            if (!string.IsNullOrEmpty(isAuthenticated) && isAuthenticated == "true")
            {
                var userRole = HttpContext.Session.GetString("UserRole");
                TempData["InfoMessage"] = "You are already logged in.";
                
                return userRole?.ToLower() switch
                {
                    "student" => RedirectToAction("Dashboard", "Student"),
                    "faculty" or "teacher" or "instructor" => RedirectToAction("Dashboard", "Faculty"),
                    "admin" or "administrator" => RedirectToAction("Dashboard", "Admin"),
                    _ => RedirectToAction("Dashboard", "Student")
                };
            }
            
            return View();
        }

        public IActionResult RegisterStep3()
        {
            // Check if user is already authenticated
            var isAuthenticated = HttpContext.Session.GetString("IsAuthenticated");
            if (!string.IsNullOrEmpty(isAuthenticated) && isAuthenticated == "true")
            {
                var userRole = HttpContext.Session.GetString("UserRole");
                TempData["InfoMessage"] = "You are already logged in.";
                
                return userRole?.ToLower() switch
                {
                    "student" => RedirectToAction("Dashboard", "Student"),
                    "faculty" or "teacher" or "instructor" => RedirectToAction("Dashboard", "Faculty"),
                    "admin" or "administrator" => RedirectToAction("Dashboard", "Admin"),
                    _ => RedirectToAction("Dashboard", "Student")
                };
            }
            
            return View();
        }

        public IActionResult RegisterStep4()
        {
            // Check if user is already authenticated
            var isAuthenticated = HttpContext.Session.GetString("IsAuthenticated");
            if (!string.IsNullOrEmpty(isAuthenticated) && isAuthenticated == "true")
            {
                var userRole = HttpContext.Session.GetString("UserRole");
                TempData["InfoMessage"] = "You are already logged in.";
                
                return userRole?.ToLower() switch
                {
                    "student" => RedirectToAction("Dashboard", "Student"),
                    "faculty" or "teacher" or "instructor" => RedirectToAction("Dashboard", "Faculty"),
                    "admin" or "administrator" => RedirectToAction("Dashboard", "Admin"),
                    _ => RedirectToAction("Dashboard", "Student")
                };
            }
            
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

        [HttpPost]
        public async Task<IActionResult> ValidateLogin([FromBody] JsonElement loginData)
        {
            try
            {
                // Convert JsonElement to object for API call - matching Python model structure
                var loginDataObject = new
                {
                    email = loginData.GetProperty("email").GetString() ?? "",
                    password = loginData.GetProperty("password").GetString() ?? ""
                };

                var result = await _apiService.ValidateLoginCredentialsAsync(loginDataObject);
                
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
                    var apiMessage = messageProperty.GetString() ?? "";
                    
                    // Provide user-friendly message
                    if (!isValid)
                    {
                        message = "Invalid email or password. Please check your credentials and try again.";
                    }
                    else
                    {
                        message = apiMessage;
                    }
                }
                
                if (apiResponse.TryGetProperty("errors", out var errorsProperty) && errorsProperty.ValueKind == JsonValueKind.Array)
                {
                    // Transform API errors to user-friendly messages
                    var apiErrors = errorsProperty.EnumerateArray()
                        .Select(e => e.GetString())
                        .Where(e => !string.IsNullOrEmpty(e))
                        .ToArray();
                    
                    if (!isValid && apiErrors.Length > 0)
                    {
                        errors = new[] { "Invalid email or password. Please check your credentials and try again." };
                    }
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
                // Log the actual error for debugging but show user-friendly message
                Console.WriteLine($"Login validation error: {ex.Message}");
                
                return Json(new { 
                    success = false, 
                    message = "Unable to validate login. Please try again.",
                    errors = new[] { "Unable to validate login. Please try again." } 
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> SendLoginOTP([FromBody] JsonElement requestData)
        {
            try
            {
                // Extract email from request
                var email = requestData.GetProperty("email").GetString() ?? "";

                // Convert to the format expected by Python API
                var loginOTPData = new
                {
                    email = email
                };

                var result = await _apiService.SendLoginOTPAsync(loginOTPData);
                
                // Parse the API response
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                bool success = false;
                string message = "Unable to send verification code. Please try again.";
                string otpId = "";
                
                if (apiResponse.TryGetProperty("success", out var successProperty))
                {
                    success = successProperty.GetBoolean();
                }
                
                if (apiResponse.TryGetProperty("message", out var messageProperty))
                {
                    var apiMessage = messageProperty.GetString() ?? "";
                    
                    // Provide user-friendly messages
                    if (success)
                    {
                        message = "Verification code sent successfully!";
                    }
                    else
                    {
                        if (apiMessage.Contains("not found", StringComparison.OrdinalIgnoreCase) ||
                            apiMessage.Contains("invalid email", StringComparison.OrdinalIgnoreCase))
                        {
                            message = "Account not found. Please check your email address.";
                        }
                        else if (apiMessage.Contains("rate limit", StringComparison.OrdinalIgnoreCase) ||
                                apiMessage.Contains("too many", StringComparison.OrdinalIgnoreCase))
                        {
                            message = "Too many requests. Please wait before requesting another code.";
                        }
                        else
                        {
                            message = "Unable to send verification code. Please try again.";
                        }
                    }
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
                // Log the actual error for debugging
                Console.WriteLine($"Send login OTP error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                return Json(new { 
                    success = false, 
                    message = "Unable to send verification code. Please try again later.",
                    otp_id = ""
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> VerifyLoginOTP([FromBody] JsonElement requestData)
        {
            try
            {
                // Safely extract OTP ID and code with null checks
                string otpId = "";
                string otpCode = "";
                
                if (requestData.TryGetProperty("otp_id", out var otpIdProperty))
                {
                    otpId = otpIdProperty.GetString() ?? "";
                }
                
                if (requestData.TryGetProperty("otp_code", out var otpCodeProperty))
                {
                    otpCode = otpCodeProperty.GetString() ?? "";
                }
                
                // Validate input
                if (string.IsNullOrEmpty(otpId))
                {
                    return Json(new { 
                        success = false, 
                        message = "OTP session expired. Please try logging in again.",
                        user = (object)null,
                        token = (object)null,
                        redirect_url = (object)null
                    });
                }
                
                if (string.IsNullOrEmpty(otpCode))
                {
                    return Json(new { 
                        success = false, 
                        message = "Please enter the verification code.",
                        user = (object)null,
                        token = (object)null,
                        redirect_url = (object)null
                    });
                }

                // Convert to the format expected by Python API
                var verifyOtpData = new
                {
                    otp_id = otpId,
                    otp_code = otpCode
                };

                var result = await _apiService.VerifyLoginOTPAsync(verifyOtpData);
                
                Console.WriteLine($"=== VERIFY LOGIN OTP DEBUG ===");
                Console.WriteLine($"Raw API response: {result}");
                
                // Handle null or empty API response
                if (string.IsNullOrWhiteSpace(result))
                {
                    return Json(new { 
                        success = false, 
                        message = "Unable to verify code at this time. Please try again.",
                        user = (object)null,
                        token = (object)null,
                        redirect_url = (object)null
                    });
                }
                
                // Parse the API response with null safety
                JsonElement apiResponse;
                try
                {
                    apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                }
                catch (JsonException)
                {
                    return Json(new { 
                        success = false, 
                        message = "Invalid server response. Please try again.",
                        user = (object)null,
                        token = (object)null,
                        redirect_url = (object)null
                    });
                }
                
                bool success = false;
                string message = "Verification failed";
                JsonElement userInfo = default;
                string token = "";
                string userRole = "student";
                string redirectUrl = "/Student/Dashboard";
                
                // Safely extract success property
                if (apiResponse.TryGetProperty("success", out var successProperty))
                {
                    success = successProperty.GetBoolean();
                }
                
                // Safely extract message property
                if (apiResponse.TryGetProperty("message", out var messageProperty))
                {
                    var apiMessage = messageProperty.GetString() ?? "";
                    if (!success)
                    {
                        if (apiMessage.Contains("expired", StringComparison.OrdinalIgnoreCase))
                        {
                            message = "Verification code has expired. Please request a new code.";
                        }
                        else if (apiMessage.Contains("invalid", StringComparison.OrdinalIgnoreCase) || 
                                apiMessage.Contains("incorrect", StringComparison.OrdinalIgnoreCase))
                        {
                            message = "Invalid verification code. Please check your code and try again.";
                        }
                        else if (apiMessage.Contains("not found", StringComparison.OrdinalIgnoreCase))
                        {
                            message = "OTP session not found. Please try logging in again.";
                        }
                        else
                        {
                            message = !string.IsNullOrEmpty(apiMessage) ? apiMessage : "Unable to verify code at this time. Please try again.";
                        }
                    }
                    else
                    {
                        message = !string.IsNullOrEmpty(apiMessage) ? apiMessage : "Login successful!";
                    }
                }
                
                // Safely extract user information with detailed logging
                if (apiResponse.TryGetProperty("user", out var userProperty) && userProperty.ValueKind != JsonValueKind.Null)
                {
                    userInfo = userProperty;
                    Console.WriteLine($"User info found in response: {userInfo.ToString()}");
                    
                    // Extract role from Python API response structure with detailed logging
                    if (userInfo.TryGetProperty("role", out var roleProp))
                    {
                        var roleFromApi = roleProp.GetString();
                        Console.WriteLine($"Role property found: '{roleFromApi}', type: {roleProp.ValueKind}");
                        userRole = roleFromApi?.ToLower() ?? "student";
                        Console.WriteLine($"Role after normalization: '{userRole}'");
                    }
                    else if (userInfo.TryGetProperty("student_number", out var studentNumberProp) && 
                             !string.IsNullOrEmpty(studentNumberProp.GetString()))
                    {
                        Console.WriteLine("No role property found, but student_number exists - defaulting to 'student' role");
                        userRole = "student";
                    }
                    else
                    {
                        Console.WriteLine("No role property found, defaulting to 'student'");
                        userRole = "student";
                    }
                    
                    // Log other potential role indicators
                    if (userInfo.TryGetProperty("user_type", out var userTypeProp))
                    {
                        Console.WriteLine($"Found user_type property: '{userTypeProp.GetString()}'");
                    }
                    
                    if (userInfo.TryGetProperty("account_type", out var accountTypeProp))
                    {
                        Console.WriteLine($"Found account_type property: '{accountTypeProp.GetString()}'");
                    }
                }
                else
                {
                    Console.WriteLine("No user info found in response, defaulting role to 'student'");
                }

                // Safely extract token
                if (apiResponse.TryGetProperty("token", out var tokenProperty))
                {
                    token = tokenProperty.GetString() ?? "";
                }

                // Set redirect URL based on role if successful
                if (success)
                {
                    Console.WriteLine($"Setting redirect URL based on role: '{userRole}'");
                    
                    switch (userRole.ToLower().Trim())
                    {
                        case "student":
                            redirectUrl = "/Student/Dashboard";
                            Console.WriteLine("Redirect set to Student dashboard");
                            break;
                        case "faculty":
                            redirectUrl = "/Faculty/Dashboard";
                            Console.WriteLine("Redirect set to Faculty dashboard");
                            break;
                        case "teacher":
                            redirectUrl = "/Faculty/Dashboard";
                            Console.WriteLine("Redirect set to Faculty dashboard (teacher)");
                            break;
                        case "instructor":
                            redirectUrl = "/Faculty/Dashboard";
                            Console.WriteLine("Redirect set to Faculty dashboard (instructor)");
                            break;
                        case "admin":
                            redirectUrl = "/Admin/Dashboard";
                            Console.WriteLine("Redirect set to Admin dashboard");
                            break;
                        case "administrator":
                            redirectUrl = "/Admin/Dashboard"; 
                            Console.WriteLine("Redirect set to Admin dashboard (administrator)");
                            break;
                        default:
                            redirectUrl = "/Student/Dashboard";
                            Console.WriteLine($"Unknown role '{userRole}' - defaulting to Student dashboard");
                            break;
                    }
                }

                // Store session data if successful and user info exists
                if (success && userInfo.ValueKind != JsonValueKind.Undefined)
                {
                    HttpContext.Session.SetString("IsAuthenticated", "true");
                    
                    // Store the exact role string as received (preserving case) for debugging
                    if (userInfo.TryGetProperty("role", out var originalRoleProp))
                    {
                        var originalRole = originalRoleProp.GetString() ?? "";
                        HttpContext.Session.SetString("UserRoleOriginal", originalRole);
                        Console.WriteLine($"Stored original role in session: '{originalRole}'");
                    }
                    
                    // Store normalized role (lowercase)
                    HttpContext.Session.SetString("UserRole", userRole);
                    Console.WriteLine($"Stored normalized role in session: '{userRole}'");
                    
                    // Map Python API response fields to session
                    if (userInfo.TryGetProperty("user_id", out var userIdProp))
                    {
                        HttpContext.Session.SetString("UserId", userIdProp.ToString());
                    }
                    if (userInfo.TryGetProperty("email", out var emailProp))
                    {
                        HttpContext.Session.SetString("UserEmail", emailProp.GetString() ?? "");
                    }
                    if (userInfo.TryGetProperty("name", out var nameProp))
                    {
                        var fullName = nameProp.GetString() ?? "";
                        var nameParts = fullName.Split(' ');
                        HttpContext.Session.SetString("FirstName", nameParts.Length > 0 ? nameParts[0] : "");
                        HttpContext.Session.SetString("LastName", nameParts.Length > 1 ? string.Join(" ", nameParts.Skip(1)) : "");
                        HttpContext.Session.SetString("FullName", fullName);
                    }
                    if (userInfo.TryGetProperty("student_number", out var studentNumberProp))
                    {
                        HttpContext.Session.SetString("StudentNumber", studentNumberProp.GetString() ?? "");
                    }
                    if (userInfo.TryGetProperty("role", out var roleSessionProp))
                    {
                        HttpContext.Session.SetString("UserRoleOriginal", roleSessionProp.GetString() ?? "");
                    }
                    if (userInfo.TryGetProperty("verified", out var verifiedProp))
                    {
                        HttpContext.Session.SetString("Verified", verifiedProp.ToString());
                    }
                    if (userInfo.TryGetProperty("status_id", out var statusIdProp))
                    {
                        HttpContext.Session.SetString("StatusId", statusIdProp.ToString());
                    }
                    
                    // Store JWT auth token if provided (from Python API)
                    if (!string.IsNullOrEmpty(token))
                    {
                        HttpContext.Session.SetString("AuthToken", token);
                    }
                    
                    // Set login timestamp
                    HttpContext.Session.SetString("LoginTime", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"));
                    
                    // Set session timeout to 24 hours
                    HttpContext.Session.SetString("SessionExpiry", DateTime.UtcNow.AddHours(24).ToString("yyyy-MM-dd HH:mm:ss"));
                    
                    Console.WriteLine($"User session created for: {HttpContext.Session.GetString("UserEmail")} with role: {userRole}");
                }
                
                var response = new { 
                    success = success,
                    message = message,
                    user = userInfo.ValueKind != JsonValueKind.Undefined ? userInfo : (object)null,
                    token = !string.IsNullOrEmpty(token) ? token : (object)null,
                    redirect_url = redirectUrl,
                    user_role = userRole,
                    transition_delay = 1200
                };
                
                return Json(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Login OTP verification error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                return Json(new { 
                    success = false, 
                    message = "Unable to verify code at this time. Please try again.",
                    user = (object)null,
                    token = (object)null,
                    redirect_url = (object)null,
                    user_role = (object)null
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> ValidateForgotPasswordEmail([FromBody] JsonElement requestData)
        {
            try
            {
                // Extract email from request
                var email = requestData.GetProperty("email").GetString() ?? "";

                // Convert to the format expected by Python API
                var forgotPasswordData = new
                {
                    email = email
                };

                var result = await _apiService.ValidateForgotPasswordEmailAsync(forgotPasswordData);
                
                // Parse the API response
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                bool isValid = false;
                string message = "Email validation failed";
                string[] errors = Array.Empty<string>();
                
                if (apiResponse.TryGetProperty("is_valid", out var isValidProperty))
                {
                    isValid = isValidProperty.GetBoolean();
                }
                
                if (apiResponse.TryGetProperty("message", out var messageProperty))
                {
                    message = messageProperty.GetString() ?? message;
                }
                
                if (apiResponse.TryGetProperty("errors", out var errorsProperty) && errorsProperty.ValueKind == JsonValueKind.Array)
                {
                    errors = errorsProperty.EnumerateArray()
                        .Select(e => e.GetString())
                        .Where(e => !string.IsNullOrEmpty(e))
                        .ToArray();
                }
                
                var response = new { 
                    is_valid = isValid,
                    message = message,
                    errors = errors
                };
                
                return Json(response);
            }
            catch (Exception ex)
            {
                return Json(new { 
                    is_valid = false, 
                    message = $"Failed to validate email: {ex.Message}",
                    errors = new[] { $"Validation failed: {ex.Message}" }
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> SendPasswordResetOTP([FromBody] JsonElement requestData)
        {
            try
            {
                // Extract email from request
                var email = requestData.GetProperty("email").GetString() ?? "";

                // Convert to the format expected by Python API
                var resetOTPData = new
                {
                    email = email
                };

                var result = await _apiService.SendPasswordResetOTPAsync(resetOTPData);
                
                // Parse the API response
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                bool success = false;
                string message = "Failed to send password reset instructions";
                int? otpId = null;
                
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
                    // Handle both string and number types for otp_id and ensure it's an integer
                    if (otpIdProperty.ValueKind == JsonValueKind.Number)
                    {
                        otpId = otpIdProperty.GetInt32();
                    }
                    else if (otpIdProperty.ValueKind == JsonValueKind.String)
                    {
                        var otpIdString = otpIdProperty.GetString() ?? "";
                        if (int.TryParse(otpIdString, out int parsedOtpId))
                        {
                            otpId = parsedOtpId;
                        }
                    }
                }
                
                var response = new { 
                    success = success,
                    message = message,
                    otp_id = otpId // Send as integer, not string
                };
                
                return Json(response);
            }
            catch (Exception ex)
            {
                return Json(new { 
                    success = false, 
                    message = $"Failed to send password reset instructions: {ex.Message}",
                    otp_id = (int?)null
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> VerifyPasswordResetOTP([FromBody] JsonElement requestData)
        {
            try
            {
                // Debug: Log the incoming request data
                Console.WriteLine($"=== VERIFY PASSWORD RESET OTP DEBUG ===");
                Console.WriteLine($"Raw request data: {requestData.GetRawText()}");
                
                // Extract OTP ID and OTP code with better error handling
                int otpId;
                string otpCode = "";

                // Handle otp_id - it could come as string or number from frontend
                if (requestData.TryGetProperty("otp_id", out var otpIdProperty))
                {
                    Console.WriteLine($"OTP ID property found. Type: {otpIdProperty.ValueKind}, Value: {otpIdProperty}");
                    
                    if (otpIdProperty.ValueKind == JsonValueKind.Number)
                    {
                        otpId = otpIdProperty.GetInt32();
                        Console.WriteLine($"OTP ID parsed as number: {otpId}");
                    }
                    else if (otpIdProperty.ValueKind == JsonValueKind.String)
                    {
                        var otpIdString = otpIdProperty.GetString() ?? "";
                        Console.WriteLine($"OTP ID as string: '{otpIdString}'");
                        if (!int.TryParse(otpIdString, out otpId))
                        {
                            Console.WriteLine($"Failed to parse OTP ID string '{otpIdString}' to integer");
                            return Json(new { 
                                success = false, 
                                message = "Invalid OTP ID format. Please try again.",
                                reset_token = (object?)null
                            });
                        }
                        Console.WriteLine($"OTP ID parsed from string: {otpId}");
                    }
                    else
                    {
                        Console.WriteLine($"Invalid OTP ID type: {otpIdProperty.ValueKind}");
                        return Json(new { 
                            success = false, 
                            message = "Invalid OTP ID format. Please try again.",
                            reset_token = (object?)null
                        });
                    }
                }
                else
                {
                    Console.WriteLine("OTP ID property not found in request");
                    return Json(new { 
                        success = false, 
                        message = "OTP ID is required. Please try again.",
                        reset_token = (object?)null
                    });
                }

                // Handle otp_code
                if (requestData.TryGetProperty("otp_code", out var otpCodeProperty))
                {
                    otpCode = otpCodeProperty.GetString() ?? "";
                    Console.WriteLine($"OTP Code: '{otpCode}'");
                }

                if (string.IsNullOrEmpty(otpCode))
                {
                    Console.WriteLine("OTP code is empty or null");
                    return Json(new { 
                        success = false, 
                        message = "OTP code is required. Please try again.",
                        reset_token = (object?)null
                    });
                }

                // Convert to the format expected by Python API
                var verifyPasswordResetOtpData = new
                {
                    otp_id = otpId, // Send as integer
                    otp_code = otpCode
                };

                // Debug: Log what we're sending to the API
                Console.WriteLine($"Sending to Python API: otp_id={otpId} (type: {otpId.GetType().Name}), otp_code='{otpCode}'");
                var debugJson = JsonSerializer.Serialize(verifyPasswordResetOtpData);
                Console.WriteLine($"JSON being sent: {debugJson}");
                Console.WriteLine("=====================================");

                var result = await _apiService.VerifyPasswordResetOTPAsync(verifyPasswordResetOtpData);
                
                // Debug: Log the API response
                Console.WriteLine($"=== API RESPONSE DEBUG ===");
                Console.WriteLine($"Raw API response: {result}");
                Console.WriteLine("==========================");
                
                // Parse the API response
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                bool success = false;
                string message = "Invalid verification code. Please check your code and try again.";
                string resetToken = "";
                
                if (apiResponse.TryGetProperty("success", out var successProperty))
                {
                    success = successProperty.GetBoolean();
                }
                
                if (apiResponse.TryGetProperty("message", out var messageProperty))
                {
                    var apiMessage = messageProperty.GetString() ?? "";
                    
                    // Provide user-friendly messages based on API response
                    if (!success)
                    {
                        if (apiMessage.Contains("expired", StringComparison.OrdinalIgnoreCase))
                        {
                            message = "Your verification code has expired. Please request a new password reset.";
                        }
                        else if (apiMessage.Contains("invalid", StringComparison.OrdinalIgnoreCase) || 
                                apiMessage.Contains("incorrect", StringComparison.OrdinalIgnoreCase))
                        {
                            message = "Invalid verification code. Please check your code and try again.";
                        }
                        else if (apiMessage.Contains("not found", StringComparison.OrdinalIgnoreCase))
                        {
                            message = "Password reset session expired. Please start the process again.";
                        }
                        else if (apiMessage.Contains("Account not found", StringComparison.OrdinalIgnoreCase) ||
                                apiMessage.Contains("User not found", StringComparison.OrdinalIgnoreCase))
                        {
                            message = "Account not found. Please contact support if you believe this is an error.";
                        }
                        else
                        {
                            message = "Invalid verification code. Please check your code and try again.";
                        }
                    }
                    else
                    {
                        message = "Verification successful! You can now set your new password.";
                    }
                }
                
                if (apiResponse.TryGetProperty("reset_token", out var resetTokenProperty))
                {
                    resetToken = resetTokenProperty.GetString() ?? "";
                }
                
                var response = new { 
                    success = success,
                    message = message,
                    reset_token = success ? resetToken : (object?)null
                };
                
                return Json(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Password reset OTP verification error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                return Json(new { 
                    success = false, 
                    message = "Unable to verify code at this time. Please try again.",
                    reset_token = (object?)null
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> ResetPassword([FromBody] JsonElement requestData)
        {
            try
            {
                // Debug: Log the incoming request data
                Console.WriteLine($"=== RESET PASSWORD CONTROLLER DEBUG ===");
                Console.WriteLine($"Raw request data: {requestData.GetRawText()}");
                
                // Extract reset token and new password
                string resetToken = "";
                string newPassword = "";

                if (requestData.TryGetProperty("reset_token", out var resetTokenProperty))
                {
                    resetToken = resetTokenProperty.GetString() ?? "";
                    Console.WriteLine($"Reset token: {resetToken}");
                }

                if (requestData.TryGetProperty("new_password", out var newPasswordProperty))
                {
                    newPassword = newPasswordProperty.GetString() ?? "";
                    Console.WriteLine($"New password length: {newPassword.Length}");
                }

                if (string.IsNullOrEmpty(resetToken))
                {
                    Console.WriteLine("Reset token is empty or null");
                    return Json(new { 
                        success = false, 
                        message = "Reset token is required. Please try again."
                    });
                }

                if (string.IsNullOrEmpty(newPassword))
                {
                    Console.WriteLine("New password is empty or null");
                    return Json(new { 
                        success = false, 
                        message = "New password is required. Please try again."
                    });
                }

                // Convert to the format expected by Python API
                var resetPasswordData = new
                {
                    reset_token = resetToken,
                    new_password = newPassword
                };

                Console.WriteLine($"Sending to Python API: reset_token={resetToken}, new_password.length={newPassword.Length}");
                Console.WriteLine("=======================================");

                var result = await _apiService.ResetPasswordWithTokenAsync(resetPasswordData);
                
                // Debug: Log the API response
                Console.WriteLine($"=== API RESPONSE DEBUG ===");
                Console.WriteLine($"Raw API response: {result}");
                Console.WriteLine("==========================");
                
                // Parse the API response
                var apiResponse = JsonSerializer.Deserialize<JsonElement>(result);
                
                bool success = false;
                string message = "Password reset failed. Please try again.";
                
                if (apiResponse.TryGetProperty("success", out var successProperty))
                {
                    success = successProperty.GetBoolean();
                }
                
                if (apiResponse.TryGetProperty("message", out var messageProperty))
                {
                    var apiMessage = messageProperty.GetString() ?? "";
                    
                    // Provide user-friendly messages based on API response
                    if (!success)
                    {
                        if (apiMessage.Contains("expired", StringComparison.OrdinalIgnoreCase))
                        {
                            message = "Your password reset session has expired. Please request a new password reset.";
                        }
                        else if (apiMessage.Contains("invalid", StringComparison.OrdinalIgnoreCase) || 
                                apiMessage.Contains("token", StringComparison.OrdinalIgnoreCase))
                        {
                            message = "Invalid reset session. Please request a new password reset.";
                        }
                        else if (apiMessage.Contains("used", StringComparison.OrdinalIgnoreCase))
                        {
                            message = "This password reset link has already been used. Please request a new one.";
                        }
                        else if (apiMessage.Contains("validation", StringComparison.OrdinalIgnoreCase) ||
                                apiMessage.Contains("requirements", StringComparison.OrdinalIgnoreCase) ||
                                apiMessage.Contains("password", StringComparison.OrdinalIgnoreCase))
                        {
                            message = apiMessage; // Show specific password validation errors
                        }
                        else if (apiMessage.Contains("User not found", StringComparison.OrdinalIgnoreCase) ||
                                apiMessage.Contains("Account not found", StringComparison.OrdinalIgnoreCase))
                        {
                            message = "Account not found. Please contact support if you believe this is an error.";
                        }
                        else
                        {
                            message = "Password reset failed. Please try again.";
                        }
                    }
                    else
                    {
                        message = "Password reset successfully. You can now log in with your new password.";
                    }
                }
                
                var response = new { 
                    success = success,
                    message = message
                };
                
                return Json(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Password reset controller error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                return Json(new { 
                    success = false, 
                    message = "Unable to reset password at this time. Please try again."
                });
            }
        }

        [HttpPost]
        public IActionResult Logout()
        {
            try
            {
                // Clear all session data
                HttpContext.Session.Clear();
                
                // Return success response for AJAX calls
                return Json(new { 
                    success = true, 
                    message = "Logged out successfully",
                    redirect_url = "/Auth/Login?logout=true"
                });
            }
            catch (Exception ex)
            {
                // Log error but still indicate logout
                Console.WriteLine($"Logout error: {ex.Message}");
                return Json(new { 
                    success = true, // Still return success to complete logout
                    message = "Logged out",
                    redirect_url = "/Auth/Login?logout=true"
                });
            }
        }
    }
}
