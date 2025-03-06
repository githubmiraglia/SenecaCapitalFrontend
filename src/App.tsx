import React, { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("token"));

  return isAuthenticated ? <Dashboard /> : <Login onLogin={() => setIsAuthenticated(true)} />;
};

export default App;
