# 🎓 Attendify ASP.NET Core
A modern, secure attendance management system built with ASP.NET Core featuring comprehensive authentication, real-time validation, biometric face recognition, and complete academic management capabilities.

## ✨ Key Features

### 🔐 **Advanced Authentication System**
- **4-Step Registration Wizard** with progressive validation
- **Multi-Factor Authentication** (Email + Password + Face Recognition)
- **Email OTP Verification** with 10-minute expiration
- **Secure Password Reset** with token-based validation
- **24-Hour Session Management** with auto-logout warnings

### 🎓 **Complete Academic Management System**
- **Intelligent Student Dashboard** with real-time session monitoring
- **Dynamic Course Management** with current and historical course tracking
- **Program & Section Assignment** with automated enrollment workflows
- **Student Onboarding System** with multi-step academic setup
- **Course Details & Analytics** with comprehensive student directories
- **Attendance History Tracking** with detailed record visualization

### 🌐 **Modern Web Interface**
- **Responsive Design** using Tailwind CSS
- **Real-time Form Validation** with instant feedback
- **Progressive Face Capture** using browser camera API
- **Interactive OTP Modals** with auto-navigation
- **Smooth Animations** and loading states
- **Mobile-First Design** optimized for all devices
- **Dynamic Data Loading** with AJAX and real-time updates

### 🛡️ **Enterprise Security**
- **Multi-layer Validation** (Client-side, Server-side, API)
- **JWT Token Management** with automatic renewal and validation
- **Session Security** with anti-hijacking and timeout protection
- **CSRF Protection** with anti-forgery tokens
- **Rate Limiting** for OTP requests
- **Comprehensive Security Logging**

### 📧 **Professional Email Integration**
- **Python FastAPI Backend** for email processing
- **HTML Email Templates** with branded styling
- **Multiple Email Types** (Registration, Login, Password Reset)
- **Delivery Confirmation** and error handling

### 🌍 **Environmental & Location Services**
- **GPS Location Tracking** with user consent and privacy protection
- **Weather Data Integration** with location-based forecasting
- **Environmental Context** for attendance and activity planning
- **Location-based Features** with geofencing capabilities

### 📊 **Advanced Attendance System**
- **Face Recognition Integration** for biometric attendance marking
- **Real-time Attendance Monitoring** with live status updates
- **Attendance Analytics** with course-specific summaries
- **Historical Data Management** with comprehensive reporting
- **Mobile Attendance Marking** with camera integration

## 🚀 Getting Started

### Prerequisites

