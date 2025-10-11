import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { djangoService } from '../../services/djangoService';

export const fetchUserTournaments = createAsyncThunk(
  'users/fetchTournaments',
  async (userId, { rejectWithValue }) => {
    try {
      const tournaments = await djangoService.getAllTournaments();
      console.log('All tournaments:', tournaments);
      console.log('Current user ID:', userId);
      
      const organized = tournaments.filter(t => {
        console.log('Tournament created_by:', t.created_by, 'User ID:', userId);
        return t.created_by?.id === userId || t.created_by === userId;
      });
      
      const joined = tournaments.filter(t => 
        t.participants?.some(p => p.id === userId || p.user_id === userId) ||
        t.participants?.includes(userId)
      );
      
      console.log('Organized tournaments:', organized);
      console.log('Joined tournaments:', joined);
      
      return { organized, joined };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'users/fetchStats',
  async (userId, { rejectWithValue }) => {
    try {
      return await djangoService.getLeaderboard();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    currentUser: null,
    userTournaments: {
      organized: [],
      joined: []
    },
    userStats: {},
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearUserData: (state) => {
      state.currentUser = null;
      state.userTournaments = { organized: [], joined: [] };
      state.userStats = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserTournaments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserTournaments.fulfilled, (state, action) => {
        state.loading = false;
        state.userTournaments = action.payload;
      })
      .addCase(fetchUserTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userStats = action.payload;
      });
  },
});

export const { setCurrentUser, clearUserData } = userSlice.actions;
export default userSlice.reducer;