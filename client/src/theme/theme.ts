import '../styles/variables.css';
import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: 'var(--very-light-blue)',
    },
    text: {
      primary: '#000112',
    },
    primary: {
      main: '#635FC7',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#828FA3',
      contrastText: '#635FC7',
    },
    error: {
      main: '#EA5555',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ff9800',
      contrastText: '#ffffff',
    },
    info: {
      main: '#E4EBFA',
      contrastText: '#635FC7',
    },
  },
  typography: {
    fontFamily: 'var(--main-font)',
    button: {
      fontWeight: 800,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          textTransform: 'none',
        },
      },
    },
  },
});

export { lightTheme };
