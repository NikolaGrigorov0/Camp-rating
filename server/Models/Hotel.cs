using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace HotelReservation.Models
{
    public class Hotel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("basicInfo")]
        public BasicInfo BasicInfo { get; set; }

        [BsonElement("location")]
        public Location Location { get; set; }

        [BsonElement("contact")]
        public Contact Contact { get; set; }

        [BsonElement("rooms")]
        public List<Room> Rooms { get; set; }
    }

    public class BasicInfo
    {
        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("description")]
        public string Description { get; set; }

        [BsonElement("stars")]
        public int Stars { get; set; }

        [BsonElement("images")]
        public List<string> Images { get; set; }

        [BsonElement("amenities")]
        public List<string> Amenities { get; set; }
    }

    public class Location
    {
        [BsonElement("street")]
        public string Street { get; set; }

        [BsonElement("city")]
        public string City { get; set; }

        [BsonElement("country")]
        public string Country { get; set; }

        [BsonElement("locationType")]
        public string LocationType { get; set; } = "Point";

        [BsonElement("coordinates")]
        public double[] Coordinates { get; set; } // [longitude, latitude]
    }

    public class Contact
    {
        [BsonElement("phone")]
        public string Phone { get; set; }

        [BsonElement("email")]
        public string Email { get; set; }
    }

    public class Room
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("type")]
        public string Type { get; set; }

        [BsonElement("description")]
        public string Description { get; set; }

        [BsonElement("pricePerNight")]
        public decimal PricePerNight { get; set; }

        [BsonElement("capacity")]
        public int Capacity { get; set; }

        [BsonElement("images")]
        public List<string> Images { get; set; }

        [BsonElement("available")]
        public bool Available { get; set; }
    }
} 