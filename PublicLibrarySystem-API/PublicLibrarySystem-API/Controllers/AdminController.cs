using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PublicLibrarySystem_API.Data;
using PublicLibrarySystem_API.Models;
using PublicLibrarySystem_API.Data.Tables;

namespace PublicLibrarySystem_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly PublicLibrarySystemDBContext _context;

        public AdminController(PublicLibrarySystemDBContext context)
        {
            _context = context;
        }

        [HttpGet("GetUsersEmails")]
        public async Task<IActionResult> GetUsersEmails([FromQuery] string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Email query parameter is required.");
            }

            var users = await _context.Users
                .Where(u => u.IsEmailConfirmed && u.Email.ToLower().Contains(email.ToLower()))
                .Select(u => new 
                {
                    u.Id,
                    u.Email,
                    u.Username,
                    u.IsEmailConfirmed
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("GetUser")]
        public async Task<IActionResult> GetUser([FromQuery] Guid userId)
        {
            var user = await _context.Users
                .Where(u => u.IsEmailConfirmed && u.Id == userId)
                .Select(u => new 
                {
                    u.Id,
                    u.Email,
                    u.Username,
                    u.IsEmailConfirmed
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound("User not found");
            }

            var userRoles = await _context.UserRoles
                .Include(ur => ur.Role)
                .Where(ur => ur.UserID == userId)
                .Select(ur => ur.Role.Name)
                .ToListAsync();

            return Ok(new { user, roles = userRoles });
        }

        [HttpPost("UpdateUserRole")]
        public async Task<IActionResult> UpdateUserRole([FromBody] UserRoleUpdateRequest request)
        {
            if (request == null || request.UserID == Guid.Empty || string.IsNullOrEmpty(request.role))
            {
                return BadRequest("Invalid request data.");
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == request.UserID && u.IsEmailConfirmed);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            var userRole = await _context.UserRoles
                .FirstOrDefaultAsync(ur => ur.UserID == request.UserID);

            _context.UserRoles.Remove(userRole);
            var newUserRole = new UserRole
            {
                UserID = request.UserID,
                RoleID = _context.Roles.FirstOrDefault(r => r.Name == request.role).ID
            };

            _context.UserRoles.Add(newUserRole);
            await _context.SaveChangesAsync();
            return Ok("User role updated successfully.");
            
        }

    }
}
