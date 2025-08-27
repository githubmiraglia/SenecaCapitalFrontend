// src/components/LoginPage.tsx
import React, { useState } from "react";
import axios from "axios";
import "../css/login.css";
import { currentVariables } from "../variables/generalVariables";
import { login, getFrontendUser } from "../api";

const LoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("🚀 Submitting login with:", username);

    try {
      // Authenticate and get token
      const { access } = await login(username, password);

      console.log("✅ JWT recebido:", access);

      // Store JWT in memory and localStorage
      axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      localStorage.setItem("token", access);
      currentVariables.user.token = access;

      // Fetch full user object from Django API
      const frontendUser = await getFrontendUser(username);

      currentVariables.user = {
        ...currentVariables.user,
        email: username,
        nome: frontendUser.name,
        userPermissions: frontendUser.userPermissions,
        acesso_a_fundos: frontendUser.acesso_a_fundos,
      };

      console.log("✅ currentVariables atualizados:", currentVariables);
      onLogin();
    } catch (err: any) {
      console.error("❌ Erro de login:", err.response?.data || err.message);
      setError("Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-page-left">
        <img
          id="login-logo"
          src="/img/Seneca Asset - Logo Transparente Branco.avif"
          alt="Logo"
        />
      </div>

      <div className="login-page-right">
        <div className="login-card">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2 style={{ fontWeight: "normal", color: "#999" }}>Login</h2>

            <input
              type="text"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">ENTRAR</button>

            {error && <p className="error-message">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
