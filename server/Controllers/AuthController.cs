using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using HotelReservation.Models;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;

namespace HotelReservation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMongoCollection<User> _users;
        private readonly IConfiguration _configuration;
        private readonly IMongoCollection<Favorite> _favoritesCollection;

        public AuthController(IMongoClient mongoClient, IConfiguration configuration)
        {
            var database = mongoClient.GetDatabase("hotelReservationDB");
            _users = database.GetCollection<User>("users");
            _configuration = configuration;
            _favoritesCollection = database.GetCollection<Favorite>("favorites");
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto request)
        {
            if (await _users.Find(u => u.Email == request.Email).AnyAsync())
                return BadRequest(new { message = "User already exists." });

            CreatePasswordHash(request.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt
            };

            await _users.InsertOneAsync(user);

            string token = CreateToken(user);

            return Ok(new { token });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto request)
        {
            var user = await _users.Find(u => u.Email == request.Email).FirstOrDefaultAsync();
            if (user == null)
                return BadRequest("User not found.");

            if (!VerifyPasswordHash(request.Password, user.PasswordHash, user.PasswordSalt))
                return BadRequest("Wrong password.");

            string token = CreateToken(user);

            return Ok(new { 
                token,
                username = user.Username,
                email = user.Email,
                isAdmin = user.IsAdmin
            });
        }

        [HttpDelete("delete")]
        [Authorize]
        public async Task<IActionResult> DeleteUser([FromBody] DeleteUserRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null)
            {
                return NotFound("User not found");
            }

            if (user.Username != request.Username)
            {
                return BadRequest("Invalid username");
            }

            await _users.DeleteOneAsync(u => u.Id == userId);
            return Ok(new { message = "User deleted successfully" });
        }

        private string CreateToken(User user)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("JwtSettings:Key").Value));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                issuer: _configuration.GetSection("JwtSettings:Issuer").Value,
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds);

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return jwt;
        }

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            }
        }

        private bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512(passwordSalt))
            {
                var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
                return computedHash.SequenceEqual(passwordHash);
            }
        }

        [HttpPost("create-admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAdmin(UserRegisterDto request)
        {
            if (await _users.Find(u => u.Email == request.Email).AnyAsync())
                return BadRequest(new { message = "User already exists." });

            CreatePasswordHash(request.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                IsAdmin = true
            };

            await _users.InsertOneAsync(user);

            string token = CreateToken(user);

            return Ok(new { token });
        }

        [HttpPost("setup-admin")]
        public async Task<IActionResult> SetupAdmin(UserRegisterDto request)
        {
            // Check if any admin exists
            if (await _users.Find(u => u.IsAdmin).AnyAsync())
            {
                return BadRequest(new { message = "Admin account already exists." });
            }

            CreatePasswordHash(request.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                IsAdmin = true
            };

            await _users.InsertOneAsync(user);

            string token = CreateToken(user);

            return Ok(new { token });
        }

        [HttpPost("force-create-admin")]
        public async Task<IActionResult> ForceCreateAdmin(UserRegisterDto request)
        {
            CreatePasswordHash(request.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                IsAdmin = true
            };

            await _users.InsertOneAsync(user);

            string token = CreateToken(user);

            return Ok(new { 
                token,
                username = user.Username,
                email = user.Email,
                isAdmin = user.IsAdmin
            });
        }
    }

    public class UserRegisterDto
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class UserLoginDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class DeleteUserRequest
    {
        [Required]
        public string Username { get; set; }
    }
}