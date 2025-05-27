import React from "react";
import Login from "../components/Login";
import "../css/login.css"; // now pulling styles from the CSS file

const LoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  return (
    <div className="login-page-container">
      <div className="login-page-left">
        <img id="login-logo" src="/img/Seneca Asset - Logo Transparente Branco.avif" alt="Logo" />
      </div>
      <div className="login-page-right">
        <Login onLogin={onLogin} />
      </div>
    </div>
  );
};

export default LoginPage;
