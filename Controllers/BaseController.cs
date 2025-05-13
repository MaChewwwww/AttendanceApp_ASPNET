using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

public class BaseController : Controller
{
    protected virtual bool SkipSessionCheck() => false;

    public override void OnActionExecuting(ActionExecutingContext context)
    {
        if (!SkipSessionCheck())
        {
            var userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId))
            {
                context.Result = new RedirectToActionResult("Login", "Authentication", null);
                return;
            }
        }

        base.OnActionExecuting(context);
    }
}
