# 🎓 Attendify ASP.NET Core
A modern, secure attendance management system built with ASP.NET Core featuring comprehensive authentication, real-time validation, and biometric face recognition capabilities.

## ✨ Key Features

### 🔐 **Advanced Authentication System**
- **4-Step Registration Wizard** with progressive validation
- **Multi-Factor Authentication** (Email + Password + Face Recognition)
- **Email OTP Verification** with 10-minute expiration
- **Secure Password Reset** with token-based validation
- **24-Hour Session Management** with auto-logout warnings

### 🌐 **Modern Web Interface**
- **Responsive Design** using Tailwind CSS
- **Real-time Form Validation** with instant feedback
- **Progressive Face Capture** using browser camera API
- **Interactive OTP Modals** with auto-navigation
- **Smooth Animations** and loading states
- **Mobile-First Design** optimized for all devices

### 🛡️ **Enterprise Security**
- **Multi-layer Validation** (Client-side, Server-side, API)
- **CSRF Protection** with anti-forgery tokens
- **Session Hijacking Prevention**
- **Rate Limiting** for OTP requests
- **Comprehensive Security Logging**

### 📧 **Professional Email Integration**
- **Python FastAPI Backend** for email processing
- **HTML Email Templates** with branded styling
- **Multiple Email Types** (Registration, Login, Password Reset)
- **Delivery Confirmation** and error handling

## 🚀 Getting Started

### Prerequisites

- **[.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)** or higher
- **[Visual Studio Code](https://code.visualstudio.com/)** or Visual Studio 2022
- **[C# Extension for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp)**
- **Modern Web Browser** (Chrome, Firefox, Safari, Edge)
- **Python FastAPI Backend** (for email functionality)

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
    "ApiBaseUrl": "http://localhost:8000"
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
│   ├── StudentController.cs       # Student dashboard & features
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
│   └── ApiService.cs              # Python API integration
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
- **Dependency Injection** - Service container
- **HttpClient** - API communication

#### Frontend
- **Tailwind CSS 3.x** - Utility-first CSS framework
- **Vanilla JavaScript** - Modern ES6+ features
- **WebRTC Camera API** - Face capture functionality
- **Fetch API** - Asynchronous HTTP requests
- **CSS Animations** - Smooth transitions

#### External Integration
- **Python FastAPI** - Email service backend
- **SMTP Email Service** - Email delivery
- **Face Recognition API** - Biometric validation

## 🔄 User Flow Examples

### New User Registration
```
1. Personal Information → 2. Face Capture → 3. Email OTP → 4. Success
   ✅ Real-time validation    ✅ Camera access      ✅ 6-digit code   ✅ Account created
```

### Existing User Login
```
1. Email & Password → 2. Email OTP → 3. Dashboard
   ✅ Credential check   ✅ 2FA verification   ✅ Role-based routing
```

### Password Recovery
```
1. Email Validation → 2. OTP Verification → 3. New Password → 4. Login
   ✅ Account exists     ✅ Reset token        ✅ Secure update   ✅ Access restored
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

### Student Endpoints
- **`GET /Student/Dashboard`** - Student dashboard
- **`GET /Student/CheckSessionStatus`** - Session validation
- **`POST /Student/SecureLogout`** - Secure session termination

## 🚨 Troubleshooting

### Common Issues

#### Connection Refused Error
```bash
# Ensure the application is running
dotnet run --launch-profile https

# Check if ports are available
netstat -ano | findstr :7020
netstat -ano | findstr :5219
```

#### SSL Certificate Warnings
For local development:
1. Click "Advanced" in browser
2. Select "Proceed to localhost"
3. Or trust the development certificate:
```bash
dotnet dev-certs https --trust
```

#### API Connection Issues
- Verify Python FastAPI backend is running
- Check `ApiSettings` in `appsettings.json`
- Confirm API key and base URL are correct

#### Session Issues
- Clear browser cache and cookies
- Check session timeout settings
- Verify session storage configuration

### Debug Mode
Enable detailed logging in `appsettings.Development.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information"
    }
  }
}
```

## 📊 Performance Tips

### Production Optimizations
- Enable response compression
- Configure static file caching
- Use CDN for static assets
- Implement database connection pooling
- Enable output caching for static content

### Development Tips
- Use `dotnet watch` for auto-reload
- Configure browser dev tools for mobile testing
- Test with different network conditions
- Profile JavaScript performance

## 🔐 Security Notes

### Best Practices Implemented
- ✅ HTTPS enforcement
- ✅ Anti-forgery tokens
- ✅ Session timeout management
- ✅ Input validation and sanitization
- ✅ Secure password requirements
- ✅ Rate limiting for sensitive operations
- ✅ Comprehensive audit logging

### Additional Security Considerations
- Regularly update dependencies
- Monitor security logs
- Implement proper error handling
- Use environment-specific configurations
- Regular security assessments

## 📈 Version History

See [version_update_logs/](./version_update_logs/) for detailed changelog:
- **v1.0.0** - Complete authentication system with modern web interface

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