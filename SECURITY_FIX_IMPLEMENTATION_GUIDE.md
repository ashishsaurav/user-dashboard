# Security Fixes Implementation Guide

**Priority:** 🔴 CRITICAL  
**Estimated Time:** 1-2 weeks  
**Target:** Production-ready authentication & authorization

---

## 📋 Implementation Checklist

- [ ] Step 1: Add JWT Authentication (Backend)
- [ ] Step 2: Add Password Hashing (Backend)
- [ ] Step 3: Implement Token Validation (Backend)
- [ ] Step 4: Update Login Flow (Frontend)
- [ ] Step 5: Add Token Storage (Frontend)
- [ ] Step 6: Add Authorization Middleware (Backend)
- [ ] Step 7: Fix CORS Policy (Backend)
- [ ] Step 8: Secure Connection Strings (Backend)
- [ ] Step 9: Add Input Validation (Backend)
- [ ] Step 10: Add Rate Limiting (Backend)

---

## Step 1: Add JWT Authentication (Backend)

### 1.1 Install NuGet Packages

```bash
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.0
dotnet add package System.IdentityModel.Tokens.Jwt --version 7.0.0
```

### 1.2 Update appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "#{DB_CONNECTION_STRING}#"  // Use env variable
  },
  "JwtSettings": {
    "SecretKey": "#{JWT_SECRET_KEY}#",  // Use env variable, min 32 chars
    "Issuer": "https://yourdomain.com",
    "Audience": "https://yourdomain.com",
    "ExpirationMinutes": 60
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

### 1.3 Create JWT Settings Model

**File:** `Models/JwtSettings.cs`

```csharp
namespace DashboardPortal.Models
{
    public class JwtSettings
    {
        public string SecretKey { get; set; }
        public string Issuer { get; set; }
        public string Audience { get; set; }
        public int ExpirationMinutes { get; set; }
    }
}
```

### 1.4 Update Program.cs

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DashboardPortal.Models;

var builder = WebApplication.CreateBuilder(args);

// Add JWT Settings
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
builder.Services.AddSingleton(jwtSettings);

// Add Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings.SecretKey)
        ),
        ClockSkew = TimeSpan.Zero  // Remove default 5 min tolerance
    };
});

builder.Services.AddAuthorization();

// Update CORS - SECURE VERSION
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production",
        builder => builder
            .WithOrigins("https://yourdomain.com", "https://app.yourdomain.com")  // ✅ Specific origins
            .WithMethods("GET", "POST", "PUT", "DELETE")                          // ✅ Specific methods
            .WithHeaders("Content-Type", "Authorization")                         // ✅ Specific headers
            .AllowCredentials());                                                 // ✅ Allow cookies
});

// ... rest of services

var app = builder.Build();

// Middleware order matters!
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("Production");         // ✅ Apply CORS before auth
app.UseAuthentication();           // ✅ MUST come before UseAuthorization
app.UseAuthorization();
app.MapControllers();

app.Run();
```

---

## Step 2: Add Password Hashing

### 2.1 Install BCrypt Package

```bash
dotnet add package BCrypt.Net-Next --version 4.0.3
```

### 2.2 Update User Model

**File:** `Models/User.cs`

```csharp
namespace DashboardPortal.Models
{
    public class User
    {
        public string UserId { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }  // ✅ Add this
        public string RoleId { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public UserRole Role { get; set; }
        public ICollection<ViewGroup> ViewGroups { get; set; }
        public ICollection<View> Views { get; set; }
        public ICollection<LayoutCustomization> LayoutCustomizations { get; set; }
        public NavigationSetting NavigationSetting { get; set; }
    }
}
```

### 2.3 Create Password Service

**File:** `Services/IPasswordService.cs`

```csharp
namespace DashboardPortal.Services
{
    public interface IPasswordService
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string passwordHash);
    }
}
```

**File:** `Services/PasswordService.cs`

```csharp
using BCrypt.Net;

namespace DashboardPortal.Services
{
    public class PasswordService : IPasswordService
    {
        public string HashPassword(string password)
        {
            // BCrypt automatically handles salt generation
            return BCrypt.HashPassword(password, workFactor: 12);
        }

