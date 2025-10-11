import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { djangoService } from '../../services/djangoService';

export const fetchLeaderboard = createAsyncThunk(
  'leaderboard/fetch',
  async (_, { rejectWithValue }) => {
    try {
      // Return empty array since leaderboard endpoint doesn't exist
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPublicProfile = createAsyncThunk(
  'leaderboard/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const tournaments = await djangoService.getAllTournaments();
      const profile = await djangoService.getUserById(userId);
      const userTournaments = tournaments.filter(t => 
        t.created_by?.id === parseInt(userId) || 
        t.participants?.some(p => p.id === parseInt(userId))
      );
      const stats = {
        tournaments_joined: userTournaments.length,
        tournaments_won: 0,
        total_earnings: 0,
        rank: 'N/A'
      };
      return { 
        profile, 
        tournaments: userTournaments, 
        stats 
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState: {
    players: [],
    currentProfile: null,
    profileTournaments: [],
    profileStats: {},
    loading: false,
    profileLoading: false,
    error: null,
  },
  reducers: {
    clearProfile: (state) => {
      state.currentProfile = null;
      state.profileTournaments = [];
      state.profileStats = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.players = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPublicProfile.pending, (state) => {
        state.profileLoading = true;
      })
      .addCase(fetchPublicProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.currentProfile = action.payload.profile;
        state.profileTournaments = action.payload.tournaments;
        state.profileStats = action.payload.stats;
      })
      .addCase(fetchPublicProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfile } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;