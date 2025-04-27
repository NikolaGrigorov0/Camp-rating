using Mammooth.Common.DTOs;
using Mammooth.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Mammooth.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : Controller
    {
        private readonly IReviewService _reviewService;
        private readonly IAuthService _authService;

        public ReviewController(IReviewService reviewService, IAuthService authService)
        {
            _reviewService = reviewService;
            _authService = authService;
        }

        private async Task<string> GetUserIdFromToken()
        {
            var authHeader = HttpContext.Request.Headers["Authorization"].ToString().Trim();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                throw new Exception("Token missing or invalid.");

            var token = authHeader.Substring("Bearer ".Length).Trim();
            var (user, roles) = await _authService.GetUserFromTokenAsync(token);

            if (user == null)
                throw new Exception("Invalid token.");

            return user.Id;
        }

        [HttpGet("GetReviewsByCampId/{campId}")]
        public async Task<IActionResult> GetReviewsByCampId(string campId)
        {
            try
            {
                var reviews = await _reviewService.GetReviewsByCampIdAsync(campId);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("CreateReview")]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDTO reviewDto)
        {
            try
            {
                var userId = await GetUserIdFromToken();
                var review = await _reviewService.CreateReviewAsync(reviewDto, userId);
                return Ok(review);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("UpdateReview/{reviewId}")]
        public async Task<IActionResult> UpdateReview(string reviewId, [FromBody] UpdateReviewDTO reviewDto)
        {
            try
            {
                var userId = await GetUserIdFromToken();
                var review = await _reviewService.UpdateReviewAsync(reviewId, reviewDto, userId);
                return Ok(review);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("DeleteReview/{reviewId}")]
        public async Task<IActionResult> DeleteReview(string reviewId)
        {
            try
            {
                var userId = await GetUserIdFromToken();
                await _reviewService.DeleteReviewAsync(reviewId, userId);
                return Ok(new { message = "Review deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetUserReviews")]
        public async Task<IActionResult> GetUserReviews()
        {
            try
            {
                var userId = await GetUserIdFromToken();
                var reviews = await _reviewService.GetReviewsByUserIdAsync(userId);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}