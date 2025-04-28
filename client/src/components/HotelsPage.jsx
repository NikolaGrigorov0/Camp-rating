import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaStar } from 'react-icons/fa';
import { hotelService } from '../services/hotelService';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const HotelsPage = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const data = await hotelService.getAllHotels();
        const formattedHotels = data.map(hotel => ({
          id: hotel._id || hotel.id,
          name: hotel.basicInfo.name,
          location: `${hotel.location.city}, ${hotel.location.country}`,
          price: hotel.rooms[0]?.pricePerNight || 0,
          rating: hotel.basicInfo.stars,
          image: hotel.basicInfo.images[0] || 'https://via.placeholder.com/300x200',
          coordinates: hotel.location.coordinates,
          city: hotel.location.city,
          country: hotel.location.country
        }));
        setHotels(formattedHotels);
      } catch (err) {
        setError('Failed to fetch hotels');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">All Hotels</h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Hotels List */}
          <div className="md:w-2/3 space-y-6">
            {hotels.map((hotel) => (
              <Link 
                to={`/hotel/${hotel.id}`}
                key={hotel.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden flex transition-transform duration-300 hover:scale-[1.02]"
              >
                <img src={hotel.image} alt={hotel.name} className="w-1/3 object-cover" />
                <div className="w-2/3 p-6">
                  <h2 className="text-xl font-bold">{hotel.name}</h2>
                  <p className="text-gray-600 my-2">{hotel.location}</p>
                  <p className="text-2xl font-bold text-blue-600">${hotel.price} <span className="text-sm text-gray-500">/ night</span></p>
                  <div className="flex items-center mt-2">
                    <FaStar className="text-yellow-500 mr-1" />
                    <span className="text-gray-600">{hotel.rating} stars</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Map */}
          <div className="md:w-1/3 h-[500px] sticky top-24">
            <MapContainer 
              center={hotels.length ? hotels[0].coordinates : [0, 0]} 
              zoom={hotels.length ? 10 : 2} 
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {hotels.map(hotel => (
                <Marker 
                  key={hotel.id} 
                  position={hotel.coordinates} 
                  icon={L.divIcon({
                    className: 'cursor-pointer',
                    html: `<div class="bg-white bg-opacity-90 text-black py-2 rounded-lg text-sm font-semibold shadow-md cursor-pointer">
                      $${hotel.price}
                    </div>`,
                    iconSize: [60, 30],
                    iconAnchor: [30, 15],
                  })}
                  eventHandlers={{
                    click: () => navigate(`/hotel/${hotel.id}`),
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
                        <h3 className="text-lg font-semibold mb-1">{hotel.name}</h3>
                        <p className="text-gray-600">{hotel.location}</p>
                        <p className="text-gray-800 mt-1 font-medium">Price: ${hotel.price}/night</p>
                        <p className="text-gray-800">Rating: {hotel.rating} ⭐</p>
                        <button 
                          onClick={() => navigate(`/hotel/${hotel.id}`)}
                          className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                      <img src={hotel.image} alt={hotel.name} className="w-[150px] h-[110px] object-cover rounded-md"/>
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

export default HotelsPage; 