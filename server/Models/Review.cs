using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace server.Models
{
    public class Review
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [Required]
        [BsonElement("campgroundId")]
        public string CampgroundId { get; set; }

        [Required]
        [BsonElement("userId")]
        public string UserId { get; set; }

        [Required]
        [BsonElement("userName")]
        public string UserName { get; set; }

        [Required]
        [Range(1, 5)]
        [BsonElement("rating")]
        public int Rating { get; set; }

        [Required]
        [BsonElement("comment")]
        public string Comment { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class CreateReviewDto
    {
        [Required]
        public string CampgroundId { get; set; }

        [Required]
        public string UserName { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        public string Comment { get; set; }
    }
} 