using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using AttendanceApp_ASPNET.Models;
using AttendanceApp_ASPNET.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Add session services
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Session timeout
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.Name = "AttendanceApp.Session";
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
});

// Configure API settings
builder.Services.Configure<ApiSettings>(builder.Configuration.GetSection("ApiSettings"));

// Register HttpClient and ApiService
builder.Services.AddHttpClient<IApiService, ApiService>();

// Register API service
builder.Services.AddScoped<IApiService, ApiService>();

// Register HTTP clients
builder.Services.AddHttpClient<IEnvironmentService, EnvironmentService>();

// Register consolidated services
builder.Services.AddScoped<IEnvironmentService, EnvironmentService>();
builder.Services.AddScoped<IStudentManagementService, StudentManagementService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IStudentHistoryService, StudentHistoryService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();

// Add antiforgery token services
builder.Services.AddAntiforgery(options => {
    options.HeaderName = "RequestVerificationToken";
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// Add session middleware BEFORE authorization
app.UseSession();

app.UseAuthorization();

// Add antiforgery middleware
app.UseAntiforgery();

// Default route configuration
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Auth}/{action=Login}/{id?}");

// Add specific route for student dashboard
app.MapControllerRoute(
    name: "student",
    pattern: "Dashboard",
    defaults: new { controller = "Student", action = "Dashboard" });

app.Run();
