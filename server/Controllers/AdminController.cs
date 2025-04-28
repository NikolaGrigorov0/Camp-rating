using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MongoDB.Driver;
using System.Security.Claims;
using System.Threading.Tasks;
using HotelReservation.Models;

namespace HotelReservation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IMongoCollection<User> _users;
        private readonly IMongoCollection<Hotel> _hotels;

        public AdminController(IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase("hotelReservationDB");
            _users = database.GetCollection<User>("users");
            _hotels = database.GetCollection<Hotel>("hotels");
        }

        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null)
            {
                return NotFound("User not found");
            }

            await _users.DeleteOneAsync(u => u.Id == userId);
            return Ok(new { message = "User deleted successfully" });
        }

        [HttpPut("rooms/{hotelId}/{roomIndex}/availability")]
        public async Task<IActionResult> UpdateRoomAvailability(string hotelId, int roomIndex, [FromBody] bool available)
        {
            var hotel = await _hotels.Find(h => h.Id == hotelId).FirstOrDefaultAsync();
            if (hotel == null)
            {
                return NotFound("Hotel not found");
            }

            if (roomIndex < 0 || roomIndex >= hotel.Rooms.Count)
            {
                return BadRequest("Invalid room index");
            }

            hotel.Rooms[roomIndex].Available = available;
            await _hotels.ReplaceOneAsync(h => h.Id == hotelId, hotel);

            return Ok(new { message = "Room availability updated successfully" });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _users.Find(_ => true).ToListAsync();
            return Ok(users);
        }
    }
} 