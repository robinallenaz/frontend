import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const kanjiApi = {
  getAllKanji: async () => {
    try {
      const response = await api.get('/kanji');
      return response.data;
    } catch (error) {
      console.error('Error fetching kanji:', error);
      throw error;
    }
  },

  getKanjiById: async (id) => {
    try {
      const response = await api.get(`/kanji/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching kanji by id:', error);
      throw error;
    }
  },

  createKanji: async (kanjiData) => {
    try {
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
  }
};