        public bool VerifyPassword(string password, string passwordHash)
        {
            return BCrypt.Verify(password, passwordHash);
        }
    }
}
```

### 2.4 Register Password Service

**File:** `Program.cs`

```csharp
// Add this with other service registrations
builder.Services.AddScoped<IPasswordService, PasswordService>();
```

---

## Step 3: Create JWT Token Service

### 3.1 Create Token Service Interface

**File:** `Services/ITokenService.cs`

```csharp
using DashboardPortal.Models;
using System.Security.Claims;

namespace DashboardPortal.Services
{
    public interface ITokenService
    {
        string GenerateToken(User user);
        ClaimsPrincipal? ValidateToken(string token);
    }
}
```

### 3.2 Create Token Service Implementation

**File:** `Services/TokenService.cs`

```csharp
using DashboardPortal.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace DashboardPortal.Services
{
    public class TokenService : ITokenService
    {
        private readonly JwtSettings _jwtSettings;

        public TokenService(JwtSettings jwtSettings)
        {
            _jwtSettings = jwtSettings;
        }

        public string GenerateToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.RoleName),
                new Claim("roleId", user.RoleId)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

            try
            {
                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = _jwtSettings.Issuer,
                    ValidAudience = _jwtSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                }, out SecurityToken validatedToken);

                return principal;
            }
            catch
            {
                return null;
            }
        }
    }
}
```

### 3.3 Register Token Service

**File:** `Program.cs`

```csharp
builder.Services.AddScoped<ITokenService, TokenService>();
```

---

## Step 4: Update Users Controller

### 4.1 Update DTOs

**File:** `DTOs/UserDto.cs`

```csharp
using System.ComponentModel.DataAnnotations;

namespace DashboardPortal.DTOs
{
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(8)]
        public string Password { get; set; }
    }

    public class LoginResponse
    {
        public string Token { get; set; }
        public string UserId { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string RoleId { get; set; }
        public string RoleName { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    public class RegisterRequest
    {
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(8)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
            ErrorMessage = "Password must contain: uppercase, lowercase, number, special char")]
        public string Password { get; set; }

        [Required]
        public string RoleId { get; set; }
    }
}
```

### 4.2 Update Users Controller

**File:** `Controllers/UsersController.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using DashboardPortal.Data;
using DashboardPortal.DTOs;
using DashboardPortal.Services;
using DashboardPortal.Models;
using System.Security.Claims;

