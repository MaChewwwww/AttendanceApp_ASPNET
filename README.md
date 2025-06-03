# AttendanceApp ASP.NET Core

An attendance management system built with ASP.NET Core that includes user authentication and CRUD operations.

## Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Visual Studio Code](https://code.visualstudio.com/)
- [C# Extension for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp)

## Getting Started in Visual Studio Code

### 1. Clone and Open the Project

```bash
git clone <repository-url>
cd AttendanceApp_ASPNET
code .
```

### 2. Restore Dependencies

Open the integrated terminal in VS Code (`Ctrl + ``) and run:

```bash
dotnet restore
```

### 3. Run the Application

Use one of the following methods:

#### Option A: Using Terminal (Recommended)
```bash
dotnet run --project AttendaceApp_ASPNET.csproj --launch-profile https
```

#### Option B: Using VS Code Tasks
1. Press `Ctrl+Shift+P`
2. Type "Tasks: Run Task"
3. Select ".NET Core: Run" or create a custom task

#### Option C: Using Debug Configuration
1. Press `F5` or go to Run and Debug (`Ctrl+Shift+D`)
2. Select "Launch .NET Core" configuration
3. Click the green play button

### 4. Access the Application

Once running, open your browser and navigate to:
- **HTTPS:** https://localhost:7020
- **HTTP:** http://localhost:5219

The application will automatically redirect to the registration page (`/Auth/Register`).

## Available Launch Profiles

- **https:** Runs on https://localhost:7020 and http://localhost:5219
- **http:** Runs on http://localhost:5219 only
- **IIS Express:** Runs on http://localhost:17008 with SSL on port 44359

## Troubleshooting

### Connection Refused Error
If you get "ERR_CONNECTION_REFUSED", try:
1. Make sure the application is still running in the terminal
2. Use the HTTPS launch profile: `dotnet run --project AttendaceApp_ASPNET.csproj --launch-profile https`
3. Try both HTTP and HTTPS URLs

### SSL Certificate Warnings
For local development, it's safe to:
1. Click "Advanced" in your browser
2. Click "Proceed to localhost"

### Port Already in Use
If ports are occupied, check what's using them:
```bash
netstat -ano | findstr :5219
netstat -ano | findstr :7020
```

## Development in VS Code

### Recommended Extensions
- C# for Visual Studio Code
- ASP.NET Core Snippets
- NuGet Package Manager

### Useful VS Code Shortcuts
- `Ctrl + `` - Open integrated terminal
- `F5` - Start debugging
- `Ctrl+Shift+P` - Command palette
- `Ctrl+Shift+D` - Run and Debug panel

### Hot Reload
The application supports hot reload during development. Changes to your code will automatically refresh the browser.

## Project Structure

```
AttendanceApp_ASPNET/
├── Controllers/          # MVC Controllers
├── Models/               # Data models
├── Views/                # Razor views
├── wwwroot/              # Static files (CSS, JS, images)
├── Properties/           # Launch settings
├── Program.cs            # Application entry point
└── AttendaceApp_ASPNET.csproj  # Project file
```

## Features

- User Registration and Authentication
- Attendance Management
- CRUD Operations
- Responsive Web Interface

## Stopping the Application

- In terminal: Press `Ctrl+C`
- In VS Code debugger: Click the stop button or press `Shift+F5`