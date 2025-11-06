import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  darkMode: localStorage.getItem('darkMode') === 'true' || false,
  theme: localStorage.getItem('theme') || 'default',
  fontSize: localStorage.getItem('fontSize') || 'medium',
  animations: localStorage.getItem('animations') !== 'false',
  soundEffects: localStorage.getItem('soundEffects') !== 'false',
  notifications: {
    push: localStorage.getItem('pushNotifications') !== 'false',
    email: localStorage.getItem('emailNotifications') !== 'false',
    tournaments: localStorage.getItem('tournamentNotifications') !== 'false',
    social: localStorage.getItem('socialNotifications') !== 'false',
  },
  accessibility: {
    highContrast: localStorage.getItem('highContrast') === 'true',
    reducedMotion: localStorage.getItem('reducedMotion') === 'true',
    screenReader: localStorage.getItem('screenReader') === 'true',
  },
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
      localStorage.setItem('darkMode', state.darkMode.toString())
    },
    setTheme: (state, action) => {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload
      localStorage.setItem('fontSize', action.payload)
    },
    toggleAnimations: (state) => {
      state.animations = !state.animations
      localStorage.setItem('animations', state.animations.toString())
    },
    toggleSoundEffects: (state) => {
      state.soundEffects = !state.soundEffects
      localStorage.setItem('soundEffects', state.soundEffects.toString())
    },
    updateNotificationSettings: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload }
      Object.entries(action.payload).forEach(([key, value]) => {
        localStorage.setItem(`${key}Notifications`, value.toString())
      })
    },
    updateAccessibilitySettings: (state, action) => {
      state.accessibility = { ...state.accessibility, ...action.payload }
      Object.entries(action.payload).forEach(([key, value]) => {
        localStorage.setItem(key, value.toString())
      })
    },
    resetToDefaults: (state) => {
      state.darkMode = false
      state.theme = 'default'
      state.fontSize = 'medium'
      state.animations = true
      state.soundEffects = true
      state.notifications = {
        push: true,
        email: true,
        tournaments: true,
        social: true,
      }
      state.accessibility = {
        highContrast: false,
        reducedMotion: false,
        screenReader: false,
      }
      
      // Clear localStorage
      localStorage.removeItem('darkMode')
      localStorage.removeItem('theme')
      localStorage.removeItem('fontSize')
      localStorage.removeItem('animations')
      localStorage.removeItem('soundEffects')
      localStorage.removeItem('pushNotifications')
      localStorage.removeItem('emailNotifications')
      localStorage.removeItem('tournamentNotifications')
      localStorage.removeItem('socialNotifications')
      localStorage.removeItem('highContrast')
      localStorage.removeItem('reducedMotion')
      localStorage.removeItem('screenReader')
    },
  },
})

export const {
  toggleDarkMode,
  setTheme,
  setFontSize,
  toggleAnimations,
  toggleSoundEffects,
  updateNotificationSettings,
  updateAccessibilitySettings,
  resetToDefaults,
} = themeSlice.actions

export default themeSlice.reducer
