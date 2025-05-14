using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Text;
using Newtonsoft.Json;
using System.Collections.Generic; // For Dictionary


namespace Authentication.Controllers
{
    public class AuthenticationController : Controller
    {
        // GET: Registration form
        [HttpGet]
        [AllowAnonymous]
        public IActionResult Register()
        {
            return View(new RegisterViewModel());
        }

        // POST: Registration logic
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                using (var client = new HttpClient())
                {
                    // Prepare the payload
                    var payload = new
                    {
                        name = model.Name,
                        email = model.Email,
                        password = model.Password
                    };

                    var json = JsonConvert.SerializeObject(payload);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");

                    // Send POST request to the API
                    var response = await client.PostAsync("http://127.0.0.1:8000/register", content);

                    if (response.IsSuccessStatusCode)
                    {
                        // Registration successful
                        return RedirectToAction("Login");
                    }
                    else
                    {
                        // Handle API error
                        var error = await response.Content.ReadAsStringAsync();
                        ModelState.AddModelError("", error);
                    }
                }
            }

            return View(model);
        }

        // GET: Login form
        [HttpGet]
        [AllowAnonymous]
        public IActionResult Login()
        {
            return View(new LoginViewModel());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (ModelState.IsValid)
            {
                using (var client = new HttpClient())
                {
                    var payload = new
                    {
                        email = model.Email,
                        password = model.Password
                    };

                    var json = JsonConvert.SerializeObject(payload);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");

                    var response = await client.PostAsync("http://127.0.0.1:8000/login", content);

                    if (response.IsSuccessStatusCode)
                    {
                        var responseContent = await response.Content.ReadAsStringAsync();
                        var result = JsonConvert.DeserializeObject<Dictionary<string, object>>(responseContent);

                        // Safely set session values
                        HttpContext.Session.SetString("UserId", result?["user_id"]?.ToString() ?? string.Empty);
                        HttpContext.Session.SetString("UserName", result?["name"]?.ToString() ?? string.Empty);

                        return RedirectToAction("Index", "Dashboard");
                    }
                    else
                    {
                        // Extract and format the error message
                        var errorContent = await response.Content.ReadAsStringAsync();
                        var errorDetails = JsonConvert.DeserializeObject<Dictionary<string, string>>(errorContent);

                        if (errorDetails != null && errorDetails.ContainsKey("detail"))
                        {
                            ModelState.AddModelError("", errorDetails["detail"]);
                        }
                        else
                        {
                            ModelState.AddModelError("", "An unexpected error occurred. Please try again.");
                        }
                    }
                }
            }

            return View(model);
        }


        [HttpGet]
        public IActionResult Logout()
        {
            // Clear all session data
            HttpContext.Session.Clear();

            // Redirect to the Login page
            return RedirectToAction("Login");
        }
    }
}
