const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('access_token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || error.message || 'API request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Tournament endpoints
  async getTournaments() {
    return this.request('/tournaments/');
  }

  async getTournament(id) {
    return this.request(`/tournaments/${id}/`);
  }

  async createTournament(data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    return this.request('/tournaments/', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async joinTournament(id) {
    return this.request(`/tournaments/${id}/join/`, {
      method: 'POST',
    });
  }

  async leaveTournament(id) {
    return this.request(`/tournaments/${id}/leave/`, {
      method: 'POST',
    });
  }

  async getMyTournaments() {
    return this.request('/tournaments/my_tournaments/');
  }

  async getCreatedTournaments() {
    return this.request('/tournaments/created_tournaments/');
  }

  async getJoinedTournaments() {
    return this.request('/tournaments/joined_tournaments/');
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/jwt/create/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {
    return this.request('/auth/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/users/me/');
  }
}

export default new ApiService();