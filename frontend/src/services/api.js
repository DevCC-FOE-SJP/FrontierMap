const API_BASE_URL = 'http://localhost:8000';

export const discoveryService = {
  getGaps: async (domain, limit = 5) => {
    try {
      const response = await fetch(`${API_BASE_URL}/discovery/gaps?domain=${encodeURIComponent(domain)}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch innovation gaps');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in getGaps:', error);
      throw error;
    }
  },

  getRawSources: async (domain, limit = 5) => {
    try {
      const response = await fetch(`${API_BASE_URL}/discovery/sources?domain=${encodeURIComponent(domain)}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch raw sources');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in getRawSources:', error);
      throw error;
    }
  },

  getMetrics: async (domain = 'machine learning') => {
    try {
      const response = await fetch(`${API_BASE_URL}/discovery/metrics?domain=${encodeURIComponent(domain)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in getMetrics:', error);
      throw error;
    }
  }
};

