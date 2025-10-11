import { configureStore } from '@reduxjs/toolkit';
import tournamentReducer from './slices/tournamentSlice';
import userReducer from './slices/userSlice';
import leaderboardReducer from './slices/leaderboardSlice';

export const store = configureStore({
  reducer: {
    tournaments: tournamentReducer,
    users: userReducer,
    leaderboard: leaderboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});