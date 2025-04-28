import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBarWithMap from './SearchBarWithMap';

const CampsPage = () => {
  const [campgrounds, setCampgrounds] = useState([]);
  const [filteredCampgrounds, setFilteredCampgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchCampgrounds = async () => {
      try {
        // Simulated data - replace with actual API call
        setCampgrounds(mockCampgrounds);
        setFilteredCampgrounds(mockCampgrounds);
      } catch (error) {
        console.error('Error fetching campgrounds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampgrounds();
  }, []);

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
                  src={camp.image}
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
                  <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                    View Details
                  </button>
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