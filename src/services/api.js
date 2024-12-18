import axios from 'axios';

// Use import.meta.env for Vite environment variables
const BASE_URL = 'https://kanji-learn-backend.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Retry mechanism for failed requests
const MAX_RETRIES = 3;

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Check if this is a retry attempt
    config.retryCount = config.retryCount || 0;
    
    // Retry logic for network errors or 5xx server errors
    if (
      config.retryCount < MAX_RETRIES && 
      (error.code === 'ECONNABORTED' || 
       (error.response && error.response.status >= 500))
    ) {
      config.retryCount += 1;
      
      // Exponential backoff
      const backoff = Math.pow(2, config.retryCount) * 1000;
      
      console.log(`Retrying request to ${config.url}. Attempt ${config.retryCount}`);
      
      await new Promise(resolve => setTimeout(resolve, backoff));
      
      return api(config);
    }
    
    console.error('API Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: error.config
    });
    
    return Promise.reject(error);
  }
);

export const kanjiApi = {
  getAllKanji: async () => {
    try {
      console.log('Attempting to fetch all kanji from:', `${BASE_URL}/kanji`);
      const response = await api.get('/kanji');
      console.log('Kanji fetch response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching kanji:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      throw error;
    }
  },

  getKanjiById: async (id) => {
    try {
      console.log(`Fetching kanji with ID: ${id}`);
      const response = await api.get(`/kanji/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching kanji with ID ${id}:`, error);
      throw error;
    }
  },

  createKanji: async (kanjiData) => {
    try {
      console.log('Creating new kanji:', kanjiData);
      const response = await api.post('/kanji', kanjiData);
      return response.data;
    } catch (error) {
      console.error('Error creating kanji:', error);
      throw error;
    }
  },

  updateKanji: async (id, kanjiData) => {
    try {
      const response = await api.put(`/kanji/${id}`, kanjiData);
      return response.data;
    } catch (error) {
      console.error('Error updating kanji:', error);
      throw error;
    }
  },

  deleteKanji: async (id) => {
    try {
      const response = await api.delete(`/kanji/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting kanji:', error);
      throw error;
    }
  },

  clearAllKanji: async () => {
    try {
      const response = await api.delete('/kanji');
      return response.data;
    } catch (error) {
      console.error('Error clearing all kanji:', error);
      throw error;
    }
  }
};