namespace DashboardPortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordService _passwordService;
        private readonly ITokenService _tokenService;
        private readonly JwtSettings _jwtSettings;

        public UsersController(
            ApplicationDbContext context,
            IPasswordService passwordService,
            ITokenService tokenService,
            JwtSettings jwtSettings)
        {
            _context = context;
            _passwordService = passwordService;
            _tokenService = tokenService;
            _jwtSettings = jwtSettings;
        }

        // POST: api/users/login
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Validate input
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Find user
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

            if (user == null)
                return Unauthorized(new { message = "Invalid email or password" });

            // Verify password
            if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password" });

            // Generate token
            var token = _tokenService.GenerateToken(user);

            // Return response
            return Ok(new LoginResponse
            {
                Token = token,
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                RoleId = user.RoleId,
                RoleName = user.Role.RoleName,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes)
            });
        }

        // POST: api/users/register
        [HttpPost("register")]
        [Authorize(Roles = "Admin")]  // Only admins can create users
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return Conflict(new { message = "Email already registered" });

            // Verify role exists
            var roleExists = await _context.UserRoles.AnyAsync(r => r.RoleId == request.RoleId);
            if (!roleExists)
                return BadRequest(new { message = "Invalid role" });

            // Create user
            var user = new User
            {
                UserId = $"user-{Guid.NewGuid().ToString().Substring(0, 8)}",
                Username = request.Username,
                Email = request.Email,
                PasswordHash = _passwordService.HashPassword(request.Password),
                RoleId = request.RoleId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { userId = user.UserId }, new
            {
                userId = user.UserId,
                username = user.Username,
                email = user.Email
            });
        }

        // GET: api/users/{userId}
        [HttpGet("{userId}")]
        [Authorize]  // ✅ Require authentication
        public async Task<IActionResult> GetUser(string userId)
        {
            // Get current user from token
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

            // Authorization check: only own data or admin
            if (currentUserId != userId && currentUserRole != "Admin")
                return Forbid();

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId && u.IsActive);

            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                userId = user.UserId,
                username = user.Username,
                email = user.Email,
                roleId = user.RoleId,
                roleName = user.Role.RoleName
            });
        }

        // GET: api/users
        [HttpGet]
        [Authorize(Roles = "Admin")]  // Only admins can list all users
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.IsActive)
                .OrderBy(u => u.Username)
                .Select(u => new
                {
                    userId = u.UserId,
                    username = u.Username,
                    email = u.Email,
                    roleId = u.RoleId,
                    roleName = u.Role.RoleName
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/users/me
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId && u.IsActive);

            if (user == null)
                return NotFound();

            return Ok(new
            {
                userId = user.UserId,
                username = user.Username,
                email = user.Email,
                roleId = user.RoleId,
                roleName = user.Role.RoleName
            });
        }
    }
}
```

---

## Step 5: Secure Other Controllers

### 5.1 Example: ViewsController

**File:** `Controllers/ViewsController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace DashboardPortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]  // ✅ Require authentication for all actions
    public class ViewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ViewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Helper to get current user ID from token
        private string GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        // Helper to check if current user is admin
        private bool IsAdmin()
        {
            return User.IsInRole("Admin");
        }

        // GET: api/views/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<ViewDto>>> GetUserViews(string userId)
        {
            var currentUserId = GetCurrentUserId();

            // ✅ Authorization: only own views or admin can access
            if (currentUserId != userId && !IsAdmin())
                return Forbid();

            var views = await _context.Views
                .Include(v => v.ViewReports).ThenInclude(vr => vr.Report)
                .Include(v => v.ViewWidgets).ThenInclude(vw => vw.Widget)
                .Where(v => v.UserId == userId)
                .OrderBy(v => v.OrderIndex)
                .AsNoTracking()  // ✅ Performance improvement
                .ToListAsync();

            var viewDtos = views.Select(v => MapToDto(v)).ToList();
            return Ok(viewDtos);
        }

        // POST: api/views
        [HttpPost]
        public async Task<ActionResult<ViewDto>> CreateView([FromBody] CreateViewRequest request)
        {
            var currentUserId = GetCurrentUserId();

            // ✅ Validate user can only create for themselves
            if (request.UserId != currentUserId && !IsAdmin())
                return Forbid();

            // Input validation
            if (string.IsNullOrWhiteSpace(request.Data.Name))
                return BadRequest(new { message = "View name is required" });

            var view = new View
            {
                ViewId = $"view-{request.UserId}-{Guid.NewGuid().ToString().Substring(0, 8)}",
                UserId = request.UserId,
                Name = request.Data.Name,
                IsVisible = request.Data.IsVisible,
                OrderIndex = request.Data.OrderIndex,
                CreatedBy = currentUserId,  // ✅ Use token user, not request
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Views.Add(view);

            // Add reports (with validation)
            if (request.Data.ReportIds != null && request.Data.ReportIds.Any())
            {
                // ✅ Verify reports exist and user has access
                var validReports = await _context.Reports
                    .Where(r => request.Data.ReportIds.Contains(r.ReportId) && r.IsActive)
                    .Select(r => r.ReportId)
                    .ToListAsync();

                for (int i = 0; i < validReports.Count; i++)
                {
                    _context.ViewReports.Add(new ViewReport
                    {
                        ViewId = view.ViewId,
                        ReportId = validReports[i],
                        OrderIndex = i,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            // Similar for widgets...

            await _context.SaveChangesAsync();

            // Reload with includes
            view = await _context.Views
                .Include(v => v.ViewReports).ThenInclude(vr => vr.Report)
                .Include(v => v.ViewWidgets).ThenInclude(vw => vw.Widget)
                .AsNoTracking()
                .FirstAsync(v => v.ViewId == view.ViewId);

            return CreatedAtAction(nameof(GetView), new { id = view.ViewId, userId = request.UserId }, MapToDto(view));
        }

        // DELETE: api/views/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteView(string id, [FromQuery] string userId)
        {
            var currentUserId = GetCurrentUserId();

            // ✅ Validate ownership
            if (userId != currentUserId && !IsAdmin())
                return Forbid();

            var view = await _context.Views
                .FirstOrDefaultAsync(v => v.ViewId == id && v.UserId == userId);

            if (view == null)
                return NotFound(new { message = "View not found" });

            _context.Views.Remove(view);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private ViewDto MapToDto(View view)
        {
            // ... mapping logic
        }
    }
}
```

### 5.2 Apply Same Pattern to All Controllers

**Pattern:**
```csharp
[Authorize]  // On controller or individual actions
public class SomeController : ControllerBase
{
    private string GetCurrentUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    private bool IsAdmin() => User.IsInRole("Admin");
    
    // Validate ownership before every operation
    if (requestedUserId != GetCurrentUserId() && !IsAdmin())
        return Forbid();
}
```

---

## Step 6: Frontend Updates

### 6.1 Update Auth Service

**File:** `src/services/authService.ts`

```typescript
import { apiClient } from './apiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  username: string;
  email: string;
  roleId: string;
  roleName: string;
  expiresAt: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/Users/login', {
      email,
      password
    });
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('tokenExpiry', response.expiresAt);
    }
    
    return response;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('currentUser');
  },

  getToken: (): string | null => {
    const token = localStorage.getItem('authToken');
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (!token || !expiry) return null;
    
    // Check if token is expired
    if (new Date(expiry) < new Date()) {
      authService.logout();
      return null;
    }
    
    return token;
  },

  isAuthenticated: (): boolean => {
    return authService.getToken() !== null;
  }
};
```

### 6.2 Update API Client

**File:** `src/services/apiClient.ts`

```typescript
import { API_CONFIG } from '../config/api.config';
import { authService } from './authService';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Add auth token to headers
    const token = authService.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - token expired
      if (response.status === 401) {
        authService.logout();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new Error('You do not have permission to perform this action.');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: 'An error occurred'
        }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
