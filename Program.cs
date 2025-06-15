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

// Register services
builder.Services.AddScoped<IApiService, ApiService>();
builder.Services.AddScoped<IStudentManagementService, StudentManagementService>();
builder.Services.AddScoped<IClassService, ClassService>();
builder.Services.AddScoped<IFacultyPersonalAttendanceService, FacultyPersonalAttendanceService>();

// Register HTTP clients
builder.Services.AddHttpClient<IEnvironmentService, EnvironmentService>();

// Register consolidated services
builder.Services.AddScoped<IEnvironmentService, EnvironmentService>();
builder.Services.AddScoped<IStudentManagementService, StudentManagementService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IClassService, ClassService>();  // Add this line
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
else
{
    app.UseDeveloperExceptionPage();
    // Hot reload is automatically enabled in development
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// Add session middleware BEFORE authorization
app.UseSession();

app.UseAuthorization();

// Add antiforgery middleware
app.UseAntiforgery();

// Default route configuration - redirect root to login
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Auth}/{action=Login}/{id?}");

// Add fallback route for root URL
app.MapFallbackToController("Login", "Auth");

// Add specific route for attendance update
app.MapControllerRoute(
    name: "attendanceUpdate",
    pattern: "Faculty/UpdateAttendanceStatus/{attendanceId:int}",
    defaults: new { controller = "Faculty", action = "UpdateAttendanceStatus" });

// Add specific route for student dashboard
app.MapControllerRoute(
    name: "student",
    pattern: "Dashboard",
    defaults: new { controller = "Student", action = "Dashboard" });

app.Run();
