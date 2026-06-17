/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium human-made color palette
        brand: {
          lightBg: '#FDFBF7',         // Warm cream/alabaster
          lightSurface: '#F5F2EB',    // Soft warm grey-cream
          lightBorder: '#E8E3D7',     // Soft sand border
          lightText: '#1E1E24',       // Charcoal black
          lightMuted: '#5C5C68',      // Slate grey
          lightPrimary: '#2E5B88',    // Slate blue
          lightSecondary: '#D46A43',  // Soft terracotta/coral
          lightAccent: '#E0A96D',     // Warm amber
          
          darkBg: '#18191C',         // Deep warm grey/slate
          darkSurface: '#22242A',    // Deep slate surface
          darkBorder: '#32363F',     // Dark slate border
          darkText: '#ECE8E2',       // Warm cream/soft white
          darkMuted: '#A6A095',      // Muted warm grey
          darkPrimary: '#5C88B0',    // Muted blue
          darkSecondary: '#E0A96D',  // Warm amber
          darkAccent: '#D46A43',     // Soft terracotta
        },
        // Flat colors matching premium token design colors
        'light-text': '#0F172A',
        'light-muted': '#475569',
        'light-primary': '#6366F1',
        'light-secondary': '#EC4899',
        'light-accent': '#F59E0B',
        
        'dark-text': '#F8FAFC',
        'dark-muted': '#94A3B8',
        'dark-primary': '#818CF8',
        'dark-secondary': '#F43F5E',
        'dark-accent': '#FBBF24',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
        title: ['Outfit', 'sans-serif'],
        code: ['Fira Code', 'source-code-pro', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}
