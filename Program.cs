using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using AttendanceApp_ASPNET.Models;
using AttendanceApp_ASPNET.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Configure session
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    var sessionConfig = builder.Configuration.GetSection("SessionOptions");
    options.IdleTimeout = TimeSpan.Parse(sessionConfig["IdleTimeout"] ?? "00:30:00");
    options.Cookie.HttpOnly = bool.Parse(sessionConfig["Cookie:HttpOnly"] ?? "true");
    options.Cookie.IsEssential = bool.Parse(sessionConfig["Cookie:IsEssential"] ?? "true");
});

// Configure API settings
builder.Services.Configure<ApiSettings>(builder.Configuration.GetSection("ApiSettings"));

// Register HttpClient and ApiService
builder.Services.AddHttpClient<IApiService, ApiService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); // Enables detailed error pages
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
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
    pattern: "{controller=Auth}/{action=Register}/{id?}");

app.Run();
