const API_URL = 'http://localhost:5088/api/hotel';

export const hotelService = {
  getAllHotels: async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching hotels:', error);
      throw error;
    }
  },

  getHotelById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching hotel:', error);
      throw error;
    }
  },

  searchHotels: async (query) => {
    try {
      const response = await fetch(`${API_URL}/search?city=${query}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching hotels:', error);
      throw error;
    }
  },

  toggleFavorite: async (hotelId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5088/api/User/toggleFavorite/${hotelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle favorite');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }
}; 