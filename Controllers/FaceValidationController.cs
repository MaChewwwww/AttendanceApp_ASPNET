using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class FaceValidationController : Controller
{
    private readonly IHttpClientFactory _httpClientFactory;

    public FaceValidationController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Index(IFormFile faceImage)
    {
        if (faceImage == null || faceImage.Length == 0)
        {
            ModelState.AddModelError("FaceImage", "Please capture a valid image.");
            return View();
        }

        using var client = _httpClientFactory.CreateClient();
        using var content = new MultipartFormDataContent();

        // Retrieve user ID from session
        var userId = HttpContext.Session.GetString("UserId");
        if (string.IsNullOrEmpty(userId))
        {
            ModelState.AddModelError(string.Empty, "User ID not found in session.");
            return View();
        }

        // Add the user ID and image to the request
        content.Add(new StringContent(userId), "user_id");
        using var fileStream = faceImage.OpenReadStream();
        var fileContent = new StreamContent(fileStream);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
        content.Add(fileContent, "image", faceImage.FileName);

        try
        {
            // Send the request to the API
            var response = await client.PostAsync($"http://127.0.0.1:8000/validate_face/{userId}", content);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                var userIdFromApi = JsonConvert.DeserializeObject<dynamic>(result)?["user_id"]?.ToString();
                if (!string.IsNullOrEmpty(userIdFromApi))
                {
                    HttpContext.Session.SetString("UserId", (string)userIdFromApi);
                }

                TempData["SuccessMessage"] = "Face validated successfully and attendance logged.";
                return RedirectToAction("Index", "Dashboard");
            }
            else
            {
                // Parse the error response and add it to ModelState
                var error = await response.Content.ReadAsStringAsync();
                var errorDetail = JsonConvert.DeserializeObject<dynamic>(error)?["detail"]?.ToString();
                ModelState.AddModelError(string.Empty, errorDetail ?? "An unknown error occurred.");
                return View();
            }
        }
        catch (Exception ex)
        {
            ModelState.AddModelError(string.Empty, $"Error accessing API: {ex.Message}");
            return View();
        }
    }


}
