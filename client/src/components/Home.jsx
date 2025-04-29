import { useState, useEffect } from 'react';
import { FaSearch, FaStar, FaWifi, FaSwimmingPool, FaParking, FaUtensils } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [campgrounds, setCampgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampgrounds = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5088/api/Campground');
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized access');
          }
          throw new Error('Failed to fetch campgrounds');
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }

        setCampgrounds(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching campgrounds:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampgrounds();
  }, []);

  const featuredCampgrounds = campgrounds.slice(0, 3);

  const amenities = [
    { icon: <FaWifi className="text-2xl" />, name: "Free WiFi" },
    { icon: <FaSwimmingPool className="text-2xl" />, name: "Swimming Pool" },
    { icon: <FaParking className="text-2xl" />, name: "Free Parking" },
    { icon: <FaUtensils className="text-2xl" />, name: "Restaurant" },
  ];

  if (loading && !campgrounds.length) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="relative h-[500px] bg-green-800 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-green-700/80"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Find Your Perfect Campground</h1>
            <p className="text-xl text-green-100 mb-8">Discover and book amazing campgrounds around the world</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white rounded-xl shadow-xl p-6 border border-green-100">
          <h2 className="text-2xl font-bold text-green-900 mb-6">Search Campgrounds</h2>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by campground name..."
                  className="w-full p-3 pl-10 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                />
                <FaSearch className="absolute left-3 top-3.5 text-green-400" />
              </div>
            </div>
          </div>
          <Link
            to={{
              pathname: "/search",
              search: `?search=${encodeURIComponent(searchTerm)}`
            }}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition duration-300 shadow-md hover:shadow-lg text-center block"
          >
            Search Campgrounds
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4 text-green-900">Featured Campgrounds</h2>
        <p className="text-center text-green-600 mb-12">Discover our most popular destinations</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredCampgrounds.map((campground) => (
            <Link 
              to={`/campgrounds/${campground.id}`}
              key={campground.id}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-[1.02] group"
            >
              <div className="h-60 overflow-hidden relative">
                <img
                  src={campground.image}
                  alt={campground.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute bottom-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ${campground.price}/night
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-green-900">{campground.name}</h3>
                  <div className="flex items-center bg-green-100 px-2 py-1 rounded">
                    <FaStar className="text-yellow-500 mr-1" />
                    <span className="font-medium text-green-800">{campground.rating}</span>
                  </div>
                </div>
                <p className="text-green-600 mb-4">{campground.location}</p>
                <button className="w-full bg-green-100 hover:bg-green-200 text-green-800 py-2 px-4 rounded-lg font-medium transition duration-300">
                  View Details
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-green-800 py-16 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Our Amenities</h2>
          <p className="text-center text-green-200 mb-12">Everything you need for a perfect camping experience</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex flex-col items-center p-6 bg-green-700 rounded-xl hover:bg-green-600 transition-colors">
                <div className="text-white mb-3">{amenity.icon}</div>
                <h3 className="text-lg font-medium">{amenity.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for an unforgettable camping experience?</h2>
          <p className="text-xl mb-8 text-green-100">Join thousands of satisfied campers who've enjoyed our premium campgrounds</p>
          <Link
            to="/search"
            className="inline-block bg-white text-green-800 hover:bg-green-100 py-3 px-8 rounded-lg font-bold text-lg transition duration-300 shadow-lg hover:shadow-xl"
          >
            Book Your Stay Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;