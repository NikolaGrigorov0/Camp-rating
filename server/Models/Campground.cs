using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace server.Models
{
    public class Campground
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [Required]
        [BsonElement("name")]
        public string Name { get; set; }

        [Required]
        [BsonElement("description")]
        public string Description { get; set; }

        [Required]
        [BsonElement("location")]
        public string Location { get; set; }

        [Required]
        [BsonElement("price")]
        public decimal Price { get; set; }

        [Required]
        [Range(0, 5)]
        [BsonElement("rating")]
        public double Rating { get; set; }

        [Required]
        [BsonElement("image")]
        public string Image { get; set; }

        [Required]
        [BsonElement("coordinates")]
        public double[] Coordinates { get; set; }

        [Required]
        [BsonElement("amenities")]
        public string[] Amenities { get; set; }

        [Required]
        [BsonElement("capacity")]
        public int Capacity { get; set; }

        [JsonIgnore]
        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonIgnore]
        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; }
    }
} 