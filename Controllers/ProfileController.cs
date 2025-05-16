using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Authentication.Controllers
{
    public class ProfileController : Controller
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ProfileController> _logger;

        public ProfileController(HttpClient httpClient, ILogger<ProfileController> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        // GET: View Profile
        [HttpGet]
        public IActionResult Index()
        {
            var model = new ProfileViewModel
            {
                Name = HttpContext.Session.GetString("UserName"),
                Email = HttpContext.Session.GetString("UserEmail"),
                StudentNumber = HttpContext.Session.GetString("UserStudentNumber"),
                Role = HttpContext.Session.GetString("UserRole"),
                FaceImage = HttpContext.Session.GetString("UserFaceImage") ?? string.Empty
            };

            return View(model);
        }

        // POST: Update Profile
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Update(ProfileViewModel model, IFormFile? FaceImage)
        {
            if (!ModelState.IsValid)
            {
                foreach (var error in ModelState.Values.SelectMany(v => v.Errors))
                {
                    _logger.LogWarning("Validation Error: {ErrorMessage}", error.ErrorMessage);
                }
                return View("Index", model);
            }

            var payload = new MultipartFormDataContent
            {
                { new StringContent(model.Name), "name" },
                { new StringContent(model.Email), "email" },
                { new StringContent(model.StudentNumber), "student_number" } // Ensure StudentNumber is sent
            };

            if (FaceImage is { Length: > 0 })
            {
                try
                {
                    var fileContent = new StreamContent(FaceImage.OpenReadStream());
                    fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
                    payload.Add(fileContent, "face_image", FaceImage.FileName);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing face image file.");
                    ModelState.AddModelError("FaceImage", "An error occurred while processing the face image.");
                    return View("Index", model);
                }
            }

            var userId = HttpContext.Session.GetString("UserId");
            var apiUrl = $"http://127.0.0.1:8000/profile/{userId}";

            try
            {
                var response = await _httpClient.PutAsync(apiUrl, payload);

                if (response.IsSuccessStatusCode)
                {
                    var responseData = await response.Content.ReadAsStringAsync();
                    var updatedUser = JsonSerializer.Deserialize<ProfileViewModel>(responseData, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });

                    UpdateSessionValue("UserName", updatedUser.Name);
                    UpdateSessionValue("UserEmail", updatedUser.Email);
                    UpdateSessionValue("UserFaceImage", updatedUser.FaceImage);

                    TempData["SuccessMessage"] = "Profile updated successfully.";
                    return RedirectToAction("Index");
                }
                else
                {
                    var errorMessage = await response.Content.ReadAsStringAsync();
                    _logger.LogError("API Error: {ErrorMessage}", errorMessage);
                    ModelState.AddModelError(string.Empty, $"API Error: {errorMessage}");
                    return View("Index", model);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during API call.");
                ModelState.AddModelError(string.Empty, "An unexpected error occurred.");
                return View("Index", model);
            }
        }

        private void UpdateSessionValue(string key, string value)
        {
            if (!string.IsNullOrEmpty(value))
            {
                HttpContext.Session.SetString(key, value);
            }
        }
    }
}
