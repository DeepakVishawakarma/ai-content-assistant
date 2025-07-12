import React, { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from "@mui/material";
import config from "../config/config"; // Import config

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [tabValue, setTabValue] = useState(0); // 0 for Login, 1 for Register
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError(""); // Clear error on tab switch
    setCredentials({ username: "", password: "" }); // Clear input values on tab switch
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const url = tabValue === 0 ? "/api/login" : "/api/register";
    try {
      const response = await axios.post(
        `${config.apiBaseUrl}${url}`,
        credentials
      );
      if (tabValue === 1) {
        // Registration
        alert(response.data.message);
        setTabValue(0); // Switch to login after successful registration
      } else {
        // Login
        localStorage.setItem("token", response.data.token);
        dispatch({ type: "user/login", payload: response.data.token });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(
        `${tabValue === 0 ? "Login" : "Registration"} error:`,
        error.response ? error.response.data : error.message
      );
      setError(error.response ? error.response.data.error : "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            {tabValue === 0 ? "Login" : "Register"}
          </Typography>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            sx={{ mb: 2 }}
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Username"
              variant="outlined"
              value={credentials.username}
              onChange={(e) =>
                setCredentials({ ...credentials, username: e.target.value })
              }
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              fullWidth
              required
              disabled={loading}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {tabValue === 0 ? "Login" : "Register"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
