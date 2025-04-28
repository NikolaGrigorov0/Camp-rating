import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaStar } from 'react-icons/fa';

export default function AdminPanel() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newHotel, setNewHotel] = useState({
    basicinfo: {
      name: '',
      description: '',
      stars: 3,
      images: [],
      amenities: ['WiFi', 'Parking', 'Restaurant']
    },
    location: {
      street: '',
      city: '',
      country: '',
      locationtype: 'Point',
      coordinates: [0, 0]
    },
    contact: {
      phone: '',
      email: ''
    },
    rooms: [{
      type: 'Standard',
      description: 'Comfortable standard room',
      pricepernight: 100.00,
      capacity: 2,
      images: [],
      available: true
    }]
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchHotels = async () => {
    try {
      const response = await fetch('http://localhost:5088/api/Hotel', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch hotels: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched hotels:', data);
      setHotels(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setError('Failed to load hotels. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate('/signin');
        return;
      }

      if (!user.isAdmin) {
        navigate('/');
        return;
      }

      fetchHotels();
    };

    checkAccess();
  }, [user, navigate]);

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    try {
      // Create a properly formatted hotel object
      const hotelData = {
        basicinfo: {
          name: newHotel.basicinfo.name,
          description: newHotel.basicinfo.description,
          stars: newHotel.basicinfo.stars,
          images: newHotel.basicinfo.images,
          amenities: newHotel.basicinfo.amenities
        },
        location: {
          street: newHotel.location.street,
          city: newHotel.location.city,
          country: newHotel.location.country,
          locationtype: 'Point',
          coordinates: newHotel.location.coordinates
        },
        contact: {
          phone: newHotel.contact.phone,
          email: newHotel.contact.email
        },
        rooms: [{
          type: newHotel.rooms[0].type,
          description: newHotel.rooms[0].description,
          pricepernight: newHotel.rooms[0].pricepernight,
          capacity: newHotel.rooms[0].capacity,
          images: newHotel.rooms[0].images,
          available: newHotel.rooms[0].available
        }]
      };

      console.log('Creating hotel with data:', JSON.stringify(hotelData, null, 2));

      const response = await fetch('http://localhost:5088/api/Hotel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hotelData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        if (errorData.errors) {
          // Create a more detailed error message from validation errors
          const errorMessages = Object.entries(errorData.errors)
            .map(([key, value]) => `${key}: ${value.join(', ')}`)
            .join('\n');
          throw new Error(`Validation errors:\n${errorMessages}`);
        }
        throw new Error(errorData.message || 'Failed to create hotel');
      }

      const result = await response.json();
      console.log('Hotel created successfully:', result);

      await fetchHotels();
      setShowCreateModal(false);
      setNewHotel({
        basicinfo: {
          name: '',
          description: '',
          stars: 3,
          images: [],
          amenities: ['WiFi', 'Parking', 'Restaurant']
        },
        location: {
          street: '',
          city: '',
          country: '',
          locationtype: 'Point',
          coordinates: [0, 0]
        },
        contact: {
          phone: '',
          email: ''
        },
        rooms: [{
          type: 'Standard',
          description: 'Comfortable standard room',
          pricepernight: 100.00,
          capacity: 2,
          images: [],
          available: true
        }]
      });
    } catch (error) {
      console.error('Error creating hotel:', error);
      setError(error.message || 'Failed to create hotel. Please try again.');
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5088/api/Hotel/${hotelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete hotel');
      }

      await fetchHotels();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      setError('Failed to delete hotel. Please try again.');
    }
  };

  const handleInputChange = (e, section, field) => {
    const value = e.target.type === 'number' 
      ? e.target.value === '' ? '' : parseFloat(e.target.value)
      : e.target.value;
    
    setNewHotel(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-600">Logged in as: {user.username} (Admin)</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Hotel Management</h2>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add New Hotel
              </button>
            </div>
            
            {hotels.length === 0 && !error ? (
              <div className="text-center py-8 text-gray-500">
                No hotels found in the database. Add your first hotel to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stars</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {hotels.map((hotel) => (
                      <tr key={hotel.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{hotel.basicInfo.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hotel.location.city}, {hotel.location.country}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{hotel.basicInfo.stars} ★</td>
                        <td className="px-6 py-4 whitespace-nowrap">{hotel.rooms?.length || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                          <button 
                            onClick={() => handleDeleteHotel(hotel.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Improved Create Hotel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h3 className="text-2xl font-bold text-gray-800">Create New Hotel</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateHotel} className="space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter hotel name"
                      value={newHotel.basicinfo.name}
                      onChange={(e) => handleInputChange(e, 'basicinfo', 'name')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      required
                      placeholder="Enter hotel description"
                      value={newHotel.basicinfo.description}
                      onChange={(e) => handleInputChange(e, 'basicinfo', 'description')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stars Rating</label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewHotel(prev => ({
                            ...prev,
                            basicinfo: { ...prev.basicinfo, stars: star }
                          }))}
                          className={`text-2xl focus:outline-none ${
                            star <= newHotel.basicinfo.stars ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          <FaStar />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">Location</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter street address"
                      value={newHotel.location.street}
                      onChange={(e) => handleInputChange(e, 'location', 'street')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter city"
                      value={newHotel.location.city}
                      onChange={(e) => handleInputChange(e, 'location', 'city')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter country"
                      value={newHotel.location.country}
                      onChange={(e) => handleInputChange(e, 'location', 'country')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="Enter phone number"
                      value={newHotel.contact.phone}
                      onChange={(e) => handleInputChange(e, 'contact', 'phone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="Enter email address"
                      value={newHotel.contact.email}
                      onChange={(e) => handleInputChange(e, 'contact', 'email')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Create Hotel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 