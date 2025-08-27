// src/routes/fundo/Fundo.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete, TextField, Paper, Typography, Container } from "@mui/material";
import { setFundo, currentVariables } from "../../variables/generalVariables";

interface Fundo {
  id: string;
  nome: string;
}

// 🔹 Hardcoded fallback list
const DEFAULT_FUNDOS: Fundo[] = [
  { id: "1", nome: "Fundo FGR" },
  { id: "2", nome: "Fundo 2" },
  { id: "3", nome: "Fundo 3" },
];

const Fundo: React.FC = () => {
  const [fundos, setFundos] = useState<Fundo[]>([]);
  const [selectedFundo, setSelectedFundo] = useState<Fundo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const permissions = currentVariables.permissions;

    if (permissions?.chosenFunds) {
      const fundosPermitidos = DEFAULT_FUNDOS.filter(f =>
        permissions.chosenFunds[f.nome]?.acesso
      );
      setFundos(fundosPermitidos.length ? fundosPermitidos : DEFAULT_FUNDOS);
    } else {
      setFundos(DEFAULT_FUNDOS);
    }
  }, []);

  const handleSelect = (fundo: Fundo | null) => {
    if (fundo) {
      setSelectedFundo(fundo);
      setFundo(fundo.id, fundo.nome);
      window.dispatchEvent(new Event("fundoUpdated"));
      navigate("/");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper style={{ padding: "2rem", marginTop: "4rem" }}>
        <Typography variant="h5" gutterBottom>
          Escolha de Fundo
        </Typography>
        <Autocomplete
          options={fundos}
          value={selectedFundo}
          onChange={(event, value) => handleSelect(value)}
          getOptionLabel={(option) => option.nome}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField {...params} label="Fundo" variant="outlined" />
          )}
          fullWidth
        />
      </Paper>
    </Container>
  );
};

export default Fundo;

