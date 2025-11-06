import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchTournaments = createAsyncThunk(
  'tournaments/fetchTournaments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.getTournaments()
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch tournaments')
    }
  }
)

export const fetchTournamentDetails = createAsyncThunk(
  'tournaments/fetchDetails',
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await api.getTournament(tournamentId)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch tournament details')
    }
  }
)

export const joinTournament = createAsyncThunk(
  'tournaments/join',
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await api.joinTournament(tournamentId)
      return { tournamentId, ...response }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to join tournament')
    }
  }
)

export const leaveTournament = createAsyncThunk(
  'tournaments/leave',
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await api.leaveTournament(tournamentId)
      return { tournamentId, ...response }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to leave tournament')
    }
  }
)

export const createTournament = createAsyncThunk(
  'tournaments/create',
  async (tournamentData, { rejectWithValue }) => {
    try {
      const response = await api.createTournament(tournamentData)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create tournament')
    }
  }
)

export const fetchMyTournaments = createAsyncThunk(
  'tournaments/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getMyTournaments()
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch my tournaments')
    }
  }
)

export const fetchLeaderboard = createAsyncThunk(
  'tournaments/fetchLeaderboard',
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tournaments/${tournamentId}/leaderboard/`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const initialState = {
  tournaments: [],
  myTournaments: [],
  selectedTournament: null,
  leaderboard: [],
  loading: false,
  error: null,
  filters: {
    status: 'all',
    game: 'all',
    prizePool: 'all',
    search: '',
  },
  pagination: {
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  },
}

const tournamentSlice = createSlice({
  name: 'tournaments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedTournament: (state, action) => {
      state.selectedTournament = action.payload
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = {
        status: 'all',
        game: 'all',
        prizePool: 'all',
        search: '',
      }
    },
    updateTournamentStatus: (state, action) => {
      const { tournamentId, status } = action.payload
      const tournament = state.tournaments.find(t => t.id === tournamentId)
      if (tournament) {
        tournament.status = status
      }
      if (state.selectedTournament && state.selectedTournament.id === tournamentId) {
        state.selectedTournament.status = status
      }
    },
    updateParticipantCount: (state, action) => {
      const { tournamentId, count } = action.payload
      const tournament = state.tournaments.find(t => t.id === tournamentId)
      if (tournament) {
        tournament.participants_count = count
      }
      if (state.selectedTournament && state.selectedTournament.id === tournamentId) {
        state.selectedTournament.participants_count = count
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tournaments
      .addCase(fetchTournaments.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTournaments.fulfilled, (state, action) => {
        state.loading = false
        state.tournaments = action.payload.results || action.payload
        if (action.payload.count) {
          state.pagination = {
            page: action.payload.page || 1,
            totalPages: Math.ceil(action.payload.count / 20),
            hasNext: !!action.payload.next,
            hasPrevious: !!action.payload.previous,
          }
        }
      })
      .addCase(fetchTournaments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Tournament Details
      .addCase(fetchTournamentDetails.fulfilled, (state, action) => {
        state.selectedTournament = action.payload
        // Update in tournaments list if exists
        const index = state.tournaments.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.tournaments[index] = action.payload
        }
      })
      // Join Tournament
      .addCase(joinTournament.fulfilled, (state, action) => {
        const { tournamentId } = action.payload
        const tournament = state.tournaments.find(t => t.id === tournamentId)
        if (tournament) {
          tournament.is_participant = true
          tournament.participants_count += 1
        }
        if (state.selectedTournament && state.selectedTournament.id === tournamentId) {
          state.selectedTournament.is_participant = true
          state.selectedTournament.participants_count += 1
        }
      })
      // Leave Tournament
      .addCase(leaveTournament.fulfilled, (state, action) => {
        const { tournamentId } = action.payload
        const tournament = state.tournaments.find(t => t.id === tournamentId)
        if (tournament) {
          tournament.is_participant = false
          tournament.participants_count = Math.max(0, tournament.participants_count - 1)
        }
        if (state.selectedTournament && state.selectedTournament.id === tournamentId) {
          state.selectedTournament.is_participant = false
          state.selectedTournament.participants_count = Math.max(0, state.selectedTournament.participants_count - 1)
        }
      })
      // Create Tournament
      .addCase(createTournament.fulfilled, (state, action) => {
        state.tournaments.unshift(action.payload)
        state.myTournaments.unshift(action.payload)
      })
      // Fetch My Tournaments
      .addCase(fetchMyTournaments.fulfilled, (state, action) => {
        state.myTournaments = action.payload.results || action.payload
      })
      // Fetch Leaderboard
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboard = action.payload.results || action.payload
      })
  },
})

export const {
  clearError,
  setSelectedTournament,
  updateFilters,
  resetFilters,
  updateTournamentStatus,
  updateParticipantCount,
} = tournamentSlice.actions

export default tournamentSlice.reducer
