import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaStar, FaCampground } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

export default function AdminPanel() {
  const [campgrounds, setCampgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampground, setNewCampground] = useState({
    name: '',
    description: '',
    location: '',
    price: 0,
    rating: 0,
    image: '',
    coordinates: [0, 0],
    amenities: ['Tent Sites', 'RV Hookups', 'Restrooms', 'Showers'],
    capacity: 4
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = () => {
    if (!user?.token) return false;
    try {
      const decodedToken = jwtDecode(user.token);
      console.log('Decoded token:', decodedToken);
      return decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Admin';
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  };

  const fetchCampgrounds = async () => {
    try {
      if (!user?.token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching campgrounds with token:', user.token);
      const response = await fetch('http://localhost:5088/api/Campground', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        console.log('Unauthorized response:', await response.text());
        localStorage.removeItem('token');
        navigate('/signin');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch campgrounds: ${errorText}`);
      }

      const data = await response.json();
      setCampgrounds(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching campgrounds:', error);
      setError(error.message || 'Failed to load campgrounds. Please try again later.');
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

      if (!isAdmin()) {
        navigate('/');
        return;
      }

      fetchCampgrounds();
    };

    checkAccess();
  }, [user, navigate]);

  const handleCreateCampground = async (e) => {
    e.preventDefault();
    try {
      if (!user?.token) {
        throw new Error('No authentication token found');
      }

      console.log('Creating campground with token:', user.token);
      const campgroundData = {
        name: newCampground.name,
        description: newCampground.description,
        location: newCampground.location,
        price: newCampground.price,
        rating: newCampground.rating,
        image: newCampground.image,
        coordinates: newCampground.coordinates,
        amenities: newCampground.amenities,
        capacity: newCampground.capacity
      };

      const response = await fetch('http://localhost:5088/api/Campground', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campgroundData)
      });

      if (response.status === 401) {
        console.log('Unauthorized response:', await response.text());
        localStorage.removeItem('token');
        navigate('/signin');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create campground');
      }

      const result = await response.json();
      await fetchCampgrounds();
      setShowCreateModal(false);
      setNewCampground({
        name: '',
        description: '',
        location: '',
        price: 0,
        rating: 0,
        image: '',
        coordinates: [0, 0],
        amenities: ['Tent Sites', 'RV Hookups', 'Restrooms', 'Showers'],
        capacity: 4
      });
    } catch (error) {
      console.error('Error creating campground:', error);
      setError(error.message || 'Failed to create campground. Please try again.');
    }
  };

  const handleDeleteCampground = async (campgroundId) => {
    if (!window.confirm('Are you sure you want to delete this campground?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5088/api/Campground/${campgroundId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete campground');
      }

      await fetchCampgrounds();
    } catch (error) {
      console.error('Error deleting campground:', error);
      setError('Failed to delete campground. Please try again.');
    }
  };

  const handleInputChange = (e, field) => {
    const value = e.target.type === 'number' 
      ? e.target.value === '' ? '' : parseFloat(e.target.value)
      : e.target.value;
    
    setNewCampground(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin()) {
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Campgrounds</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Add New Campground
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campgrounds.map((campground) => (
            <div key={campground.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={campground.image}
                alt={campground.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">{campground.name}</h3>
                <p className="text-gray-600 mt-1">{campground.location}</p>
                <div className="flex items-center mt-2">
                  <FaStar className="text-yellow-500 mr-1" />
                  <span className="text-gray-700">{campground.rating}</span>
                </div>
                <p className="text-green-600 font-semibold mt-2">${campground.price}/night</p>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => navigate(`/campgrounds/${campground.id}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDeleteCampground(campground.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Add New Campground</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleCreateCampground}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={newCampground.name}
                      onChange={(e) => handleInputChange(e, 'name')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newCampground.description}
                      onChange={(e) => handleInputChange(e, 'description')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={newCampground.location}
                      onChange={(e) => handleInputChange(e, 'location')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price per Night</label>
                    <input
                      type="number"
                      value={newCampground.price}
                      onChange={(e) => handleInputChange(e, 'price')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rating</label>
                    <input
                      type="number"
                      value={newCampground.rating}
                      onChange={(e) => handleInputChange(e, 'rating')}
                      min="0"
                      max="5"
                      step="0.1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input
                      type="text"
                      value={newCampground.image}
                      onChange={(e) => handleInputChange(e, 'image')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Capacity</label>
                    <input
                      type="number"
                      value={newCampground.capacity}
                      onChange={(e) => handleInputChange(e, 'capacity')}
                      min="1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Create Campground
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 