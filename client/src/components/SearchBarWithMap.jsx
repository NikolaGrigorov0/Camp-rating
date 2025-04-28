import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaSearch, FaCalendarAlt, FaUser, FaStar, FaCampground } from 'react-icons/fa';

const SearchBarWithMap = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests')) || 1);
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [campgrounds, setCampgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampgrounds = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const mockCampgrounds = [
          {
            id: '1',
            name: 'Mountain View Campground',
            location: 'Rocky Mountains, CO',
            description: 'Beautiful mountain views with access to hiking trails',
            price: 35,
            rating: 4.5,
            image: 'https://images.unsplash.com/photo-1537905569824-f89f14cceb68',
            coordinates: [39.7392, -104.9903],
            amenities: ['Fire pits', 'Picnic tables', 'Restrooms', 'Showers'],
            capacity: 6
          },
          {
            id: '2',
            name: 'Lakeside Retreat',
            location: 'Lake Tahoe, CA',
            description: 'Peaceful lakeside camping with water activities',
            price: 45,
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4',
            coordinates: [39.0968, -120.0324],
            amenities: ['RV hookups', 'Boat launch', 'Fishing pier', 'Store'],
            capacity: 8
          }
        ];
        setCampgrounds(mockCampgrounds);
      } catch (err) {
        setError('Failed to fetch campgrounds');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampgrounds();
  }, []);

  const filteredCampgrounds = campgrounds.filter(campground => {
    const searchTerm = destination.toLowerCase();
    const matchesSearch = 
      campground.name.toLowerCase().includes(searchTerm) ||
      campground.location.toLowerCase().includes(searchTerm);

    const hasDates = checkIn && checkOut;
    if (hasDates) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      if (checkInDate >= checkOutDate) {
        return false;
      }
    }

    return matchesSearch && campground.capacity >= guests;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-6 sticky top-0 z-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-green-800 mb-1">Destination</label>
              <div className="relative">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Where do you want to camp?"
                  className="w-full p-3 pl-10 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                />
                <FaSearch className="absolute left-3 top-3.5 text-green-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">Check-in</label>
              <div className="relative">
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full p-3 pl-10 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                />
                <FaCalendarAlt className="absolute left-3 top-3.5 text-green-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">Check-out</label>
              <div className="relative">
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full p-3 pl-10 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                />
                <FaCalendarAlt className="absolute left-3 top-3.5 text-green-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">Guests</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full p-3 pl-10 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                />
                <FaUser className="absolute left-3 top-3.5 text-green-400" />
              </div>
            </div>
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
          </div>

          <div className="md:w-1/3 h-[500px] sticky top-24">
            <MapContainer 
              center={filteredCampgrounds.length ? filteredCampgrounds[0].coordinates : [0, 0]} 
              zoom={filteredCampgrounds.length ? 10 : 2} 
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
