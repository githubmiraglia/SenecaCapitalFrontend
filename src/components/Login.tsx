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
import { setUserContextFromLoginResponse, currentVariables } from "../variables/generalVariables";

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🧩 Login component mounted. onLogin received:", onLogin);
  }, [onLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    console.log("🟢 SUBMITTING FORM"); // Confirm form is submitting
    e.preventDefault();
    setError(null);
    console.log("🚀 handleLogin triggered with email:", email);

    try {
      const data = await login(email, password);
      console.log("🔐 Login API response:", data);

      setUserContextFromLoginResponse(data);
      console.log("📦 currentVariables after login set:", currentVariables);

      console.log("📲 Calling onLogin from Login.tsx...");
      console.log(onLogin);
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
            label="Email"
            variant="outlined"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            onClick={() => console.log("🖱️ Entrar button clicked")}
          >
            Entrar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
