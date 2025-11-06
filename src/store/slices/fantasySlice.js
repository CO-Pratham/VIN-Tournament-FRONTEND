import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchFantasyLeagues = createAsyncThunk(
  'fantasy/fetchLeagues',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getFantasyLeagues()
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch fantasy leagues')
    }
  }
)

export const fetchMyTeams = createAsyncThunk(
  'fantasy/fetchMyTeams',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getMyFantasyTeams()
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch my teams')
    }
  }
)

export const fetchAvailablePlayers = createAsyncThunk(
  'fantasy/fetchPlayers',
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await api.getFantasyPlayers(tournamentId)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch available players')
    }
  }
)

export const joinLeague = createAsyncThunk(
  'fantasy/joinLeague',
  async (leagueId, { rejectWithValue }) => {
    try {
      const response = await api.joinFantasyLeague(leagueId)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to join league')
    }
  }
)

export const addPlayerToTeam = createAsyncThunk(
  'fantasy/addPlayer',
  async ({ teamId, playerId, selectionType }, { rejectWithValue }) => {
    try {
      const response = await api.addPlayerToTeam(teamId, {
        player_id: playerId,
        selection_type: selectionType
      })
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add player to team')
    }
  }
)

export const removePlayerFromTeam = createAsyncThunk(
  'fantasy/removePlayer',
  async ({ teamId, playerId }, { rejectWithValue }) => {
    try {
      const response = await api.removePlayerFromTeam(teamId, playerId)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove player from team')
    }
  }
)

export const transferPlayer = createAsyncThunk(
  'fantasy/transferPlayer',
  async ({ teamId, removePlayerId, addPlayerId }, { rejectWithValue }) => {
    try {
      const response = await api.transferPlayer(teamId, {
        remove_player_id: removePlayerId,
        add_player_id: addPlayerId
      })
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to transfer player')
    }
  }
)

export const fetchLeaderboard = createAsyncThunk(
  'fantasy/fetchLeaderboard',
  async (leagueId, { rejectWithValue }) => {
    try {
      const response = await api.getFantasyLeaderboard(leagueId)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch leaderboard')
    }
  }
)

const initialState = {
  leagues: [],
  myTeams: [],
  availablePlayers: [],
  leaderboard: [],
  selectedLeague: null,
  selectedTeam: null,
  loading: false,
  error: null,
  transferMode: false,
  selectedPlayer: null,
}

const fantasySlice = createSlice({
  name: 'fantasy',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedLeague: (state, action) => {
      state.selectedLeague = action.payload
    },
    setSelectedTeam: (state, action) => {
      state.selectedTeam = action.payload
    },
    enableTransferMode: (state) => {
      state.transferMode = true
    },
    disableTransferMode: (state) => {
      state.transferMode = false
      state.selectedPlayer = null
    },
    setSelectedPlayer: (state, action) => {
      state.selectedPlayer = action.payload
    },
    updateTeamBudget: (state, action) => {
      if (state.selectedTeam) {
        state.selectedTeam.remaining_budget = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Leagues
      .addCase(fetchFantasyLeagues.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchFantasyLeagues.fulfilled, (state, action) => {
        state.loading = false
        state.leagues = action.payload.results || action.payload
      })
      .addCase(fetchFantasyLeagues.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch My Teams
      .addCase(fetchMyTeams.fulfilled, (state, action) => {
        state.myTeams = action.payload.results || action.payload
      })
      // Fetch Available Players
      .addCase(fetchAvailablePlayers.fulfilled, (state, action) => {
        state.availablePlayers = action.payload.results || action.payload
      })
      // Join League
      .addCase(joinLeague.fulfilled, (state, action) => {
        state.myTeams.push(action.payload)
      })
      // Add Player
      .addCase(addPlayerToTeam.fulfilled, (state, action) => {
        if (state.selectedTeam) {
          state.selectedTeam = action.payload
        }
        // Update team in myTeams array
        const teamIndex = state.myTeams.findIndex(team => team.id === action.payload.id)
        if (teamIndex !== -1) {
          state.myTeams[teamIndex] = action.payload
        }
      })
      // Remove Player
      .addCase(removePlayerFromTeam.fulfilled, (state, action) => {
        if (state.selectedTeam) {
          state.selectedTeam = action.payload
        }
        const teamIndex = state.myTeams.findIndex(team => team.id === action.payload.id)
        if (teamIndex !== -1) {
          state.myTeams[teamIndex] = action.payload
        }
      })
      // Transfer Player
      .addCase(transferPlayer.fulfilled, (state, action) => {
        if (state.selectedTeam) {
          state.selectedTeam = action.payload
        }
        const teamIndex = state.myTeams.findIndex(team => team.id === action.payload.id)
        if (teamIndex !== -1) {
          state.myTeams[teamIndex] = action.payload
        }
        state.transferMode = false
        state.selectedPlayer = null
      })
      // Fetch Leaderboard
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboard = action.payload.results || action.payload
      })
  },
})

export const {
  clearError,
  setSelectedLeague,
  setSelectedTeam,
  enableTransferMode,
  disableTransferMode,
  setSelectedPlayer,
  updateTeamBudget,
} = fantasySlice.actions

export default fantasySlice.reducer
