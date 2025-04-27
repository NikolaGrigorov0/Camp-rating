'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';
import Reviews from 'components/Reviews';

export default function CampDetails({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [camp, setCamp] = useState(null);
  const [error, setError] = useState(null);
  const campId = React.use(params).id;

  useEffect(() => {
    const jwtToken = localStorage.getItem("jwt");
    if (!jwtToken) {
      console.log("User is not logged in");
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchCamp = async () => {
      try {
        const res = await fetch(`https://localhost:5022/api/Request/GetCampById/${campId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch camp details');
        }

        const data = await res.json();
        setCamp(data);
      } catch (err) {
        console.error('Failed to fetch camp:', err);
        setError(err.message || 'Unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchCamp();
  }, [campId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-xl mb-4">Camp not found</p>
          <button 
            onClick={() => router.back()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Camps
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="relative h-[400px]">
            <img
              src={camp.imageUrl}
              alt={camp.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h1 className="text-4xl font-bold text-white mb-2">{camp.name}</h1>
              <div className="flex items-center text-white">
                <FaMapMarkerAlt className="mr-2" />
                <span>{camp.latitude.toFixed(4)}, {camp.longitude.toFixed(4)}</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">About This Campsite</h2>
              <p className="text-gray-600 text-lg leading-relaxed">{camp.description}</p>
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Location Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Latitude</h4>
                  <p className="text-lg text-gray-800">{camp.latitude.toFixed(4)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Longitude</h4>
                  <p className="text-lg text-gray-800">{camp.longitude.toFixed(4)}</p>
                </div>
              </div>
            </div>

            <Reviews campId={campId} />
          </div>
        </div>
      </div>
    </div>
  );
} 