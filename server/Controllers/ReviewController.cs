using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using server.Models;
using System.Security.Claims;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly IMongoCollection<Review> _reviews;
        private readonly IMongoCollection<Campground> _campgrounds;

        public ReviewController(IMongoClient client)
        {
            var database = client.GetDatabase("campgrounds_db");
            _reviews = database.GetCollection<Review>("reviews");
            _campgrounds = database.GetCollection<Campground>("campgrounds");
        }

        [HttpGet("campground/{campgroundId}")]
        public async Task<ActionResult<List<Review>>> GetCampgroundReviews(string campgroundId)
        {
            var reviews = await _reviews.Find(r => r.CampgroundId == campgroundId)
                .SortByDescending(r => r.CreatedAt)
                .ToListAsync();
            return Ok(reviews);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Review>> CreateReview([FromBody] Review review)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                // Verify campground exists
                var campground = await _campgrounds.Find(c => c.Id == review.CampgroundId).FirstOrDefaultAsync();
                if (campground == null)
                {
                    return NotFound("Campground not found");
                }

                // Set review properties
                review.UserId = userId;
                review.CreatedAt = DateTime.UtcNow;

                // Let MongoDB generate the ID
                await _reviews.InsertOneAsync(review);

                // Update campground rating
                var reviews = await _reviews.Find(r => r.CampgroundId == review.CampgroundId).ToListAsync();
                var averageRating = reviews.Average(r => r.Rating);
                await _campgrounds.UpdateOneAsync(
                    c => c.Id == review.CampgroundId,
                    Builders<Campground>.Update.Set(c => c.Rating, averageRating)
                );

                return CreatedAtAction(nameof(GetCampgroundReviews), new { campgroundId = review.CampgroundId }, review);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating review: {ex.Message}");
            }
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            var review = await _reviews.Find(r => r.Id == id).FirstOrDefaultAsync();
            if (review == null)
            {
                return NotFound();
            }

            if (review.UserId != userId)
            {
                return Unauthorized("You can only delete your own reviews");
            }

            await _reviews.DeleteOneAsync(r => r.Id == id);

            // Update campground rating
            var reviews = await _reviews.Find(r => r.CampgroundId == review.CampgroundId).ToListAsync();
            var averageRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0;
            await _campgrounds.UpdateOneAsync(
                c => c.Id == review.CampgroundId,
                Builders<Campground>.Update.Set(c => c.Rating, averageRating)
            );

            return NoContent();
        }
    }
} 