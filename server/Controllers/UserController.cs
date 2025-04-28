using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using HotelReservation.Models;
using System.Security.Claims;

namespace HotelReservation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IMongoDatabase _database;

        public UserController(IMongoDatabase database)
        {
            _database = database;
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var usersCollection = _database.GetCollection<User>("users");
                var user = await usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound("User not found");
                }

                return Ok(new
                {
                    id = user.Id,
                    username = user.Username,
                    email = user.Email,
                    favorites = user.Favorites ?? new List<string>(),
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [Authorize]
        [HttpPost("toggleFavorite/{hotelId}")]
        public async Task<IActionResult> ToggleFavorite(string hotelId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var usersCollection = _database.GetCollection<User>("users");
                var user = await usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound("User not found");
                }

                if (user.Favorites == null)
                {
                    user.Favorites = new List<string>();
                }

                if (user.Favorites.Contains(hotelId))
                {
                    user.Favorites.Remove(hotelId);
                }
                else
                {
                    user.Favorites.Add(hotelId);
                }

                var update = Builders<User>.Update.Set(u => u.Favorites, user.Favorites);
                await usersCollection.UpdateOneAsync(u => u.Id == userId, update);

                return Ok(new { favorites = user.Favorites });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
} 