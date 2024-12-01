import './App.css';

import React from 'react';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Spectrum from './pages/Spectrum';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
return (
  <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <Spectrum></Spectrum>
  </ThemeProvider>
);
}

export default App;
