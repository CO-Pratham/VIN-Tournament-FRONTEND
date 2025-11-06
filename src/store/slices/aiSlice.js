import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchAIHighlights = createAsyncThunk(
  'ai/fetchHighlights',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/ai/highlights/', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const generateHighlight = createAsyncThunk(
  'ai/generateHighlight',
  async ({ tournamentId, highlightType, customPrompt }, { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/highlights/generate/', {
        tournament_id: tournamentId,
        highlight_type: highlightType,
        custom_prompt: customPrompt
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchRecommendations = createAsyncThunk(
  'ai/fetchRecommendations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/ai/recommendations/', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const generateRecommendations = createAsyncThunk(
  'ai/generateRecommendations',
  async (types = ['tournament', 'player'], { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/recommendations/generate/', { types })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const provideFeedback = createAsyncThunk(
  'ai/provideFeedback',
  async ({ recommendationId, isAccepted, feedback }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/ai/recommendations/${recommendationId}/feedback/`, {
        is_accepted: isAccepted,
        feedback
      })
      return { recommendationId, isAccepted, feedback }
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const startChatConversation = createAsyncThunk(
  'ai/startChat',
  async ({ conversationType, context }, { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/chatbot/start_conversation/', {
        conversation_type: conversationType,
        context
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const sendChatMessage = createAsyncThunk(
  'ai/sendMessage',
  async ({ conversationId, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/ai/chatbot/${conversationId}/send_message/`, {
        content
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchAnalytics = createAsyncThunk(
  'ai/fetchAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/ai/analytics/', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const generateInsights = createAsyncThunk(
  'ai/generateInsights',
  async (types = ['user_behavior', 'performance_insights'], { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/analytics/generate_insights/', { types })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchDashboard = createAsyncThunk(
  'ai/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/ai/analytics/dashboard/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const initialState = {
  highlights: [],
  recommendations: [],
  chatConversations: [],
  currentConversation: null,
  analytics: [],
  insights: [],
  dashboard: null,
  loading: false,
  error: null,
  highlightsLoading: false,
  recommendationsLoading: false,
  chatLoading: false,
  analyticsLoading: false,
}

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload
    },
    addChatMessage: (state, action) => {
      if (state.currentConversation) {
        if (!state.currentConversation.recent_messages) {
          state.currentConversation.recent_messages = []
        }
        state.currentConversation.recent_messages.push(action.payload)
      }
    },
    markRecommendationViewed: (state, action) => {
      const recommendation = state.recommendations.find(r => r.id === action.payload)
      if (recommendation) {
        recommendation.is_viewed = true
      }
    },
    updateRecommendationFeedback: (state, action) => {
      const { recommendationId, isAccepted, feedback } = action.payload
      const recommendation = state.recommendations.find(r => r.id === recommendationId)
      if (recommendation) {
        recommendation.is_accepted = isAccepted
        recommendation.user_feedback = feedback
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Highlights
      .addCase(fetchAIHighlights.pending, (state) => {
        state.highlightsLoading = true
      })
      .addCase(fetchAIHighlights.fulfilled, (state, action) => {
        state.highlightsLoading = false
        state.highlights = action.payload.results || action.payload
      })
      .addCase(fetchAIHighlights.rejected, (state, action) => {
        state.highlightsLoading = false
        state.error = action.payload
      })
      // Generate Highlight
      .addCase(generateHighlight.fulfilled, (state, action) => {
        state.highlights.unshift(action.payload)
      })
      // Fetch Recommendations
      .addCase(fetchRecommendations.pending, (state) => {
        state.recommendationsLoading = true
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendationsLoading = false
        state.recommendations = action.payload.results || action.payload
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.recommendationsLoading = false
        state.error = action.payload
      })
      // Generate Recommendations
      .addCase(generateRecommendations.fulfilled, (state, action) => {
        const newRecs = action.payload.results || action.payload
        state.recommendations = [...newRecs, ...state.recommendations]
      })
      // Provide Feedback
      .addCase(provideFeedback.fulfilled, (state, action) => {
        const { recommendationId, isAccepted, feedback } = action.payload
        const recommendation = state.recommendations.find(r => r.id === recommendationId)
        if (recommendation) {
          recommendation.is_accepted = isAccepted
          recommendation.user_feedback = feedback
        }
      })
      // Start Chat
      .addCase(startChatConversation.pending, (state) => {
        state.chatLoading = true
      })
      .addCase(startChatConversation.fulfilled, (state, action) => {
        state.chatLoading = false
        state.currentConversation = action.payload
        state.chatConversations.unshift(action.payload)
      })
      .addCase(startChatConversation.rejected, (state, action) => {
        state.chatLoading = false
        state.error = action.payload
      })
      // Send Message
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        const { user_message, ai_response } = action.payload
        if (state.currentConversation) {
          if (!state.currentConversation.recent_messages) {
            state.currentConversation.recent_messages = []
          }
          state.currentConversation.recent_messages.push(user_message, ai_response)
        }
      })
      // Fetch Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.analyticsLoading = true
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false
        state.analytics = action.payload.results || action.payload
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false
        state.error = action.payload
      })
      // Generate Insights
      .addCase(generateInsights.fulfilled, (state, action) => {
        state.insights = action.payload.results || action.payload
      })
      // Fetch Dashboard
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload
      })
  },
})

export const {
  clearError,
  setCurrentConversation,
  addChatMessage,
  markRecommendationViewed,
  updateRecommendationFeedback,
} = aiSlice.actions

export default aiSlice.reducer
