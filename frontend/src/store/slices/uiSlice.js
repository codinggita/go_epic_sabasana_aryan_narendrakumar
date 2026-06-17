import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }
  return 'light'; // default
};

const initialState = {
  theme: getInitialTheme(),
  sidebarOpen: true,
  toast: {
    open: false,
    message: '',
    severity: 'info', // 'success' | 'error' | 'warning' | 'info'
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    setTheme(state, action) {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    showToast(state, action) {
      const { message, severity = 'info' } = action.payload;
      state.toast = {
        open: true,
        message,
        severity
      };
    },
    hideToast(state) {
      state.toast.open = false;
    }
  }
});

export const { toggleTheme, setTheme, toggleSidebar, showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
