import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaSearch, FaStar } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';

const SearchBarWithMap = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [campgrounds, setCampgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Default coordinates (center of the US)
  const defaultCoordinates = [39.8283, -98.5795];
  const defaultZoom = 4;

  const fetchCampgrounds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5088/api/Campground', {
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
    fetchCampgrounds();
  }, [fetchCampgrounds]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set('destination', destination);
    navigate(`/search?${params.toString()}`);
  };

  const filteredCampgrounds = campgrounds.filter(campground => {
    return !destination || 
      campground.name.toLowerCase().includes(destination.toLowerCase()) ||
      campground.location.toLowerCase().includes(destination.toLowerCase());
  });

  if (loading && !campgrounds.length) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  // Get valid coordinates for the map center
  const mapCenter = filteredCampgrounds.length > 0 && 
                   Array.isArray(filteredCampgrounds[0].coordinates) && 
                   filteredCampgrounds[0].coordinates.length === 2
    ? filteredCampgrounds[0].coordinates
    : defaultCoordinates;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-6 sticky top-0 z-50">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <label className="block text-sm font-medium text-green-800 mb-1">Search Campgrounds</label>
                <div className="relative">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Search by campground name or location..."
                    className="w-full p-3 pl-10 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                  />
                  <FaSearch className="absolute left-3 top-3.5 text-green-400" />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3 space-y-6">
            {filteredCampgrounds.map((campground) => (
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
            {!loading && filteredCampgrounds.length === 0 && (
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
              {filteredCampgrounds.map(campground => (
                <Marker 
                  key={campground.id} 
                  position={campground.coordinates}
                  icon={L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="bg-white bg-opacity-90 text-black py-2 px-3 rounded-lg text-sm font-semibold shadow-md">
                      $${campground.price}
                    </div>`,
                    iconSize: [80, 30],
                    iconAnchor: [40, 15],
                  })}
                >
                  <Popup>
                    <div className="w-[300px] p-2">
                      <div className="flex flex-col">
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
                      <img 
                        src={campground.image} 
                        alt={campground.name} 
                        className="w-full h-[120px] object-cover rounded-md mt-2"
                      />
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
