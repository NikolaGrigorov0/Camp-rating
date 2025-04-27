using Mammooth.Common.DTOs;
using Mammooth.Data.Context;
using Mammooth.Data.Entities;
using Mammooth.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Mammooth.Domain.Services
{
    public class ReviewService : IReviewService
    {
        private readonly AppDbContext _context;

        public ReviewService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ReviewDTO>> GetReviewsByCampIdAsync(string campId)
        {
            return await _context.Reviews
                .Where(r => r.CampId == campId)
                .Include(r => r.User)
                .Select(r => new ReviewDTO
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    UserName = r.User.UserName,
                    CampId = r.CampId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task<ReviewDTO> CreateReviewAsync(CreateReviewDTO reviewDto, string userId)
        {
            var review = new Review
            {
                Id = Guid.NewGuid().ToString(),
                UserId = userId,
                CampId = reviewDto.CampId,
                Rating = reviewDto.Rating,
                Comment = reviewDto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(userId);
            return new ReviewDTO
            {
                Id = review.Id,
                UserId = review.UserId,
                UserName = user.UserName,
                CampId = review.CampId,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt
            };
        }

        public async Task<ReviewDTO> UpdateReviewAsync(string reviewId, UpdateReviewDTO reviewDto, string userId)
        {
            var review = await _context.Reviews.FindAsync(reviewId);
            if (review == null)
                throw new Exception("Review not found");

            if (review.UserId != userId)
                throw new Exception("You can only update your own reviews");

            review.Rating = reviewDto.Rating;
            review.Comment = reviewDto.Comment;
            review.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(userId);
            return new ReviewDTO
            {
                Id = review.Id,
                UserId = review.UserId,
                UserName = user.UserName,
                CampId = review.CampId,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt,
                UpdatedAt = review.UpdatedAt
            };
        }

        public async Task DeleteReviewAsync(string reviewId, string userId)
        {
            var review = await _context.Reviews.FindAsync(reviewId);
            if (review == null)
                throw new Exception("Review not found");

            if (review.UserId != userId)
                throw new Exception("You can only delete your own reviews");

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
        }

        public async Task<List<ReviewDTO>> GetReviewsByUserIdAsync(string userId)
        {
            return await _context.Reviews
                .Where(r => r.UserId == userId)
                .Include(r => r.User)
                .Include(r => r.Camp)
                .Select(r => new ReviewDTO
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    UserName = r.User.UserName,
                    CampId = r.CampId,
                    CampName = r.Camp.Name,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt
                })
                .ToListAsync();
        }
    }
}