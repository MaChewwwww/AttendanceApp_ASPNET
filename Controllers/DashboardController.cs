using Microsoft.AspNetCore.Mvc;

public class DashboardController : BaseController
{
    // Dashboard GET
    [HttpGet]
    public IActionResult Index()
    {

        return View();
    }
}
