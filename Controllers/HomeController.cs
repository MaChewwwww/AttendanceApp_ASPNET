using Microsoft.AspNetCore.Mvc;

namespace AttendanceApp_ASPNET.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            // Redirect to login page
            return RedirectToAction("Login", "Auth");
        }
    }
}
