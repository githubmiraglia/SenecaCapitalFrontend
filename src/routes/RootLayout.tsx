import React, { useRef, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import "../css/rootlayout.css";
import { getFundoName, getClasseName, currentVariables } from "../variables/generalVariables";

const RootLayout: React.FC = () => {
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [fundoName, setFundoName] = useState<string>("");
  const [classeName, setClasseName] = useState<string>("");

  useEffect(() => {
    setFundoName(getFundoName());
    setClasseName(getClasseName());

    const handleFundoUpdate = () => setFundoName(getFundoName());
    const handleClasseUpdate = () => setClasseName(getClasseName());

    window.addEventListener("fundoUpdated", handleFundoUpdate);
    window.addEventListener("classeUpdated", handleClasseUpdate);

    return () => {
      window.removeEventListener("fundoUpdated", handleFundoUpdate);
      window.removeEventListener("classeUpdated", handleClasseUpdate);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node)
      ) {
        navigate('/', { replace: true });
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      const spreadsheetVisible = document.querySelector(".spreadsheet-active");

      if (event.key === 'Escape') {
        if (spreadsheetVisible) {
          event.preventDefault();
          event.stopPropagation();
          console.log("ESC ignored because spreadsheet is active");
        } else {
          navigate('/', { replace: true });
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  const { user } = currentVariables;

  return (
    <div className="root-layout">
      <div className="sidebar">
        <img
          id="root-logo"
          src="/img/Seneca Asset - Logo Transparente Branco.avif"
          alt="Logo"
        />
        {(fundoName || classeName) && (
          <div className="fundo-classe-header">
            {fundoName && (
              <div className="fundo-sidebar-name">
                {fundoName.length > 22 ? `${fundoName.slice(0, 17)}...` : fundoName}
              </div>
            )}
            {classeName && (
              <div className="classe-sidebar-name">
                {classeName.length > 15 ? `${classeName.slice(0, 15)}...` : classeName}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ User display in top-right */}
      {user?.nome && user?.sobrenome && (
        <div className="user-display">
          Bem vindo, {user.nome} {user.sobrenome}
        </div>
      )}

      <div ref={overlayRef} className="root-overlay">
        <Outlet />
      </div>
    </div>
  );
};

export default RootLayout;
