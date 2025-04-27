using System;

namespace Mammooth.Common.DTOs
{
    public class ReviewDTO
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string CampId { get; set; }
        public string CampName { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateReviewDTO
    {
        public string CampId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
    }

    public class UpdateReviewDTO
    {
        public int Rating { get; set; }
        public string Comment { get; set; }
    }
}