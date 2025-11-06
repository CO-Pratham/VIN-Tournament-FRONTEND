import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    sidebarOpen: false,
    sidebarCollapsed: false,
    activePage: 'dashboard',
    allFeaturesOpen: false,
};

const sidebarSlice = createSlice({
    name: 'sidebar',
    initialState,
    reducers: {
        setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload;
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarCollapsed: (state, action) => {
            state.sidebarCollapsed = action.payload;
        },
        toggleSidebarCollapsed: (state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
        },
        setActivePage: (state, action) => {
            state.activePage = action.payload;
        },
        setAllFeaturesOpen: (state, action) => {
            state.allFeaturesOpen = action.payload;
        },
        toggleAllFeatures: (state) => {
            state.allFeaturesOpen = !state.allFeaturesOpen;
        },
    },
});

export const {
    setSidebarOpen,
    toggleSidebar,
    setSidebarCollapsed,
    toggleSidebarCollapsed,
    setActivePage,
    setAllFeaturesOpen,
    toggleAllFeatures,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;

