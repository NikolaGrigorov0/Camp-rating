import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaHeart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';

const CampDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [campground, setCampground] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  useEffect(() => {
    const fetchCampground = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const mockCampground = {
          id: id,
          name: 'Mountain View Campground',
          location: 'Rocky Mountains, CO',
          description: 'Beautiful mountain views with access to hiking trails. Perfect for hiking, fishing, and stargazing. The campground offers both tent and RV sites with modern amenities.',
          price: 35,
          rating: 4.5,
          images: [
            'https://images.unsplash.com/photo-1537905569824-f89f14cceb68',
            'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4',
            'https://images.unsplash.com/photo-1517824806704-9040b037703b'
          ],
          amenities: [
            'Fire pits',
            'Picnic tables',
            'Restrooms',
            'Showers',
            'Drinking water',
            'RV hookups'
          ],
          rules: [
            'Quiet hours: 10 PM - 6 AM',
            'No pets allowed',
            'Maximum 6 people per site',
            'No open fires during fire bans'
          ]
        };
        setCampground(mockCampground);
        if (user?.favorites) {
          setIsFavorite(user.favorites.includes(id));
        }
      } catch (err) {
        console.error('Error fetching campground:', err);
        setError('Failed to load campground details');
      } finally {
        setLoading(false);
      }
    };

    fetchCampground();
  }, [id, user]);

  const showFeedback = (message, isError = false) => {
    setFeedbackMessage({ text: message, isError });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleFavoriteClick = async () => {
    if (!user) {
      showFeedback('Please sign in to add campgrounds to your favorites', true);
      return;
    }

    try {
      // TODO: Implement favorite toggle API call
      setIsFavorite(!isFavorite);
      showFeedback(
        isFavorite ? 'Removed from favorites' : 'Added to favorites',
        false
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
      showFeedback('Failed to update favorites. Please try again.', true);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === campground.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? campground.images.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !campground) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error || 'Campground not found'}
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
            src={campground.images[currentImageIndex]}
            alt={`${campground.name} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>

        {campground.images.length > 1 && (
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
          {currentImageIndex + 1} / {campground.images.length}
        </div>

        <div className="absolute top-0 left-0 right-0 p-8 bg-gradient-to-b from-black to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white">{campground.name}</h1>
              <div className="flex items-center mt-2">
                <FaMapMarkerAlt className="text-white mr-2" />
                <span className="text-white">{campground.location}</span>
              </div>
            </div>
            <button
              onClick={handleFavoriteClick}
              className={`p-3 rounded-full transition-colors duration-300 ${
                isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
              }`}
            >
              <FaHeart className="text-2xl" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">About This Campground</h2>
              <p className="text-gray-700 mb-4">{campground.description}</p>
              
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-4">
                  {campground.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">Rules & Regulations</h3>
                <ul className="list-disc list-inside space-y-2">
                  {campground.rules.map((rule, index) => (
                    <li key={index} className="text-gray-700">{rule}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold">${campground.price}</span>
                <span className="text-gray-600">per night</span>
              </div>
              
              <div className="flex items-center mb-4">
                <FaStar className="text-yellow-400 mr-1" />
                <span className="text-gray-700">{campground.rating} / 5</span>
              </div>

              <button
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
                onClick={() => {
                  if (!user) {
                    showFeedback('Please sign in to make a reservation', true);
                    navigate('/signin');
                    return;
                  }
                  // TODO: Implement reservation functionality
                  showFeedback('Reservation feature coming soon!', false);
                }}
              >
                Make Reservation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampDetails; 