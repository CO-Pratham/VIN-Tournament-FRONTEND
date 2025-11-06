import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/community/notifications/')
      // Handle different response formats
      if (response.results) {
        return response.results
      }
      if (response.data?.results) {
        return response.data.results
      }
      if (response.data?.data?.notifications) {
        return response.data.data.notifications
      }
      if (response.data?.notifications) {
        return response.data.notifications
      }
      if (Array.isArray(response)) {
        return response
      }
      if (Array.isArray(response.data)) {
        return response.data
      }
      return []
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/community/notifications/unread_count/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/community/notifications/${notificationId}/mark_read/`)
      return notificationId
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/community/notifications/mark_all_read/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  showNotifications: false,
  realTimeEnabled: false,
  socketConnected: false,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    toggleNotifications: (state) => {
      state.showNotifications = !state.showNotifications
    },
    hideNotifications: (state) => {
      state.showNotifications = false
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.is_read) {
        state.unreadCount += 1
      }
    },
    removeNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload)
      if (index !== -1) {
        const notification = state.notifications[index]
        if (!notification.is_read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        state.notifications.splice(index, 1)
      }
    },
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload
    },
    enableRealTime: (state) => {
      state.realTimeEnabled = true
    },
    disableRealTime: (state) => {
      state.realTimeEnabled = false
      state.socketConnected = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload.results || action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Unread Count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.unread_count
      })
      // Mark as Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload)
        if (notification && !notification.is_read) {
          notification.is_read = true
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })
      // Mark All as Read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.is_read = true
        })
        state.unreadCount = 0
      })
  },
})

export const {
  clearError,
  toggleNotifications,
  hideNotifications,
  addNotification,
  removeNotification,
  setSocketConnected,
  enableRealTime,
  disableRealTime,
} = notificationSlice.actions

export default notificationSlice.reducer