```

### 6.3 Update Login Component

**File:** `src/components/auth/Login.tsx`

```typescript
import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { User } from '../../types';
import './styles/Login.css';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      
      // Map response to User type
      const user: User = {
        name: response.username,
        username: response.email,
        password: '', // Don't store password
        role: response.roleName.toLowerCase() as 'admin' | 'user' | 'viewer'
      };

      // Store user data
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Dashboard Portal</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};
```

---

## Step 7: Database Migration

### 7.1 Add Migration for PasswordHash

```bash
dotnet ef migrations add AddPasswordHash
dotnet ef database update
```

### 7.2 Script to Hash Existing Passwords

**File:** `Scripts/HashPasswords.sql` (Run manually)

```sql
-- Backup users first!
SELECT * INTO Users_Backup FROM Users;

-- Update users with hashed password
-- NOTE: You need to decide on a default password or contact users
-- This is just an example - DO NOT use in production without user communication

-- Option 1: Set a temporary password that users must change
UPDATE Users 
SET PasswordHash = '$2a$12$...'  -- Hash of "ChangeMe123!"
WHERE PasswordHash IS NULL OR PasswordHash = '';

-- Option 2: Send password reset emails to all users
```

---

## Step 8: Environment Variables Setup

### 8.1 Development

**File:** `.env.development` (Git ignored)

```bash
CONNECTION_STRING="Server=localhost;Database=DashboardPortal_Dev;Trusted_Connection=True;TrustServerCertificate=True;"
JWT_SECRET_KEY="your-super-secret-key-min-32-characters-long-for-development"
JWT_ISSUER="https://localhost:7273"
JWT_AUDIENCE="https://localhost:3000"
ALLOWED_ORIGINS="https://localhost:3000,http://localhost:3000"
```

### 8.2 Production

**Azure App Service Environment Variables:**

```bash
CONNECTION_STRING="Server=prod-server;Database=DashboardPortal;User Id=appuser;Password=***;..."
JWT_SECRET_KEY="production-secret-key-from-azure-key-vault"
JWT_ISSUER="https://api.yourdomain.com"
JWT_AUDIENCE="https://app.yourdomain.com"
ALLOWED_ORIGINS="https://app.yourdomain.com"
```

### 8.3 Update appsettings.json to use env vars

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "#{CONNECTION_STRING}#"
  },
  "JwtSettings": {
    "SecretKey": "#{JWT_SECRET_KEY}#",
    "Issuer": "#{JWT_ISSUER}#",
    "Audience": "#{JWT_AUDIENCE}#",
    "ExpirationMinutes": 60
  }
}
```

