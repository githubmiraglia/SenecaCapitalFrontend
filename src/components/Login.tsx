import React, { useState } from "react";
import { login } from "../api";

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await login(username, password);
      localStorage.setItem("token", data.access);
      onLogin();
    } catch (err) {
      setError("Erro ao autenticar");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuário" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
