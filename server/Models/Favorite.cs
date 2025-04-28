using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HotelReservation.Models
{
    public class Favorite
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("userId")]
        public string UserId { get; set; }

        [BsonElement("hotelId")]
        public string HotelId { get; set; }
    }
} 