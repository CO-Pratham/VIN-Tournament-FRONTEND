import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'gamification/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/gamification/profiles/me/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchBadges = createAsyncThunk(
  'gamification/fetchBadges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/gamification/badges/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchLeaderboard = createAsyncThunk(
  'gamification/fetchLeaderboard',
  async (type = 'global_xp', { rejectWithValue }) => {
    try {
      const response = await api.get(`/gamification/leaderboards/${type}/`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchActivities = createAsyncThunk(
  'gamification/fetchActivities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/gamification/activities/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const awardXP = createAsyncThunk(
  'gamification/awardXP',
  async ({ amount, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post('/gamification/profiles/award_xp/', {
        amount,
        reason
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const initialState = {
  profile: null,
  badges: [],
  userBadges: [],
  leaderboard: [],
  activities: [],
  loading: false,
  error: null,
  levelUpModal: false,
  badgeUnlockModal: null,
}

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    showLevelUpModal: (state) => {
      state.levelUpModal = true
    },
    hideLevelUpModal: (state) => {
      state.levelUpModal = false
    },
    showBadgeUnlockModal: (state, action) => {
      state.badgeUnlockModal = action.payload
    },
    hideBadgeUnlockModal: (state) => {
      state.badgeUnlockModal = null
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload }
    },
    addActivity: (state, action) => {
      state.activities.unshift(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Badges
      .addCase(fetchBadges.fulfilled, (state, action) => {
        state.badges = action.payload.results || action.payload
      })
      // Fetch Leaderboard
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboard = action.payload.results || action.payload
      })
      // Fetch Activities
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.activities = action.payload.results || action.payload
      })
      // Award XP
      .addCase(awardXP.fulfilled, (state, action) => {
        if (action.payload.level_up) {
          state.levelUpModal = true
        }
        if (action.payload.new_badges) {
          action.payload.new_badges.forEach(badge => {
            state.badgeUnlockModal = badge
          })
        }
        state.profile = { ...state.profile, ...action.payload.profile }
      })
  },
})

export const {
  clearError,
  showLevelUpModal,
  hideLevelUpModal,
  showBadgeUnlockModal,
  hideBadgeUnlockModal,
  updateProfile,
  addActivity,
} = gamificationSlice.actions

export default gamificationSlice.reducer
