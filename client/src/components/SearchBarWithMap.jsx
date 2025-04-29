import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaSearch, FaCalendarAlt, FaUser, FaStar, FaCampground } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';

const SearchBarWithMap = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [campgrounds, setCampgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Default coordinates (center of the US)
  const defaultCoordinates = [39.8283, -98.5795];
  const defaultZoom = 4;

  const fetchCampgrounds = useCallback(async (searchQuery = '') => {
    try {
      setLoading(true);
      const url = searchQuery 
        ? `http://localhost:5088/api/Campground/search?name=${encodeURIComponent(searchQuery)}`
        : 'http://localhost:5088/api/Campground';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': user?.token ? `Bearer ${user.token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
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

      // Validate and clean campground data
      const validatedCampgrounds = data.map(campground => ({
        ...campground,
        coordinates: Array.isArray(campground.coordinates) && 
                    campground.coordinates.length === 2 &&
                    typeof campground.coordinates[0] === 'number' &&
                    typeof campground.coordinates[1] === 'number'
          ? campground.coordinates
          : defaultCoordinates
      }));

      setCampgrounds(validatedCampgrounds);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching campgrounds:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCampgrounds(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchCampgrounds]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading && !campgrounds.length) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  // Get valid coordinates for the map center
  const mapCenter = campgrounds.length > 0 && 
                   Array.isArray(campgrounds[0].coordinates) && 
                   campgrounds[0].coordinates.length === 2
    ? campgrounds[0].coordinates
    : defaultCoordinates;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-6 sticky top-0 z-50">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <label className="block text-sm font-medium text-green-800 mb-1">Search Campgrounds</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search by campground name..."
                  className="w-full p-3 pl-10 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                />
                <FaSearch className="absolute left-3 top-3.5 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3 space-y-6">
            {campgrounds.map((campground) => (
              <Link 
                to={`/campgrounds/${campground.id}`}
                key={campground.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden flex transition-transform duration-300 hover:scale-[1.02]"
              >
                <img src={campground.image} alt={campground.name} className="w-1/3 object-cover" />
                <div className="w-2/3 p-6">
                  <h2 className="text-xl font-bold">{campground.name}</h2>
                  <p className="text-gray-600 my-2">{campground.location}</p>
                  <p className="text-2xl font-bold text-green-600">${campground.price} <span className="text-sm text-gray-500">/ night</span></p>
                  <div className="flex items-center mt-2">
                    <FaStar className="text-yellow-500 mr-1" />
                    <span className="text-gray-600">{campground.rating} / 5</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {campground.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {amenity}
                      </span>
                    ))}
                    {campground.amenities.length > 3 && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        +{campground.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {!loading && campgrounds.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No campgrounds found matching your search.</p>
              </div>
            )}
          </div>

          <div className="md:w-1/3 h-[500px] sticky top-24">
            <MapContainer 
              center={mapCenter}
              zoom={defaultZoom}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {campgrounds.map(campground => (
                <Marker 
                  key={campground.id} 
                  position={campground.coordinates}
                  icon={L.divIcon({
                    className: 'cursor-pointer',
                    html: `<div class="bg-white bg-opacity-90 text-black py-2 rounded-lg text-sm font-semibold shadow-md cursor-pointer">
                      $${campground.price}
                    </div>`,
                    iconSize: [60, 30],
                    iconAnchor: [30, 15],
                  })}
                  eventHandlers={{
                    click: () => navigate(`/campgrounds/${campground.id}`),
                    mouseover: (e) => {
                      e.target.openPopup();
                    },
                    mouseout: (e) => {
                      e.target.closePopup();
                    },
                  }}
                >
                  <Popup>
                    <div className="flex w-[320px] p-2">
                      <div className="flex-1 pr-3">
                        <h3 className="text-lg font-semibold mb-1">{campground.name}</h3>
                        <p className="text-gray-600">{campground.location}</p>
                        <p className="text-gray-800 mt-1 font-medium">Price: ${campground.price}/night</p>
                        <p className="text-gray-800">Rating: {campground.rating} ⭐</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {campground.amenities.slice(0, 2).map((amenity, index) => (
                            <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {amenity}
                            </span>
                          ))}
                        </div>
                        <button 
                          onClick={() => navigate(`/campgrounds/${campground.id}`)}
                          className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                      <img src={campground.image} alt={campground.name} className="w-[150px] h-[110px] object-cover rounded-md"/>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBarWithMap;
