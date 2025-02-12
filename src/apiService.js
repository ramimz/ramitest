import axios from 'axios';

const API_BASE_URL = ''; // Set your API base URL here
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getRecommendations = async (influencerId, params = { set: 50, nextProduct: null, nextScore: null }) => {
  try {
    const response = await apiClient.get(`/p/score/${influencerId}`, {
      params: {
        set: params.set,
        nextProduct: params.nextProduct,
        nextScore: params.nextScore,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};
