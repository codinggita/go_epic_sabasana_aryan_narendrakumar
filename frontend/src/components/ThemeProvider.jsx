import React, { createContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { setTheme } from '../store/slices/uiSlice';

export const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.ui.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [mode]);

  // Create human-made Mui Theme matching the Tailwind configuration
  const muiTheme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#2E5B88' : '#5C88B0',
        contrastText: mode === 'light' ? '#FDFBF7' : '#18191C',
      },
      secondary: {
        main: mode === 'light' ? '#D46A43' : '#E0A96D',
        contrastText: '#1E1E24',
      },
      background: {
        default: mode === 'light' ? '#FDFBF7' : '#18191C',
        paper: mode === 'light' ? '#F5F2EB' : '#22242A',
      },
      text: {
        primary: mode === 'light' ? '#1E1E24' : '#ECE8E2',
        secondary: mode === 'light' ? '#5C5C68' : '#A6A095',
      },
      divider: mode === 'light' ? '#E8E3D7' : '#32363F',
    },
    typography: {
      fontFamily: ['Inter', 'Outfit', 'sans-serif'].join(','),
      h1: { fontFamily: 'Outfit, sans-serif', fontWeight: 800 },
      h2: { fontFamily: 'Outfit, sans-serif', fontWeight: 700 },
      h3: { fontFamily: 'Outfit, sans-serif', fontWeight: 700 },
      h4: { fontFamily: 'Outfit, sans-serif', fontWeight: 600 },
      h5: { fontFamily: 'Outfit, sans-serif', fontWeight: 600 },
      h6: { fontFamily: 'Outfit, sans-serif', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: 'none',
            border: `1px solid ${mode === 'light' ? '#E8E3D7' : '#32363F'}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
export default ThemeProvider;
