using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PublicLibrarySystem_API.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Models = PublicLibrarySystem_API.Models;
using PublicLibrarySystem_API.Data.Tables;
using Microsoft.EntityFrameworkCore;
using System.Net;
using PublicLibrarySystem_API.Services;

namespace PublicLibrarySystem_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AuthController : ControllerBase
    {
        private readonly PublicLibrarySystemDBContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthController(PublicLibrarySystemDBContext context, IPasswordHasher<User> passwordHasher, IConfiguration configuration, IEmailService emailService)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _configuration = configuration;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Models.RegisterRequest request)
        {
            // Validate request and check if user exists
            var user = new User
            {
                Email = request.Email,
                Username = request.Username
            };

            var count = await _context.Users.CountAsync(u => u.Username.ToUpper() == user.Username.ToUpper() || u.Email.ToUpper() == user.Email.ToUpper());

            if (count > 0)
            {
                return BadRequest(new { message = "Account already exists with Username or Email " });
            }

            // Hash the password securely
            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
            _context.Users.Add(user);
            _context.UserRoles.Add(new UserRole
            {
                UserID = user.Id,
                RoleID = _context.Roles.FirstOrDefault(r => r.Name == "User").ID
            });

            string confirmationLink = $"{_configuration["UIBaseURL"]}/auth/confirmemail?token={WebUtility.UrlEncode(GenerateJwtConfirmationToken(user))}";

            string htmlBody = $@"
                <!DOCTYPE html>
                <html lang=""en"">
                  <head>
                    <meta charset=""UTF-8"">
                    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                    <title>Confirm Your Email</title>
                    <style>
                      body {{
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                      }}
                      .container {{
                        max-width: 600px;
                        margin: 30px auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                      }}
                      h1 {{
                        color: #333333;
                      }}
                      p {{
                        color: #555555;
                        line-height: 1.5;
                      }}
                      .button {{
                        display: inline-block;
                        padding: 12px 24px;
                        margin-top: 20px;
                        background-color: #007bff;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                      }}
                      .footer {{
                        margin-top: 30px;
                        font-size: 0.9em;
                        color: #777777;
                      }}
                    </style>
                  </head>
                  <body>
                    <div class=""container"">
                      <h1>Confirm Your Email Address</h1>
                      <p>Hello,</p>
                      <p>Thank you for registering with our service. To complete your registration, please confirm your email address by clicking the button below:</p>
                      <p style=""text-align: center;"">
                        <a href=""{confirmationLink}"" class=""button"">Confirm Email</a>
                      </p>
                      <p>If the button does not work, copy and paste the following link into your browser:</p>
                      <p>{confirmationLink}</p>
                      <div class=""footer"">
                        <p>This link expires in 24 hours.</p>
                        <p>If you did not register for our service, please ignore this email.</p>
                      </div>
                    </div>
                  </body>
                </html>
                ";

            await _emailService.SendEmail(user.Email, "Confrim your Email", null, htmlBody, false, null, null);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "User registered successfully" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Models.LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username.ToUpper() == request.EmailOrUsername.ToUpper() || u.Email.ToUpper() == request.EmailOrUsername.ToUpper());
            if (user == null)
                return Unauthorized(new { message = "Invalid username or password" });

            // Verify the provided password against the stored hash
            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (result != PasswordVerificationResult.Success)
                return Unauthorized(new { message = "Invalid username or password" });

            // Generate JWT token
            var token = GenerateJwtToken(user);
            return Ok(new { Token = token, IsEmailConfirmed = user.IsEmailConfirmed });
        }

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:EmailConfirmationKey"]);
            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuerSigningKey = true,
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var userId = jwtToken.Claims.First(x => x.Type == "userId").Value;

                var user = await _context.Users.FindAsync(Guid.Parse(userId));
                if (user == null)
                {
                    return BadRequest(new { message = "Invalid token." });
                } else if (user.IsEmailConfirmed)
                {
                    return BadRequest(new { message = "Email already confirmed." });
                }

                user.IsEmailConfirmed = true;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Email confirmed successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Invalid or expired token." });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);
            var roles = _context.UserRoles
                .Where(ur => ur.UserID == user.Id)
                .Select(ur => ur.Role.Name)
                .ToList();

            var rolesString = string.Join(",", roles);
            
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("userId", user.Id.ToString()),
                new Claim("role", rolesString),
                // Add additional claims as needed
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string GenerateJwtConfirmationToken(User user)
        {
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:EmailConfirmationKey"]); // a separate secret
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] {
                    new Claim("userId", user.Id.ToString())
                }),
                Expires = DateTime.UtcNow.AddHours(24),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

    }
}
