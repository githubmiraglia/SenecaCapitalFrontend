import React, { useState } from "react";
import Login from "./components/Login";
import Products from "./components/Products";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("token"));

  return isAuthenticated ? <Products /> : <Login onLogin={() => setIsAuthenticated(true)} />;
};

export default App;