---

## Step 9: Rate Limiting

### 9.1 Add Rate Limiting

**File:** `Program.cs`

```csharp
using System.Threading.RateLimiting;

// Add rate limiting
builder.Services.AddRateLimiter(options =>
{
    // Global rate limit
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Request.Headers.Host.ToString(),
            factory: partition => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    // Login endpoint specific limit (stricter)
    options.AddPolicy("login", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1)
            }));
});

// In middleware pipeline
app.UseRateLimiter();
```

### 9.2 Apply to Login Endpoint

```csharp
[HttpPost("login")]
[AllowAnonymous]
[EnableRateLimiting("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    // ... login logic
}
```

---

## Step 10: Input Validation

### 10.1 Add FluentValidation (Optional but Recommended)

```bash
dotnet add package FluentValidation.AspNetCore --version 11.3.0
```

### 10.2 Create Validators

**File:** `Validators/CreateViewValidator.cs`

```csharp
using FluentValidation;
using DashboardPortal.DTOs;

namespace DashboardPortal.Validators
{
    public class CreateViewValidator : AbstractValidator<CreateViewRequest>
    {
        public CreateViewValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty()
                .MaximumLength(50);

            RuleFor(x => x.Data.Name)
                .NotEmpty()
                .MinimumLength(1)
                .MaximumLength(200)
                .Matches(@"^[a-zA-Z0-9\s\-_]+$")
                .WithMessage("Name can only contain letters, numbers, spaces, hyphens, and underscores");

            RuleFor(x => x.Data.ReportIds)
                .Must(ids => ids == null || ids.Count <= 50)
                .WithMessage("Maximum 50 reports allowed per view");

            RuleFor(x => x.Data.WidgetIds)
                .Must(ids => ids == null || ids.Count <= 50)
                .WithMessage("Maximum 50 widgets allowed per view");
        }
    }
}
```

### 10.3 Register Validators

**File:** `Program.cs`

```csharp
using FluentValidation;
using FluentValidation.AspNetCore;

builder.Services.AddControllers()
    .AddFluentValidation(config =>
    {
        config.RegisterValidatorsFromAssemblyContaining<Program>();
    });
```

---

## Testing the Implementation

### Test 1: Login Without Token (Should Fail)

```bash
curl -X GET https://localhost:7273/api/Views/user/user123
# Expected: 401 Unauthorized
```

### Test 2: Login and Get Token

```bash
curl -X POST https://localhost:7273/api/Users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!@#"
  }'

# Expected: 200 OK with token
# {"token":"eyJhbGc...", "userId":"...", ...}
```

### Test 3: Use Token to Access Protected Route

```bash
TOKEN="eyJhbGc..."

curl -X GET https://localhost:7273/api/Views/user/user123 \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with data (if authorized)
```

### Test 4: Try to Access Another User's Data

```bash
# User A trying to access User B's views
curl -X GET https://localhost:7273/api/Views/user/userB \
  -H "Authorization: Bearer $USER_A_TOKEN"

# Expected: 403 Forbidden
```

---

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Connection string secured (not in code)
- [ ] JWT secret key is 32+ characters
- [ ] CORS origins whitelisted (no AllowAll)
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Password hashing working (BCrypt)
- [ ] Token validation working
- [ ] Authorization checks on all endpoints
- [ ] Input validation on all DTOs
- [ ] Error logging configured
- [ ] Database migration completed
- [ ] Old password column removed/ignored
- [ ] Frontend updated to use tokens
- [ ] Token refresh mechanism (optional)
- [ ] Password reset flow (optional)

---

## Next Steps After Security

Once security is implemented:

1. **Add Logging** (Serilog)
2. **Add Health Checks**
3. **Performance Optimization** (caching, indexes)
4. **Unit Tests** (70% coverage)
5. **CI/CD Pipeline**
6. **Monitoring** (Application Insights)

---

**Implementation Complete!** 🎉

Your application now has:
- ✅ JWT authentication
- ✅ Password hashing
- ✅ Authorization checks
- ✅ Secure CORS
- ✅ Rate limiting
- ✅ Input validation
- ✅ Secure credentials

**Estimated Time:** 1-2 weeks for complete implementation and testing.
