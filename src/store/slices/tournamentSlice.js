import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { djangoService } from '../../services/djangoService';
import toast from 'react-hot-toast';

export const fetchTournaments = createAsyncThunk(
  'tournaments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await djangoService.getAllTournaments();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTournamentById = createAsyncThunk(
  'tournaments/fetchById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const existing = getState().tournaments.items.find(t => t.id === id);
      if (existing) return existing;
      return await djangoService.getTournamentById(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTournament = createAsyncThunk(
  'tournaments/create',
  async (data, { rejectWithValue }) => {
    try {
      const tournament = await djangoService.createTournament(data.tournamentData || data);
      toast.success('Tournament created successfully!');
      return tournament;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const joinTournament = createAsyncThunk(
  'tournaments/join',
  async ({ tournamentId, joinData }, { rejectWithValue }) => {
    try {
      await djangoService.joinTournament(tournamentId, joinData);
      return tournamentId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const leaveTournament = createAsyncThunk(
  'tournaments/leave',
  async (tournamentId, { rejectWithValue }) => {
    try {
      await djangoService.leaveTournament(tournamentId);
      toast.success('Left tournament successfully!');
      return tournamentId;
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  }
);

const tournamentSlice = createSlice({
  name: 'tournaments',
  initialState: {
    items: [],
    currentTournament: null,
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTournament: (state, action) => {
      state.currentTournament = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournaments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTournamentById.fulfilled, (state, action) => {
        const tournament = action.payload;
        const existingIndex = state.items.findIndex(t => t.id === tournament.id);
        if (existingIndex === -1) {
          state.items.push(tournament);
        }
        state.currentTournament = tournament;
      })
      .addCase(createTournament.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createTournament.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createTournament.rejected, (state) => {
        state.actionLoading = false;
      })
      .addCase(joinTournament.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(joinTournament.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(joinTournament.rejected, (state) => {
        state.actionLoading = false;
      })
      .addCase(leaveTournament.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(leaveTournament.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(leaveTournament.rejected, (state) => {
        state.actionLoading = false;
      });
  },
});

export const { clearError, setCurrentTournament } = tournamentSlice.actions;
export default tournamentSlice.reducer;