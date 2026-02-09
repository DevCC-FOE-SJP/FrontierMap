const API_BASE_URL = 'http://localhost:8001';

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
  },

  getPulse: async (domain = 'machine learning') => {
    try {
      const response = await fetch(`${API_BASE_URL}/discovery/pulse?domain=${encodeURIComponent(domain)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pulse data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in getPulse:', error);
      throw error;
    }
  },

  postFeedback: async (cardGap, domain, action) => {
    try {
      const response = await fetch(`${API_BASE_URL}/discovery/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_gap: cardGap, domain: domain, action: action }),
      });
      if (!response.ok) {
        throw new Error('Failed to post feedback');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in postFeedback:', error);
      // Don't throw - feedback is best-effort
    }
  },

  saveCard: async (card) => {
    try {
      const response = await fetch(`${API_BASE_URL}/discovery/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card),
      });
      if (!response.ok) {
        throw new Error('Failed to save card');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in saveCard:', error);
      throw error;
    }
  },

  generateCard: async (domain, subTopic) => {
    try {
      const response = await fetch(`${API_BASE_URL}/discovery/cards/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain, sub_topic: subTopic }),
      });
      if (!response.ok) {
        throw new Error('Failed to generate card');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in generateCard:', error);
      throw error;
    }
  },

  getSavedCards: async (domain = '') => {
    try {
      const url = domain
        ? `${API_BASE_URL}/discovery/cards?domain=${encodeURIComponent(domain)}`
        : `${API_BASE_URL}/discovery/cards`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch saved cards');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in getSavedCards:', error);
      throw error;
    }
  },

  getExportData: async (domain = 'machine learning') => {
    try {
      const response = await fetch(`${API_BASE_URL}/discovery/export?domain=${encodeURIComponent(domain)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch export data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in getExportData:', error);
      throw error;
    }
  },

  getSearchHistory: async (limit = 20) => {
    try {
      const response = await fetch(`${API_BASE_URL}/discovery/history?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search history');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in getSearchHistory:', error);
      throw error;
    }
  },
};

