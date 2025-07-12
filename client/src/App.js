import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { store } from "./store";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme(); // Customize theme if needed (e.g., palette, typography)

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
