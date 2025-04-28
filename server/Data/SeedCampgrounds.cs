using server.Models;
using MongoDB.Driver;

namespace server.Data
{
    public static class SeedCampgrounds
    {
        public static List<Campground> GetSampleCampgrounds()
        {
            return new List<Campground>
            {
                new Campground
                {
                    Name = "Mountain View Campground",
                    Description = "A beautiful campground nestled in the mountains with stunning views and excellent hiking trails nearby. Perfect for families and outdoor enthusiasts.",
                    Location = "Rocky Mountain National Park, Colorado",
                    Price = 45.00m,
                    Rating = 4.8,
                    Image = "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
                    Coordinates = new double[] { -105.5508, 40.3428 },
                    Amenities = new string[] { 
                        "Tent Sites", 
                        "RV Hookups", 
                        "Restrooms", 
                        "Showers", 
                        "Fire Pits", 
                        "Picnic Tables",
                        "Hiking Trails",
                        "Wildlife Viewing"
                    },
                    Capacity = 6,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Campground
                {
                    Name = "Lakeside Retreat",
                    Description = "A peaceful campground located right on the shores of a pristine mountain lake. Great for fishing, swimming, and relaxing by the water.",
                    Location = "Lake Tahoe, California",
                    Price = 55.00m,
                    Rating = 4.9,
                    Image = "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
                    Coordinates = new double[] { -120.0324, 39.0968 },
                    Amenities = new string[] { 
                        "Tent Sites", 
                        "RV Hookups", 
                        "Restrooms", 
                        "Showers", 
                        "Boat Launch", 
                        "Fishing Dock",
                        "Swimming Area",
                        "Camp Store"
                    },
                    Capacity = 8,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };
        }

        public static async Task SeedDatabase(IMongoClient client)
        {
            var database = client.GetDatabase("campgrounds_db");
            var collection = database.GetCollection<Campground>("campgrounds");

            // Clear existing data
            await collection.DeleteManyAsync(_ => true);

            // Insert new data
            var campgrounds = GetSampleCampgrounds();
            await collection.InsertManyAsync(campgrounds);

            Console.WriteLine("Successfully seeded campgrounds database!");
        }
    }
} 