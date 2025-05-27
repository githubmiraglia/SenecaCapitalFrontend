import React from "react";
import { useNavigate } from "react-router-dom";
import { currentVariables } from "../variables/generalVariables";
import { Box, Typography, Alert } from "@mui/material";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const { fundo, classe } = currentVariables;

  const fundoEscolhido = fundo.fundoID && fundo.fundoName;
  const classeEscolhida = classe.classeID && classe.classeName;

  if (!fundoEscolhido || !classeEscolhida) {
    return (
      <Box mt={4} textAlign="center">
        <Alert severity="warning" sx={{ maxWidth: 500, margin: "0 auto" }}>
          Por favor, escolha um Fundo e uma Classe.
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