- **[.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)** or higher
- **[Visual Studio Code](https://code.visualstudio.com/)** or Visual Studio 2022
- **[C# Extension for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp)**
- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)
- **Python FastAPI Backend** (for email functionality and academic data)

### Quick Setup

#### 1. Clone and Open the Project

```bash
git clone https://github.com/MaChewwwww/AttendanceApp_ASPNET.git
cd AttendanceApp_ASPNET
code .
```

#### 2. Install Dependencies

```bash
# Restore NuGet packages
dotnet restore

# Install development tools (optional)
dotnet tool install --global dotnet-ef
```

#### 3. Configure Application Settings

Create or update `appsettings.json`:

```json
{
  "ApiSettings": {
    "ApiKey": "your-api-key-here",
    "ApiBaseUrl": "http://localhost:6000"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

#### 4. Run the Application

**Option A: Using Terminal (Recommended)**
```bash
dotnet run --project AttendaceApp_ASPNET.csproj --launch-profile https
```
```bash
dotnet watch run
```

**Option B: Using VS Code Debug**
```bash
# Press F5 or use Run and Debug panel
# Select "Launch .NET Core" configuration
```

**Option C: Using dotnet watch (Development)**
```bash
dotnet watch run --launch-profile https
```

#### 5. Access the Application

Once running, navigate to:
- **🔒 HTTPS:** https://localhost:7020
- **🌐 HTTP:** http://localhost:5219

The application automatically redirects to `/Auth/Register` for new users.

## 🏗️ Project Architecture

### Directory Structure
```
AttendanceApp_ASPNET/
├── 📁 Controllers/
│   ├── AuthController.cs          # Authentication endpoints
│   ├── StudentController.cs       # Student dashboard & academic features
│   └── Base/
│       └── StudentBaseController.cs   # Base authentication logic
├── 📁 Views/
│   ├── Auth/                      # Authentication views
│   │   ├── Login.cshtml
│   │   ├── Register.cshtml
│   │   ├── RegisterStep2.cshtml   # Face capture
│   │   ├── RegisterStep3.cshtml   # OTP verification
│   │   └── RegisterStep4.cshtml   # Success confirmation
│   ├── Student/                   # Student dashboard views
│   │   ├── Dashboard.cshtml       # Main dashboard
│   │   ├── Profile.cshtml         # Student profile
│   │   ├── Courses.cshtml         # Course management
│   │   ├── CourseDetails.cshtml   # Individual course details
│   │   ├── Attendance.cshtml      # Attendance marking
│   │   └── AttendanceHistory.cshtml # Historical records
│   └── Shared/
│       ├── _Layout.cshtml
│       └── _AuthLayout.cshtml     # Authentication layout
├── 📁 wwwroot/
│   ├── css/                       # Stylesheets (Tailwind CSS)
│   ├── js/                        # JavaScript modules
│   │   ├── register.js            # Registration logic
│   │   ├── Login.js               # Login functionality
│   │   ├── ForgotPassword.js      # Password reset
│   │   ├── NewPassword.js         # New password setup
│   │   └── StudentSession.js      # Session management
│   ├── lib/                       # Third-party libraries
│   └── images/                    # Static images
├── 📁 Services/
│   ├── ApiService.cs              # Python API integration
│   ├── IStudentManagementService.cs # Student management interface
│   ├── IEnvironmentService.cs     # Location & weather services
│   ├── ICourseService.cs          # Course management
│   └── IStudentHistoryService.cs  # Attendance history
├── 📁 Models/                     # Data models and DTOs
├── 📁 version_update_logs/        # Version history
├── Program.cs                     # Application entry point
├── appsettings.json              # Configuration
└── AttendaceApp_ASPNET.csproj    # Project file
```

### Technology Stack

#### Backend
- **ASP.NET Core 8.0** - Web framework
- **C# 12** - Programming language
- **Session-based Authentication** - User state management
- **JWT Token Management** - API authentication
- **Dependency Injection** - Service container
- **HttpClient** - API communication
- **Service Layer Pattern** - Clean architecture

#### Frontend
- **Tailwind CSS 3.x** - Utility-first CSS framework
- **Vanilla JavaScript** - Modern ES6+ features
- **WebRTC Camera API** - Face capture functionality
- **Fetch API** - Asynchronous HTTP requests
- **CSS Animations** - Smooth transitions
- **Real-time Data Updates** - AJAX and dynamic loading

#### External Integration
- **Python FastAPI** - Email service backend
- **Academic Management API** - Course and enrollment data
- **Face Recognition API** - Biometric validation
- **Weather API** - Environmental data
- **Location Services** - GPS and geofencing

## 🔄 User Flow Examples

### New User Registration & Onboarding
```
1. Personal Information → 2. Face Capture → 3. Email OTP → 4. Success → 5. Academic Setup
   ✅ Real-time validation    ✅ Camera access      ✅ 6-digit code   ✅ Account created   ✅ Program/Section assignment
```

### Daily Academic Workflow
```
1. Dashboard Login → 2. Check Courses → 3. Mark Attendance → 4. View Analytics
   ✅ Session validation   ✅ Current schedule    ✅ Face recognition   ✅ Progress tracking
```

### Course Management
```
1. Course Overview → 2. Course Details → 3. Student Directory → 4. Attendance Reports
   ✅ Current/Previous     ✅ Comprehensive info   ✅ Enrolled students   ✅ Analytics dashboard
```

## 🛠️ Development

### Available Launch Profiles
- **`https`**: Runs on https://localhost:7020 and http://localhost:5219
- **`http`**: HTTP only on http://localhost:5219
- **`IIS Express`**: IIS hosting on http://localhost:17008

### Development Tools

#### Hot Reload (Built-in)
```bash
dotnet watch run --launch-profile https
# Automatically refreshes on code changes
```

#### Debugging in VS Code
1. Set breakpoints in C# code
2. Press `F5` to start debugging
3. Browser opens automatically
4. Debug console shows detailed logs

#### Useful VS Code Shortcuts
- **`Ctrl + ` **: Open integrated terminal
- **`F5`**: Start debugging
- **`Ctrl+Shift+P`**: Command palette
- **`Ctrl+Shift+D`**: Run and Debug panel

### Recommended VS Code Extensions
- **C# for Visual Studio Code** - IntelliSense and debugging
- **ASP.NET Core Snippets** - Code snippets
- **Thunder Client** - API testing
- **Tailwind CSS IntelliSense** - CSS autocomplete
- **Auto Rename Tag** - HTML tag management

## 🔧 Configuration

### Environment Variables
```bash
# Development
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=https://localhost:7020;http://localhost:5219

# Production
ASPNETCORE_ENVIRONMENT=Production
```

### API Configuration
Update `appsettings.json` with your Python FastAPI backend:
```json
{
  "ApiSettings": {
    "ApiKey": "your-secure-api-key",
    "ApiBaseUrl": "https://your-api-domain.com"
  }
}
```

## 📋 API Endpoints

### Authentication Endpoints
- **`POST /Auth/ValidateRegistration`** - Validate registration form
- **`POST /Auth/ValidateFaceImage`** - Validate captured face
- **`POST /Auth/SendRegistrationOTP`** - Send registration OTP
- **`POST /Auth/VerifyOTPAndCompleteRegistration`** - Complete registration
- **`POST /Auth/ValidateLogin`** - Validate login credentials
- **`POST /Auth/SendLoginOTP`** - Send login OTP
- **`POST /Auth/VerifyLoginOTP`** - Verify login and create session
- **`POST /Auth/ValidateForgotPasswordEmail`** - Validate reset email
- **`POST /Auth/SendPasswordResetOTP`** - Send password reset OTP
- **`POST /Auth/VerifyPasswordResetOTP`** - Verify reset OTP
- **`POST /Auth/ResetPassword`** - Update password with token

### Student Dashboard Endpoints
- **`GET /Student/Dashboard`** - Student dashboard with weather & session data
- **`GET /Student/Profile`** - Student profile information
- **`GET /Student/Courses`** - Current and previous courses
- **`GET /Student/Courses/{courseId}`** - Detailed course information
- **`GET /Student/Courses/{assignedCourseId}/Students`** - Course student directory
- **`GET /Student/Attendance`** - Attendance marking interface
- **`GET /Student/AttendanceHistory`** - Historical attendance records
- **`GET /Student/MarkAttendance`** - Face recognition attendance

### Academic Management Endpoints
- **`GET /Student/GetAvailablePrograms`** - Available academic programs
- **`GET /Student/GetAvailableSections/{id}`** - Sections by program
- **`GET /Student/GetAvailableCourses/{id}`** - Courses by section
- **`POST /Student/CompleteOnboarding`** - Academic setup completion
- **`POST /Student/SetUserLocation`** - Update user location data

### System Endpoints
- **`GET /Student/CheckSessionStatus`** - Real-time session validation
- **`POST /Student/SecureLogout`** - Secure session termination

## 🚨 Troubleshooting

### Common Issues

#### API Connection Issues
```bash
# Verify Python FastAPI backend is running on port 8000
curl http://localhost:8000/health

# Check API configuration in appsettings.json
# Ensure JWT tokens are being generated correctly
```

#### Session Management Issues
- Clear browser cache and cookies
- Check session timeout settings (24-hour default)
- Verify anti-forgery token configuration
- Monitor session expiry warnings

#### Face Recognition Issues
- Ensure camera permissions are granted
- Test in HTTPS environment (required for camera access)
- Check browser compatibility for WebRTC
- Verify face recognition API endpoint

#### Course Data Loading Issues
- Confirm academic management API is running
- Check JWT token validity and renewal
- Verify database connections for course data
- Monitor network connectivity to external services

### Debug Mode
Enable detailed logging in `appsettings.Development.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information",
      "AttendanceApp_ASPNET.Controllers": "Debug",
      "AttendanceApp_ASPNET.Services": "Debug"
    }
  }
}
```

## 📊 Performance Tips

### Production Optimizations
- Enable response compression for API calls
- Configure static file caching for course images
- Use CDN for academic resources
- Implement database connection pooling
- Enable output caching for course catalogs
- Optimize JWT token refresh cycles

### Development Tips
- Use `dotnet watch` for auto-reload during development
- Configure browser dev tools for mobile testing
- Test with different network conditions for API calls
- Profile JavaScript performance for dashboard interactions
- Monitor memory usage during face recognition operations

## 🔐 Security Notes

### Best Practices Implemented
- ✅ HTTPS enforcement for all communications
- ✅ JWT token security with automatic renewal
- ✅ Anti-forgery tokens for state-changing operations
- ✅ Session timeout management with early warnings
- ✅ Input validation and sanitization across all forms
- ✅ Secure password requirements with strength validation
- ✅ Rate limiting for sensitive operations (OTP, face recognition)
- ✅ Comprehensive audit logging for security events
- ✅ Multi-layer authentication (Email + Password + Biometric)
- ✅ Location-based security with GPS validation

### Additional Security Considerations
- Regularly update dependencies and security patches
- Monitor security logs for suspicious activities
- Implement proper error handling without information disclosure
- Use environment-specific configurations for API keys
- Regular security assessments and penetration testing
- Secure storage of biometric data and student information

## 📈 Version History

See [version_update_logs/](./version_update_logs/) for detailed changelog:
- **v1.0.0** - Complete authentication system with modern web interface
- **v1.1.0** - Student dashboard, academic management, and attendance system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@attendanceapp.com
- 📖 Documentation: [Wiki](../../wiki)
- 🐛 Bug Reports: [Issues](../../issues)
- 💬 Discussions: [Discussions](../../discussions)

---

**Built with ❤️ using ASP.NET Core and modern web technologies**