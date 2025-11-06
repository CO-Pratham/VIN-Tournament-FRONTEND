// API Configuration - Smart URL detection
// Automatically uses localhost for local dev, Railway URL for production
const getApiBaseUrl = () => {
  // Priority 1: Environment variable (most flexible)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Priority 2: Check if we're in local development
  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocalhost) {
    return 'http://localhost:8000/api';
  }

  // Priority 3: Default to local backend when not explicitly configured
  return 'http://localhost:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  setAuthToken(token) {
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
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
      console.log(`[API] ${options.method || 'GET'} ${url}`); // Log API calls for debugging
      const response = await fetch(url, config);

      // Check if response is HTML (usually means 404 or server error)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error(`API endpoint not found: ${endpoint}. Check if backend is running and URL is correct.`);
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'API request failed' }));
        throw new Error(error.message || error.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // Handle Django backend response format
      return data;
    } catch (error) {
      console.error(`[API Error] ${options.method || 'GET'} ${url}:`, error.message);
      // Log helpful error message
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.error(`[API] Backend not reachable at ${this.baseURL}. Check:`);
        console.error('  1. Is the backend running?');
        console.error('  2. Is the URL correct? Current:', this.baseURL);
        console.error('  3. If using Railway, generate a public domain in Railway dashboard');
        console.error('  4. Check CORS settings if backend is running');
      }
      throw error;
    }
  }

  // Authentication endpoints
  async register(userData) {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    const body = refreshToken ? { refresh: refreshToken } : {};

    try {
      const response = await this.request('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      // Clear tokens from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      return response;
    } catch (error) {
      // Clear tokens even if API call fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw error;
    }
  }

  async getCurrentUser() {
    const response = await this.request('/auth/profile/');
    // Handle Django backend response format
    if (response.success && response.data) {
      return response.data;
    }
    return response;
  }

  async refreshToken() {
    return this.request('/auth/refresh/', {
      method: 'POST',
    });
  }

  async resetPassword(email) {
    return this.request('/auth/reset-password/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async checkUsernameAvailability(username) {
    return this.request(`/auth/check-username/?username=${encodeURIComponent(username)}`);
  }

  // Tournament endpoints
  async getTournaments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/tournaments${queryString ? `?${queryString}` : ''}`);
  }

  async getTournament(id) {
    return this.request(`/tournaments/${id}`);
  }

  async createTournament(data) {
    // Handle both object with tournamentData and bannerFile, or direct data
    if (data.tournamentData) {
      // Send JSON data for tournament creation
      return this.request('/tournaments', {
        method: 'POST',
        body: JSON.stringify(data.tournamentData),
      });
    } else {
      // Direct data object
      return this.request('/tournaments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  }

  async joinTournament(id, data = {}) {
    return this.request(`/tournaments/${id}/join`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async leaveTournament(id) {
    return this.request(`/tournaments/${id}/leave`, {
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



  // AI Features endpoints
  async uploadGameplayVideo(formData) {
    return this.request('/ai/gameplay-analysis/', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async getGameplayAnalyses() {
    return this.request('/ai/gameplay-analysis/');
  }

  async getPerformanceSummary() {
    return this.request('/ai/performance/summary/');
  }

  async getSkillProfile() {
    return this.request('/ai/skill-profile/my_profile/');
  }

  async getTournamentRecommendations() {
    return this.request('/ai/skill-profile/tournament_recommendations/');
  }

  async getPerformanceInsights() {
    return this.request('/ai/skill-profile/performance_insights/');
  }

  async updateSkillProfile(skillData) {
    return this.request('/ai/skill-profile/update_skills/', {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  }

  // Community endpoints
  async getPosts() {
    return this.request('/community/posts/');
  }

  async createPost(postData) {
    return this.request('/community/posts/', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async likePost(postId) {
    return this.request(`/community/posts/${postId}/like/`, {
      method: 'POST',
    });
  }

  async getComments(contentType, objectId) {
    return this.request(`/community/comments/?content_type=${contentType}&object_id=${objectId}`);
  }

  async createComment(commentData) {
    return this.request('/community/comments/', {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  async getChatRooms() {
    return this.request('/community/chat/rooms/');
  }

  async getChatMessages(roomId) {
    return this.request(`/community/chat/rooms/${roomId}/messages/`);
  }

  async sendChatMessage(roomId, messageData) {
    return this.request(`/community/chat/rooms/${roomId}/messages/`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async joinChatRoom(roomId) {
    return this.request(`/community/chat/rooms/${roomId}/join/`, {
      method: 'POST',
    });
  }

  async joinChannel(roomId, inviteCode = null) {
    const data = inviteCode ? { invite_code: inviteCode } : {};
    return this.request(`/community/chat/rooms/${roomId}/join/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async leaveChannel(roomId) {
    return this.request(`/community/chat/rooms/${roomId}/leave/`, {
      method: 'POST',
    });
  }

  async getMyChannels() {
    return this.request('/community/chat/my-channels/');
  }

  async getChannelMembers(roomId) {
    return this.request(`/community/chat/rooms/${roomId}/members/`);
  }

  async manageChannelMember(roomId, userId, action) {
    return this.request(`/community/chat/rooms/${roomId}/members/${userId}/manage/`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  }

  async createChannel(channelData) {
    return this.request('/community/chat/rooms/', {
      method: 'POST',
      body: JSON.stringify(channelData),
    });
  }

  async getUserProfile(userId) {
    return this.request(`/community/profiles/${userId}/`);
  }

  async updateUserProfile(profileData) {
    return this.request('/community/profiles/me/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  async followUser(userId) {
    return this.request('/community/social/follow', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async unfollowUser(userId) {
    return this.request('/community/social/unfollow', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async getFeed() {
    return this.request('/community/social/feed/');
  }

  // Fantasy endpoints
  async getFantasyLeagues() {
    return this.request('/fantasy/leagues/');
  }

  async createFantasyLeague(leagueData) {
    return this.request('/fantasy/leagues/', {
      method: 'POST',
      body: JSON.stringify(leagueData),
    });
  }

  async joinFantasyLeague(leagueId) {
    return this.request(`/fantasy/leagues/${leagueId}/join`, {
      method: 'POST',
    });
  }

  async getMyFantasyTeams() {
    return this.request('/fantasy/teams/my_teams');
  }

  async createFantasyTeam(teamData) {
    return this.request('/fantasy/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  async updateFantasyTeam(teamId, teamData) {
    return this.request(`/fantasy/teams/${teamId}`, {
      method: 'PATCH',
      body: JSON.stringify(teamData),
    });
  }

  async getFantasyPlayers(tournamentId) {
    return this.request(`/fantasy/players?tournament=${tournamentId}`);
  }

  async addPlayerToTeam(teamId, playerData) {
    return this.request(`/fantasy/teams/${teamId}/add_player/`, {
      method: 'POST',
      body: JSON.stringify(playerData),
    });
  }

  async removePlayerFromTeam(teamId, playerId) {
    return this.request(`/fantasy/teams/${teamId}/remove_player/`, {
      method: 'POST',
      body: JSON.stringify({ player_id: playerId }),
    });
  }

  async transferPlayer(teamId, transferData) {
    return this.request(`/fantasy/teams/${teamId}/transfer_player/`, {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
  }

  async getFantasyLeaderboard(leagueId) {
    return this.request(`/fantasy/leagues/${leagueId}/leaderboard/`);
  }

  async getFantasyLeaderboard(leagueId) {
    return this.request(`/fantasy/leagues/${leagueId}/leaderboard/`);
  }

  async getFantasyStats(teamId) {
    return this.request(`/fantasy/teams/${teamId}/stats/`);
  }

  // Player search endpoints
  async searchPlayers(searchParams = {}) {
    const queryString = new URLSearchParams(searchParams).toString();
    return this.request(`/fantasy/players/search/?${queryString}`);
  }

  async getPlayerDetail(playerId) {
    return this.request(`/fantasy/players/${playerId}/`);
  }

  async getPlayerStats(playerId) {
    return this.request(`/fantasy/players/${playerId}/stats/`);
  }

  async getAllPlayers() {
    return this.request('/fantasy/players/');
  }

  // AI Analysis endpoints
  async analyzeVideoPerformance(videoFile, playerId = null) {
    const formData = new FormData();
    formData.append('video', videoFile);
    if (playerId) {
      formData.append('player_id', playerId);
    }

    const token = localStorage.getItem('access_token');
    const url = `${this.baseURL}/fantasy/ai/analyze-video/`;

    const config = {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.detail || 'API request failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getPlayerAIInsights(playerId) {
    return this.request(`/fantasy/ai/player/${playerId}/insights/`);
  }

  async getPerformanceAnalytics() {
    return this.request('/fantasy/ai/performance-analytics/');
  }

  // Gamification endpoints
  async getUserStats() {
    return this.request('/gamification/profile/my_profile/');
  }

  async getBadges() {
    return this.request('/gamification/badges/');
  }

  async getUserBadges() {
    return this.request('/gamification/user-badges/');
  }

  async getActivities() {
    return this.request('/gamification/activities/');
  }

  async getLeaderboards() {
    return this.request('/gamification/leaderboards/');
  }

  async getLeaderboard(leaderboardId) {
    return this.request(`/gamification/leaderboards/${leaderboardId}/`);
  }

  async updateXP(xpData) {
    return this.request('/gamification/profile/add_xp/', {
      method: 'POST',
      body: JSON.stringify(xpData),
    });
  }

  async updateStreak() {
    return this.request('/gamification/profile/update_streak/', {
      method: 'POST',
    });
  }

  // Notifications endpoints
  async getNotifications() {
    return this.request('/community/notifications/');
  }

  async markNotificationRead(notificationId) {
    return this.request(`/community/notifications/${notificationId}/mark_read/`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/community/notifications/mark_all_read/', {
      method: 'POST',
    });
  }

  async getUnreadNotificationsCount() {
    return this.request('/community/notifications/unread_count/');
  }

  // Subscription endpoints
  async updateSubscription(plan) {
    return this.request('/users/subscription/update/', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  }
}

// Named export for consumers that need the class
export { ApiService };

export default new ApiService();
