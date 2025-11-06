class ChatWebSocketService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3;
        this.messageCallbacks = new Set();
        this.connectionCallbacks = new Set();
    }

    connect(roomId, token) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            // Connect to Django Channels WebSocket for chat
            // Smart URL detection - uses same logic as API
            const getApiUrl = () => {
                if (import.meta.env.VITE_API_BASE_URL) {
                    return import.meta.env.VITE_API_BASE_URL;
                }
                const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                if (isLocalhost) {
                    return 'http://localhost:8000';
                }
                return 'https://vin-tournament-backend.up.railway.app';
            };

            const apiUrl = getApiUrl();
            const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || apiUrl.replace(/^https?/, 'ws').replace(/^ws/, 'wss');

            // Construct WebSocket URL
            let wsUrl;
            if (wsBaseUrl.startsWith('ws://') || wsBaseUrl.startsWith('wss://')) {
                wsUrl = `${wsBaseUrl}/ws/chat/?room_id=${roomId}&token=${token}`;
            } else if (wsBaseUrl.includes('railway.internal')) {
                // Internal Railway URL - use ws:// protocol
                wsUrl = `ws://${wsBaseUrl.replace(/^https?:\/\//, '')}/ws/chat/?room_id=${roomId}&token=${token}`;
            } else {
                // Public Railway URL - use wss:// protocol (secure WebSocket)
                wsUrl = `wss://${wsBaseUrl.replace(/^https?:\/\//, '')}/ws/chat/?room_id=${roomId}&token=${token}`;
            }

            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('Chat WebSocket connected');
                this.reconnectAttempts = 0;
                this.connectionCallbacks.forEach(callback => callback(true));
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing chat WebSocket message:', error);
                }
            };

            this.socket.onclose = () => {
                console.log('Chat WebSocket disconnected');
                this.connectionCallbacks.forEach(callback => callback(false));
                this.handleReconnect(roomId, token);
            };

            this.socket.onerror = (error) => {
                console.error('Chat WebSocket error:', error);
            };

        } catch (error) {
            console.error('Failed to connect chat WebSocket:', error);
        }
    }

    handleMessage(data) {
        switch (data.type) {
            case 'chat_message':
                this.messageCallbacks.forEach(callback => callback(data.message));
                break;
            case 'message_history':
                this.messageCallbacks.forEach(callback => callback({ history: data.messages }));
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    }

    handleReconnect(roomId, token) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = 3000;

            setTimeout(() => {
                if (token && roomId) {
                    console.log(`Attempting to reconnect chat... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                    this.connect(roomId, token);
                }
            }, delay);
        } else {
            console.log('Max chat reconnection attempts reached');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    sendMessage(content) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'chat_message',
                content: content
            }));
            return true;
        }
        return false;
    }

    onMessage(callback) {
        this.messageCallbacks.add(callback);
        return () => this.messageCallbacks.delete(callback);
    }

    onConnectionChange(callback) {
        this.connectionCallbacks.add(callback);
        return () => this.connectionCallbacks.delete(callback);
    }
}

export default new ChatWebSocketService();
