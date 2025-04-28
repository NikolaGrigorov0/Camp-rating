import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { FaHeart, FaCampground, FaHome, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children, icon: Icon }) => (
    <Link
      to={to}
      onClick={() => setIsMenuOpen(false)}
      className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
        isActive(to)
          ? 'bg-white text-blue-600 shadow-md transform scale-105'
          : 'text-white hover:bg-blue-700 hover:text-white'
      }`}
    >
      {Icon && <Icon className="mr-2" />}
      {children}
    </Link>
  );

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-2xl font-bold hover:text-blue-200 transition-colors"
          >
            <FaCampground className="text-3xl" />
            <span>CampFinder</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/" icon={FaHome}>Home</NavLink>
            <NavLink to="/camps" icon={FaCampground}>Camps</NavLink>
            {user && (
              <NavLink to="/favorites" icon={FaHeart}>Favorites</NavLink>
            )}
            {user?.isAdmin && <NavLink to="/admin" icon={FaCampground}>Admin Panel</NavLink>}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLogout}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/signIn"
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signUp"
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none"
          >
            {isMenuOpen ? (
              <FaTimes className="text-2xl" />
            ) : (
              <FaBars className="text-2xl" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-blue-700">
            <NavLink to="/" icon={FaHome}>Home</NavLink>
            <NavLink to="/camps" icon={FaCampground}>Camps</NavLink>
            {user && (
              <NavLink to="/favorites" icon={FaHeart}>Favorites</NavLink>
            )}
            {user?.isAdmin && <NavLink to="/admin" icon={FaCampground}>Admin Panel</NavLink>}
            {user ? (
              <>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-white hover:bg-blue-700 transition-colors rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signIn"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-white hover:bg-blue-700 transition-colors rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/signUp"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 transition-colors rounded-lg mx-4"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 