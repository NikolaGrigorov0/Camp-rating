using Mammooth.Common.DTOs;

namespace Mammooth.Domain.Interfaces
{
    public interface IReviewService
    {
        Task<List<ReviewDTO>> GetReviewsByCampIdAsync(string campId);
        Task<List<ReviewDTO>> GetReviewsByUserIdAsync(string userId);
        Task<ReviewDTO> CreateReviewAsync(CreateReviewDTO reviewDto, string userId);
        Task<ReviewDTO> UpdateReviewAsync(string reviewId, UpdateReviewDTO reviewDto, string userId);
        Task DeleteReviewAsync(string reviewId, string userId);
    }
}