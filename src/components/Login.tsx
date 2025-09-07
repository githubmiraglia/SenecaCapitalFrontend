import React, { useState, useEffect } from "react";
import { login } from "../api";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Alert,
  Paper,
} from "@mui/material";
import {
  setUserContextFromLoginResponse,
  currentVariables,
} from "../variables/generalVariables";

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState<string>("");  // ✅ renamed from email
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🧩 Login component mounted. onLogin received:", onLogin);
  }, [onLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    console.log("🚀 handleLogin triggered with username:", username);

    try {
      const data = await login(username, password); // ✅ pass username, not email
      console.log("🔐 Login API response:", data);

      // Save tokens consistently
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      setUserContextFromLoginResponse(data);
      console.log("📦 currentVariables after login set:", currentVariables);

      onLogin(); // Callback to App.tsx
    } catch (err: any) {
      console.error("❌ Login error caught:", err);
      if (err.response?.status === 404) {
        setError("Usuário não encontrado.");
      } else if (err.response?.status === 401) {
        setError("Senha incorreta.");
      } else {
        setError("Erro inesperado. Tente novamente.");
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 4, mt: 8, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Usuário"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Senha"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            Entrar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
