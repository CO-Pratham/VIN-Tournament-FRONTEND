import { API_CONFIG, buildUrl, getEndpoint } from '../config/api.js';

class DjangoService {
  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = buildUrl(endpoint);
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle different error cases
        if (response.status === 401) {
          // For login endpoint, 401 means invalid credentials
          if (endpoint.includes('/auth/jwt/create/')) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Invalid email or password');
          } else {
            // For other endpoints, 401 means token expired
            this.token = null;
            localStorage.removeItem('access_token');
            throw new Error('Authentication required');
          }
        }
        
        try {
          const errorData = await response.json();
          console.error('Django API Error:', errorData);
          
          if (errorData.password && Array.isArray(errorData.password)) {
            throw new Error(errorData.password.join(' '));
          }
          if (errorData.email && Array.isArray(errorData.email)) {
            throw new Error(errorData.email.join(' '));
          }
          if (errorData.username && Array.isArray(errorData.username)) {
            throw new Error(errorData.username.join(' '));
          }
          
          // Handle field validation errors
          const fieldErrors = [];
          for (const [field, errors] of Object.entries(errorData)) {
            if (Array.isArray(errors)) {
              fieldErrors.push(`${field}: ${errors.join(', ')}`);
            }
          }
          
          if (fieldErrors.length > 0) {
            throw new Error(fieldErrors.join('; '));
          }
          
          // Handle array errors (like Djoser's generic errors)
          if (Array.isArray(errorData)) {
            throw new Error(errorData.join('; '));
          }
          
          throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
        } catch (error) {
          if (error.message && !error.message.includes('HTTP error!')) {
            throw error;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      try {
        return JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON:', responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request(getEndpoint('LOGIN'), {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.access) {
      this.setToken(response.access);
      // Store refresh token for future use
      if (response.refresh) {
        localStorage.setItem('refresh_token', response.refresh);
      }
    }
    
    return response;
  }

  async register(email, password, username) {
    const sanitizedUsername = username
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9@.+_-]/g, '');
    
    const response = await this.request(getEndpoint('REGISTER'), {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        password, 
        re_password: password,
        username: sanitizedUsername
      }),
    });
    
    return response;
  }

  async logout() {
    try {
      await this.request(getEndpoint('LOGOUT'), {
        method: 'POST',
      });
    } catch (error) {
      console.log('Logout request failed:', error);
    } finally {
      this.token = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  // User profile methods
  async getUserProfile() {
    return await this.request(getEndpoint('USER_PROFILE'));
  }

  async updateUserProfile(updates) {
    return await this.request(getEndpoint('UPDATE_PROFILE'), {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async generateGamingId() {
    const response = await this.request(getEndpoint('GENERATE_GAMING_ID'), {
      method: 'POST',
    });
    return response.gaming_id;
  }

  // Tournament methods
  async getAllTournaments() {
    const response = await this.request(getEndpoint('TOURNAMENTS'));
    return response.results || response;
  }

  async getTournamentById(id) {
    return await this.request(getEndpoint('TOURNAMENT_DETAIL', id));
  }

  async createTournament(tournamentData) {
    // Transform frontend data to match Django model
    const transformedData = {
      title: tournamentData.title || 'Untitled Tournament',
      description: tournamentData.description || 'Tournament description',
      game: (tournamentData.game || 'bgmi').toLowerCase().replace(/\s+/g, '_'),
      entry_fee: tournamentData.entry_fee || 0,
      prize_pool: tournamentData.prize || tournamentData.prize_pool || 0,
      max_participants: tournamentData.max_participants || 100,
      start_date: tournamentData.date || new Date().toISOString(),
      end_date: tournamentData.date || new Date().toISOString(),
      registration_deadline: tournamentData.date || new Date().toISOString(),
      rules: tournamentData.rules || 'Standard tournament rules apply.'
    };
    
    console.log('Sending tournament data:', transformedData);
    
    return await this.request(getEndpoint('TOURNAMENTS'), {
      method: 'POST',
      body: JSON.stringify(transformedData),
    });
  }

  async joinTournament(tournamentId, joinData = {}) {
    return await this.request(getEndpoint('JOIN_TOURNAMENT', tournamentId), {
      method: 'POST',
      body: JSON.stringify(joinData),
    });
  }

  async leaveTournament(tournamentId) {
    return await this.request(getEndpoint('LEAVE_TOURNAMENT', tournamentId), {
      method: 'POST',
    });
  }

  // Leaderboard methods
  async getLeaderboard() {
    // Return empty array since endpoint doesn't exist
    return [];
  }

  // Player search methods
  async searchPlayers(searchTerm) {
    return await this.request(`${getEndpoint('SEARCH_USERS')}?search=${encodeURIComponent(searchTerm)}`);
  }

  async getUserById(userId) {
    try {
      // Get tournaments to find user info from created_by data
      const tournaments = await this.getAllTournaments();
      const userTournament = tournaments.find(t => 
        t.created_by?.id === parseInt(userId) || 
        t.participants?.some(p => p.id === parseInt(userId))
      );
      
      if (userTournament?.created_by?.id === parseInt(userId)) {
        return {
          ...userTournament.created_by,
          gaming_id: userTournament.created_by.gaming_id || 'Not set',
          date_joined: userTournament.created_by.date_joined || new Date().toISOString(),
          preferred_games: []
        };
      }
      
      // Find in participants
      for (const tournament of tournaments) {
        const participant = tournament.participants?.find(p => p.id === parseInt(userId));
        if (participant) {
          return {
            ...participant,
            gaming_id: participant.gaming_id || 'Not set',
            date_joined: participant.date_joined || new Date().toISOString(),
            preferred_games: []
          };
        }
      }
      
      // Fallback: return basic user info
      return {
        id: userId,
        username: `User ${userId}`,
        email: `user${userId}@example.com`,
        gaming_id: 'Not set',
        date_joined: new Date().toISOString(),
        preferred_games: []
      };
    } catch (error) {
      return {
        id: userId,
        username: `User ${userId}`,
        email: `user${userId}@example.com`,
        gaming_id: 'Not set',
        date_joined: new Date().toISOString(),
        preferred_games: []
      };
    }
  }
}

export const djangoService = new DjangoService();
