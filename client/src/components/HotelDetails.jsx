import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaPhone, FaEnvelope, FaChevronLeft, FaChevronRight, FaHeart, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { hotelService } from '../services/hotelService';
import { useAuth } from '../auth/AuthContext';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUserFavorites } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [bookingError, setBookingError] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        setLoading(true);
        const data = await hotelService.getHotelById(id);
        setHotel(data);
        if (user?.favorites) {
          setIsFavorite(user.favorites.includes(id));
        }
      } catch (err) {
        console.error('Error fetching hotel:', err);
        setError('Failed to load hotel details');
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id, user]);

  const showFeedback = (message, isError = false) => {
    setFeedbackMessage({ text: message, isError });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleFavoriteClick = async () => {
    if (!user) {
      showFeedback('Please sign in to add hotels to your favorites', true);
      return;
    }

    try {
      setIsTogglingFavorite(true);
      await hotelService.toggleFavorite(id);
      
      await updateUserFavorites();
      
      setIsFavorite(!isFavorite);
      
      showFeedback(
        isFavorite ? 'Removed from favorites' : 'Added to favorites',
        false
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
      showFeedback('Failed to update favorites. Please try again.', true);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === hotel.basicInfo.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? hotel.basicInfo.images.length - 1 : prevIndex - 1
    );
  };

  const handleBookNow = (room) => {
    if (!user) {
      showFeedback('Please sign in to book a room', true);
      navigate('/signin');
      return;
    }
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError(null);
    setIsBooking(true);

    try {
      // Validate dates
      const checkInDate = new Date(bookingDetails.checkIn);
      const checkOutDate = new Date(bookingDetails.checkOut);
      
      if (checkInDate >= checkOutDate) {
        throw new Error('Check-out date must be after check-in date');
      }

      if (checkInDate < new Date()) {
        throw new Error('Check-in date cannot be in the past');
      }

      if (bookingDetails.guests > selectedRoom.capacity) {
        throw new Error(`This room can only accommodate ${selectedRoom.capacity} guests`);
      }

      // Calculate total price
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const totalPrice = nights * selectedRoom.pricePerNight;

      // Format dates to ISO string and remove time portion
      const formattedCheckIn = checkInDate.toISOString().split('T')[0];
      const formattedCheckOut = checkOutDate.toISOString().split('T')[0];

      // Make API call to create booking
      const response = await fetch('http://localhost:5088/api/Booking', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hotelId: hotel.id,
          roomId: selectedRoom.id,
          checkIn: formattedCheckIn,
          checkOut: formattedCheckOut,
          guests: bookingDetails.guests,
          totalPrice: parseFloat(totalPrice.toFixed(2)) // Ensure price is a number with 2 decimal places
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const data = await response.json();

      // Show success message
      showFeedback('Booking confirmed successfully!', false);
      setShowBookingModal(false);
      
      // Reset booking form
      setBookingDetails({
        checkIn: '',
        checkOut: '',
        guests: 1
      });
      setSelectedRoom(null);

    } catch (error) {
      console.error('Booking error:', error);
      setBookingError(error.message);
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error || 'Hotel not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {feedbackMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            feedbackMessage.isError ? 'bg-red-500' : 'bg-green-500'
          } text-white transition-opacity duration-300`}
        >
          {feedbackMessage.text}
        </div>
      )}


      <div className="relative h-[600px] bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={hotel.basicInfo.images[currentImageIndex]}
            alt={`${hotel.basicInfo.name} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-contain"
          />
        </div>

        {hotel.basicInfo.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-3 rounded-full 
                hover:bg-opacity-75 hover:scale-110 hover:shadow-lg 
                transition-all duration-300 ease-in-out
                group"
            >
              <FaChevronLeft className="text-2xl text-black group-hover:text-blue-600 transition-colors duration-300" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-3 rounded-full 
                hover:bg-opacity-75 hover:scale-110 hover:shadow-lg 
                transition-all duration-300 ease-in-out
                group"
            >
              <FaChevronRight className="text-2xl text-black group-hover:text-blue-600 transition-colors duration-300" />
            </button>
          </>
        )}

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-4 py-2 rounded-full text-white">
          {currentImageIndex + 1} / {hotel.basicInfo.images.length}
        </div>

        <div className="absolute top-0 left-0 right-0 p-8 bg-gradient-to-b from-black to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white">{hotel.basicInfo.name}</h1>
              <div className="flex items-center mt-2">
                <FaStar className="text-yellow-400 mr-1" />
                <span className="text-white">{hotel.basicInfo.stars} stars</span>
              </div>
            </div>
            <button
              onClick={handleFavoriteClick}
              disabled={isTogglingFavorite}
              className={`
                absolute top-4 right-4 
                p-3 rounded-full 
                transform transition-all duration-300
                hover:scale-110
                ${isTogglingFavorite ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isFavorite 
                  ? 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 hover:shadow-lg'
                }
              `}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <FaHeart 
                className={`
                  text-2xl transform transition-all duration-300
                  ${isFavorite ? 'text-white scale-110' : 'text-gray-600'}
                  ${isTogglingFavorite ? 'animate-pulse' : ''}
                  hover:scale-110
                `}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <p className="text-gray-600 mb-6">{hotel.basicInfo.description}</p>
              
              <h2 className="text-2xl font-bold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 gap-4">
                {hotel.basicInfo.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center text-gray-600">
                    <span className="mr-2">•</span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Location & Contact</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-blue-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium">{hotel.location.street}</p>
                    <p className="text-gray-600">{hotel.location.city}, {hotel.location.country}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaPhone className="text-blue-500 mr-3" />
                  <p className="text-gray-600">{hotel.contact.phone}</p>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="text-blue-500 mr-3" />
                  <p className="text-gray-600">{hotel.contact.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Available Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotel.rooms.map((room, index) => (
              <div key={index} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {room.images && room.images.length > 0 && (
                  <div className="relative h-48">
                    <img
                      src={room.images[0]}
                      alt={`${room.type} room`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg">{room.type}</h3>
                  <p className="text-gray-600 mt-1">{room.description}</p>
                  <div className="mt-2">
                    <p className="text-gray-600">Capacity: {room.capacity} guests</p>
                    <p className="text-blue-600 font-bold mt-1">${room.pricePerNight}/night</p>
                  </div>
                  <button
                    onClick={() => handleBookNow(room)}
                    disabled={!room.available}
                    className={`mt-4 w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      room.available
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {room.available ? 'Book Now' : 'Not Available'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Book Room</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {bookingError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                {bookingError}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in Date
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDetails.checkIn}
                    onChange={(e) => setBookingDetails(prev => ({
                      ...prev,
                      checkIn: e.target.value
                    }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out Date
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    required
                    min={bookingDetails.checkIn || new Date().toISOString().split('T')[0]}
                    value={bookingDetails.checkOut}
                    onChange={(e) => setBookingDetails(prev => ({
                      ...prev,
                      checkOut: e.target.value
                    }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Guests
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedRoom?.capacity || 1}
                    value={bookingDetails.guests}
                    onChange={(e) => setBookingDetails(prev => ({
                      ...prev,
                      guests: parseInt(e.target.value)
                    }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Maximum capacity: {selectedRoom?.capacity} guests
                </p>
              </div>

              {bookingDetails.checkIn && bookingDetails.checkOut && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <p>Room Type: {selectedRoom?.type}</p>
                    <p>Price per night: ${selectedRoom?.pricePerNight}</p>
                    <p>Number of nights: {
                      Math.ceil(
                        (new Date(bookingDetails.checkOut) - new Date(bookingDetails.checkIn)) / 
                        (1000 * 60 * 60 * 24)
                      )
                    }</p>
                    <p className="font-bold">
                      Total Price: ${
                        selectedRoom?.pricePerNight * 
                        Math.ceil(
                          (new Date(bookingDetails.checkOut) - new Date(bookingDetails.checkIn)) / 
                          (1000 * 60 * 60 * 24)
                        )
                      }
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBooking}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg font-medium ${
                    isBooking ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                >
                  {isBooking ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetails;
