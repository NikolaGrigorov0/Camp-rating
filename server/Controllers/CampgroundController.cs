using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using server.Models;
using HotelReservation.Models;
using System.Security.Claims;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CampgroundController : ControllerBase
    {
        private readonly IMongoCollection<Campground> _campgrounds;
        private readonly IMongoCollection<User> _users;

        public CampgroundController(IMongoClient client)
        {
            var database = client.GetDatabase("campgrounds_db");
            _campgrounds = database.GetCollection<Campground>("campgrounds");
            _users = database.GetCollection<User>("users");
        }

        [HttpGet]
        public async Task<ActionResult<List<Campground>>> GetCampgrounds()
        {
            var campgrounds = await _campgrounds.Find(campground => true).ToListAsync();
            return Ok(campgrounds);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Campground>> GetCampground(string id)
        {
            var campground = await _campgrounds.Find(c => c.Id == id).FirstOrDefaultAsync();
            if (campground == null)
            {
                return NotFound();
            }
            return Ok(campground);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Campground>> CreateCampground([FromBody] Campground campground)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null || !user.IsAdmin)
            {
                return Unauthorized("Only admins can create campgrounds");
            }

            campground.CreatedAt = DateTime.UtcNow;
            campground.UpdatedAt = DateTime.UtcNow;

            await _campgrounds.InsertOneAsync(campground);
            return CreatedAtAction(nameof(GetCampground), new { id = campground.Id }, campground);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCampground(string id, [FromBody] Campground updatedCampground)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null || !user.IsAdmin)
            {
                return Unauthorized("Only admins can update campgrounds");
            }

            var existingCampground = await _campgrounds.Find(c => c.Id == id).FirstOrDefaultAsync();
            if (existingCampground == null)
            {
                return NotFound();
            }

            updatedCampground.Id = id;
            updatedCampground.UpdatedAt = DateTime.UtcNow;
            updatedCampground.CreatedAt = existingCampground.CreatedAt;

            await _campgrounds.ReplaceOneAsync(c => c.Id == id, updatedCampground);
            return NoContent();
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCampground(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null || !user.IsAdmin)
            {
                return Unauthorized("Only admins can delete campgrounds");
            }

            var result = await _campgrounds.DeleteOneAsync(c => c.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound();
            }
            return NoContent();
        }

        [HttpGet("search")]
        public async Task<ActionResult<List<Campground>>> SearchCampgrounds(
            [FromQuery] string location = null,
            [FromQuery] double? minPrice = null,
            [FromQuery] double? maxPrice = null,
            [FromQuery] double? minRating = null)
        {
            var filterBuilder = Builders<Campground>.Filter;
            var filter = filterBuilder.Empty;

            if (!string.IsNullOrEmpty(location))
            {
                filter = filter & filterBuilder.Regex(c => c.Location, new MongoDB.Bson.BsonRegularExpression(location, "i"));
            }

            if (minPrice.HasValue)
            {
                filter = filter & filterBuilder.Gte(c => c.Price, (decimal)minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                filter = filter & filterBuilder.Lte(c => c.Price, (decimal)maxPrice.Value);
            }

            if (minRating.HasValue)
            {
                filter = filter & filterBuilder.Gte(c => c.Rating, minRating.Value);
            }

            var campgrounds = await _campgrounds.Find(filter).ToListAsync();
            return Ok(campgrounds);
        }
    }
} 