import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tournamentReducer from './slices/tournamentSlice';
import gamificationReducer from './slices/gamificationSlice';
import fantasyReducer from './slices/fantasySlice';
import communityReducer from './slices/communitySlice';
import aiReducer from './slices/aiSlice';
import notificationReducer from './slices/notificationSlice';
import themeReducer from './slices/themeSlice';
import userReducer from './slices/userSlice';
import leaderboardReducer from './slices/leaderboardSlice';
import sidebarReducer from './slices/sidebarSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tournaments: tournamentReducer,
    gamification: gamificationReducer,
    fantasy: fantasyReducer,
    community: communityReducer,
    ai: aiReducer,
    notifications: notificationReducer,
    theme: themeReducer,
    users: userReducer,
    leaderboard: leaderboardReducer,
    sidebar: sidebarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST'
        ],
      },
    }),
});