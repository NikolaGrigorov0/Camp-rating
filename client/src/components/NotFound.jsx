import { Link } from 'react-router-dom';
import { FaHome, FaHotel, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center p-8">
        <div className="relative">
          <h1 className="text-9xl font-bold text-blue-600 mb-4 animate-bounce">404</h1>
          <div className="absolute -top-4 -right-4 transform rotate-12">
            <FaHotel className="text-6xl text-yellow-400 animate-pulse" />
          </div>
        </div>
        
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">Oops! Looks like you're lost!</h2>
        <p className="text-xl text-gray-600 mb-4">This page must be on vacation...</p>
        
        <div className="max-w-md mx-auto mb-8 p-4 bg-white rounded-lg shadow-lg">
          <p className="text-gray-600 mb-4">
            Don't worry! Even the best travelers sometimes take a wrong turn. 
            Let's get you back to exploring amazing hotels!
          </p>
          <div className="flex justify-center space-x-4 text-blue-500">
            <FaSearch className="text-2xl animate-pulse" />
            <FaMapMarkerAlt className="text-2xl animate-pulse" />
            <FaHotel className="text-2xl animate-pulse" />
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg 
            hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg
            transform hover:scale-105"
        >
          <FaHome className="mr-2" />
          Take Me Home!
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 