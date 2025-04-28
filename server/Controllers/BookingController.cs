using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MongoDB.Driver;
using System.Security.Claims;
using HotelReservation.Models;
using System.Threading.Tasks;

namespace HotelReservation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookingController : ControllerBase
    {
        private readonly IMongoCollection<Booking> _bookings;
        private readonly IMongoCollection<Hotel> _hotels;

        public BookingController(IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase("hotelReservationDB");
            _bookings = database.GetCollection<Booking>("bookings");
            _hotels = database.GetCollection<Hotel>("hotels");
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto bookingDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            // Verify hotel exists and get room by index
            var hotel = await _hotels.Find(h => h.Id == bookingDto.HotelId).FirstOrDefaultAsync();
            if (hotel == null)
            {
                return BadRequest(new { message = "Hotel not found" });
            }

            if (bookingDto.RoomIndex < 0 || bookingDto.RoomIndex >= hotel.Rooms.Count)
            {
                return BadRequest(new { message = "Invalid room index" });
            }

            var room = hotel.Rooms[bookingDto.RoomIndex];
            if (room == null)
            {
                return BadRequest(new { message = "Room not found" });
            }

            // Check if room is available for the selected dates
            var existingBooking = await _bookings.Find(b => 
                b.HotelId == bookingDto.HotelId && 
                b.RoomIndex == bookingDto.RoomIndex &&
                b.Status == "Confirmed" &&
                ((bookingDto.CheckIn >= b.CheckIn && bookingDto.CheckIn < b.CheckOut) ||
                 (bookingDto.CheckOut > b.CheckIn && bookingDto.CheckOut <= b.CheckOut) ||
                 (bookingDto.CheckIn <= b.CheckIn && bookingDto.CheckOut >= b.CheckOut))
            ).FirstOrDefaultAsync();

            if (existingBooking != null)
            {
                return BadRequest(new { message = "Room is not available for the selected dates" });
            }

            // Create new booking
            var booking = new Booking
            {
                HotelId = bookingDto.HotelId,
                RoomIndex = bookingDto.RoomIndex,
                UserId = userId,
                CheckIn = bookingDto.CheckIn,
                CheckOut = bookingDto.CheckOut,
                Guests = bookingDto.Guests,
                TotalPrice = bookingDto.TotalPrice,
                Status = "Confirmed"
            };

            await _bookings.InsertOneAsync(booking);

            return Ok(new { 
                message = "Booking created successfully",
                bookingId = booking.Id
            });
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetUserBookings()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var bookings = await _bookings.Find(b => b.UserId == userId)
                .SortByDescending(b => b.CreatedAt)
                .ToListAsync();

            return Ok(bookings);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelBooking(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var booking = await _bookings.Find(b => b.Id == id && b.UserId == userId).FirstOrDefaultAsync();
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found" });
            }

            if (booking.Status != "Confirmed")
            {
                return BadRequest(new { message = "Only confirmed bookings can be cancelled" });
            }

            var update = Builders<Booking>.Update.Set(b => b.Status, "Cancelled");
            await _bookings.UpdateOneAsync(b => b.Id == id, update);

            return Ok(new { message = "Booking cancelled successfully" });
        }
    }
} 