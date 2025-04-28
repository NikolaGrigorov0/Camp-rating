using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HotelReservation.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

         [BsonElement("username")]
        public string Username { get; set; }

        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("passwordHash")]
        public byte[] PasswordHash { get; set; }

        [BsonElement("passwordSalt")]
        public byte[] PasswordSalt { get; set; }
        
        [BsonElement("favorites")]
        public List<string> Favorites { get; set; } = new List<string>();

        [BsonElement("isAdmin")]
        public bool IsAdmin { get; set; } = false;
    }
}