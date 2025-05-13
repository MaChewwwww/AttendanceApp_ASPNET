using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"),
        new MySqlServerVersion(new Version(8, 0, 31)))); // Your MySQL version

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Ensure cookies are secure
    options.Cookie.SameSite = SameSiteMode.Strict; // Prevent cookies from being sent to third-party sites
});

builder.Services.AddAntiforgery();
builder.Services.Configure<CookiePolicyOptions>(options =>
{
    options.CheckConsentNeeded = context => true;
    options.MinimumSameSitePolicy = SameSiteMode.Strict;  // Ensure cookies are same-site
});

// Enforce HTTPS in production
builder.Services.AddHttpsRedirection(options =>
{
    options.HttpsPort = 443;  // Ensure this is the correct port for HTTPS (443 is default)
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();  // Enforce HTTP Strict Transport Security (HSTS)
}

app.UseHttpsRedirection();  // Enforce HTTPS redirection
app.UseStaticFiles();
app.UseRouting();
app.UseSession();  // Enable session before checking it

app.UseAuthentication();
app.UseAuthorization();

// Default route configuration
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Authentication}/{action=Login}/{id?}");

app.Run();
