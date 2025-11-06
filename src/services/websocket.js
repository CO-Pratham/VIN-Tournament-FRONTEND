import { store } from '../store/store';
import { addNotification, setSocketConnected, enableRealTime, disableRealTime } from '../store/slices/notificationSlice';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(token) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    if (!token) {
      console.warn('No token provided for WebSocket connection');
      return;
    }

    try {
      // Connect to Django Channels WebSocket
      // Smart URL detection - uses same logic as API
      const getApiUrl = () => {
        if (import.meta.env.VITE_API_BASE_URL) {
          return import.meta.env.VITE_API_BASE_URL;
        }
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalhost) {
          return 'http://localhost:8000';
        }
        return 'http://localhost:8000';
      };

      const apiUrl = getApiUrl();
      const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || apiUrl.replace(/^https?/, 'ws').replace(/^ws/, 'wss');

      // Construct WebSocket URL
      let wsUrl;
      if (wsBaseUrl.startsWith('ws://') || wsBaseUrl.startsWith('wss://')) {
        wsUrl = `${wsBaseUrl}/ws/notifications/?token=${token}`;
      } else if (wsBaseUrl.includes('railway.internal')) {
        // Internal Railway URL - use ws:// protocol
        wsUrl = `ws://${wsBaseUrl.replace(/^https?:\/\//, '')}/ws/notifications/?token=${token}`;
      } else {
        // Public Railway URL - use wss:// protocol (secure WebSocket)
        wsUrl = `wss://${wsBaseUrl.replace(/^https?:\/\//, '')}/ws/notifications/?token=${token}`;
      }

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected successfully');
        this.reconnectAttempts = 0;
        store.dispatch(setSocketConnected(true));
        store.dispatch(enableRealTime());
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        store.dispatch(setSocketConnected(false));
        store.dispatch(disableRealTime());

        // Only attempt reconnect if it wasn't a clean close
        if (event.code !== 1000) {
          this.handleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.warn('WebSocket connection error. Make sure Django server is running with Daphne (ASGI server).');
        console.warn('WebSocket URL:', wsUrl);
        store.dispatch(setSocketConnected(false));
        // Don't attempt reconnect on error immediately
      };

    } catch (error) {
      console.warn('Failed to connect WebSocket:', error);
      console.warn('WebSocket support requires Django Channels with Daphne ASGI server.');
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case 'notification':
        store.dispatch(addNotification(data.notification));
        break;
      case 'tournament_created':
        this.createTournamentNotification(data);
        break;
      case 'fantasy_team_request':
        this.createFantasyRequestNotification(data);
        break;
      case 'community_post':
        this.createCommunityNotification(data);
        break;
      case 'gamification_badge':
        this.createBadgeNotification(data);
        break;
      case 'ai_analysis_complete':
        this.createAIAnalysisNotification(data);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  createTournamentNotification(data) {
    const notification = {
      id: `tournament_${data.tournament_id}_${Date.now()}`,
      type: 'tournament',
      title: 'New Tournament Created!',
      message: `${data.creator_name} created "${data.tournament_name}" tournament`,
      is_read: false,
      created_at: new Date().toISOString(),
      data: {
        tournament_id: data.tournament_id,
        creator_id: data.creator_id,
        tournament_name: data.tournament_name,
        game_type: data.game_type,
        prize_pool: data.prize_pool
      }
    };
    store.dispatch(addNotification(notification));
  }

  createFantasyRequestNotification(data) {
    const notification = {
      id: `fantasy_${data.team_id}_${Date.now()}`,
      type: 'fantasy',
      title: 'Fantasy Team Needs Players!',
      message: `${data.team_name} is looking for ${data.position_needed} players`,
      is_read: false,
      created_at: new Date().toISOString(),
      data: {
        team_id: data.team_id,
        team_name: data.team_name,
        position_needed: data.position_needed,
        league_id: data.league_id
      }
    };
    store.dispatch(addNotification(notification));
  }

  createCommunityNotification(data) {
    const notification = {
      id: `community_${data.post_id}_${Date.now()}`,
      type: 'community',
      title: 'New Community Post',
      message: `${data.author_name} posted in ${data.channel_name}`,
      is_read: false,
      created_at: new Date().toISOString(),
      data: {
        post_id: data.post_id,
        author_id: data.author_id,
        channel_id: data.channel_id,
        channel_name: data.channel_name
      }
    };
    store.dispatch(addNotification(notification));
  }

  createBadgeNotification(data) {
    const notification = {
      id: `badge_${data.badge_id}_${Date.now()}`,
      type: 'gamification',
      title: 'New Badge Earned!',
      message: `You earned the "${data.badge_name}" badge`,
      is_read: false,
      created_at: new Date().toISOString(),
      data: {
        badge_id: data.badge_id,
        badge_name: data.badge_name,
        badge_icon: data.badge_icon,
        xp_earned: data.xp_earned
      }
    };
    store.dispatch(addNotification(notification));
  }

  createAIAnalysisNotification(data) {
    const notification = {
      id: `ai_${data.analysis_id}_${Date.now()}`,
      type: 'ai',
      title: 'AI Analysis Complete!',
      message: `Your ${data.analysis_type} analysis is ready`,
      is_read: false,
      created_at: new Date().toISOString(),
      data: {
        analysis_id: data.analysis_id,
        analysis_type: data.analysis_type,
        player_id: data.player_id,
        performance_score: data.performance_score
      }
    };
    store.dispatch(addNotification(notification));
  }

  handleReconnect() {
    if (this.reconnectAttempts < 2) {
      this.reconnectAttempts++;
      const delay = 5000;

      setTimeout(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
          console.log(`Attempting to reconnect WebSocket... (${this.reconnectAttempts}/2)`);
          this.connect(token);
        }
      }, delay);
    } else {
      console.log('Max reconnection attempts reached. WebSocket disabled.');
      console.log('Note: WebSocket requires Django Channels with Daphne ASGI server.');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      store.dispatch(setSocketConnected(false));
      store.dispatch(disableRealTime());
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }
}

export default new WebSocketService();
