'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from 'components/navbar';
import { FaMapMarkerAlt, FaSearch, FaUsers, FaCampground, FaStar } from 'react-icons/fa';

export default function CampsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [camps, setCamps] = useState([]);
  const [filteredCamps, setFilteredCamps] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const jwtToken = localStorage.getItem("jwt");
    if (!jwtToken) {
      console.log("User is not logged in");
      router.push("/login");
      return;
    }

    const checkAdmin = async () => {
      try {
        const res = await fetch('https://localhost:5022/api/Auth/GetUser', {
          headers: {
            'Authorization': `Bearer ${jwtToken}`
          }
        });
        const data = await res.json();
        console.log(data.user.userName)
        setIsAdmin(data.user.userName === 'admin');
      } catch (err) {
        console.error('Failed to check admin status:', err);
      }
    };

    checkAdmin();
  }, [router]);

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const res = await fetch('https://localhost:5022/api/Request/GetAvailableCamps', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Something went wrong.');
        }

        setCamps(data);
        setFilteredCamps(data);
      } catch (err) {
        console.error('Failed to fetch camps:', err);
        setError(err.message || 'Unexpected error occurred.');
      }
    };

    const fetchStats = async () => {
      if (!isAdmin) {
        setStats({ totalUsers: 0, totalCamps: 0, totalReviews: 0 });
        return;
      }

      try {
        const jwtToken = localStorage.getItem("jwt");
        const res = await fetch('https://localhost:5022/api/Admin/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            setStats({ totalUsers: 0, totalCamps: 0, totalReviews: 0 });
            return;
          }
          throw new Error('Failed to fetch statistics.');
        }

        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setStats({ totalUsers: 0, totalCamps: 0, totalReviews: 0 });
      }
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchCamps(), fetchStats()]);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  useEffect(() => {
    const filtered = camps.filter(camp => 
      camp.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCamps(filtered);
  }, [searchQuery, camps]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative h-[60vh] bg-cover bg-center">
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <Navbar />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-5xl font-bold text-white mb-4">Discover Bulgaria's Natural Beauty</h1>
          <p className="text-xl text-gray-200 max-w-2xl mb-8">Explore our carefully selected campsites across Bulgaria's most stunning locations</p>
          
          <div className="w-full max-w-2xl relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for campsites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-lg bg-white bg-opacity-90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <FaUsers className="text-2xl" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold text-gray-700">Total Users</h2>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <FaCampground className="text-2xl" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold text-gray-700">Total Campsites</h2>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalCamps || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <FaStar className="text-2xl" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold text-gray-700">Total Reviews</h2>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalReviews || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Campsites</h2>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : filteredCamps.length === 0 ? (
            <div className="text-center text-gray-500">
              <p className="text-xl">No campsites found matching your search.</p>
              <p className="mt-2">Try adjusting your search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCamps.map((camp) => (
                <div key={camp.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
                  <div className="relative h-64">
                    <img
                      src={camp.imageUrl}
                      alt={camp.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{camp.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{camp.description}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <FaMapMarkerAlt className="mr-2" />
                      <span>{camp.latitude.toFixed(4)}, {camp.longitude.toFixed(4)}</span>
                    </div>
                    <button
                      onClick={() => router.push(`/camps/${camp.id}`)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Explore Camp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
