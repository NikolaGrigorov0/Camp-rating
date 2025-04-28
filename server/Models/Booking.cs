using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace HotelReservation.Models
{
    public class Booking
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("hotelId")]
        public string HotelId { get; set; }

        [BsonElement("roomIndex")]
        public int RoomIndex { get; set; }

        [BsonElement("userId")]
        public string UserId { get; set; }

        [BsonElement("checkIn")]
        public DateTime CheckIn { get; set; }

        [BsonElement("checkOut")]
        public DateTime CheckOut { get; set; }

        [BsonElement("guests")]
        public int Guests { get; set; }

        [BsonElement("totalPrice")]
        public decimal TotalPrice { get; set; }

        [BsonElement("status")]
        public string Status { get; set; } = "Confirmed"; // Can be: Confirmed, Cancelled, Completed

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class CreateBookingDto
    {
        public string HotelId { get; set; }
        public int RoomIndex { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public int Guests { get; set; }
        public decimal TotalPrice { get; set; }
    }
} 