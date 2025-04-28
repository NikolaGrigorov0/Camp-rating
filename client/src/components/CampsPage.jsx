import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBarWithMap from './SearchBarWithMap';
import { useAuth } from '../auth/AuthContext';

const CampsPage = () => {
  const [campgrounds, setCampgrounds] = useState([]);
  const [filteredCampgrounds, setFilteredCampgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchCampgrounds = async () => {
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
            throw new Error('Please sign in to view campgrounds');
          }
          throw new Error('Failed to fetch campgrounds');
        }

        const data = await response.json();
        console.log('Fetched campgrounds:', data); // Debug log
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server');
        }

        setCampgrounds(data);
        setFilteredCampgrounds(data);
      } catch (error) {
        console.error('Error fetching campgrounds:', error);
        setError(error.message || 'Failed to load campgrounds. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampgrounds();
  }, [user]);

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    const filtered = campgrounds.filter(
      (camp) =>
        camp.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        camp.location.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredCampgrounds(filtered);
  };

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
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Explore Campgrounds</h1>
      
      <div className="mb-8">
        <SearchBarWithMap onSearch={handleSearch} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampgrounds.map((camp) => (
          <Link
            to={`/campgrounds/${camp.id}`}
            key={camp.id}
            className="block"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-48">
                <img
                  src={camp.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={camp.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{camp.name}</h2>
                <p className="text-gray-600 mb-2">{camp.location}</p>
                <p className="text-gray-700 mb-4 line-clamp-2">{camp.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">${camp.price}/night</span>
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">★</span>
                    <span>{camp.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredCampgrounds.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">No campgrounds found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default CampsPage; 