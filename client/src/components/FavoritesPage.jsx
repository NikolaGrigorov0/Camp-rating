import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { hotelService } from '../services/hotelService';
import { useAuth } from '../auth/AuthContext';

export default function FavoritesPage() {
  const [favoriteHotels, setFavoriteHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavoriteHotels = async () => {
      if (!user) {
        navigate('/signIn');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (!user.favorites || user.favorites.length === 0) {
          setFavoriteHotels([]);
          setLoading(false);
          return;
        }

        const hotelPromises = user.favorites.map(id => hotelService.getHotelById(id));
        const hotelsData = await Promise.all(hotelPromises);

        const formattedHotels = hotelsData
          .filter(hotel => hotel) 
          .map(hotel => ({
            id: hotel._id || hotel.id,
            name: hotel.basicInfo.name,
            location: {
              city: hotel.location.city,
              country: hotel.location.country
            },
            price: Math.min(...hotel.rooms.map(room => room.pricePerNight)),
            rating: hotel.basicInfo.stars,
            image: hotel.basicInfo.images[0]
          }));

        setFavoriteHotels(formattedHotels);
      } catch (err) {
        console.error('Error fetching favorite hotels:', err);
        setError('Failed to load favorite hotels. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchFavoriteHotels();
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your favorites</h2>
          <Link to="/signIn" className="text-blue-600 hover:text-blue-800">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (favoriteHotels.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Favorite Hotels Yet</h2>
          <p className="mb-4">Start exploring hotels and add them to your favorites!</p>
          <Link
            to="/hotels"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Browse Hotels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Favorite Hotels</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteHotels.map(hotel => (
          <Link
            key={hotel.id}
            to={`/hotel/${hotel.id}`}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
          >
            <div className="relative h-48">
              <img
                src={hotel.image}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">{hotel.name}</h2>
              <div className="flex items-center text-gray-600 mb-2">
                <FaMapMarkerAlt className="mr-1" />
                <span>{hotel.location.city}, {hotel.location.country}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {[...Array(hotel.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <div className="text-lg font-bold text-blue-600">
                  ${hotel.price}/night
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 