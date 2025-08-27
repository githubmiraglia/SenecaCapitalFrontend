import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { getClasseList } from "../../api"; // 🔴 Not needed anymore
import {
  getFundoID,
  getFundoName,
  setClasse,
  currentVariables,
} from "../../variables/generalVariables";
import {
  Container,
  Paper,
  Typography,
  Autocomplete,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import "./Classes.css";

interface Classe {
  id: string;
  nome: string;
}

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClasse, setSelectedClasse] = useState<Classe | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fundoID = getFundoID();
    const fundoNome = getFundoName();

    if (!fundoID || !fundoNome) {
      setError("FAVOR ESCOLHER FUNDO");
      setLoading(false);
      return;
    }

    // ✅ Hardcoded fallback class
    const fakeClasse = { id: "1", nome: "Classe 1" };
    setClasses([fakeClasse]);
    setSelectedClasse(fakeClasse);
    handleSelect(fakeClasse);
    setLoading(false);
  }, []);

  const handleSelect = (selected: Classe | null) => {
    if (selected) {
      setClasse(selected.id, selected.nome);
      const formatName = (str: string) => str.toLowerCase().replace(/\s+/g, "_");
      const fundoName = currentVariables.fundo.fundoName;
      const classeName = selected.nome;
      currentVariables.baseServerPath = `${formatName(fundoName)}/${formatName(classeName)}`;
      window.dispatchEvent(new Event("classeUpdated"));
      console.log("✅ CURRENT VARIABLES", currentVariables);
      setTimeout(() => {
        navigate("/");
      }, 300);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} className="classes-container">
        <Typography variant="h5" gutterBottom>
          Escolha de Classes
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="warning">{error}</Alert>
        ) : (
          <Autocomplete
            options={classes}
            value={selectedClasse}
            onChange={(_, value) => {
              setSelectedClasse(value);
              handleSelect(value);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.nome}
            renderInput={(params) => (
              <TextField {...params} label="Classe" variant="outlined" />
            )}
            fullWidth
            disablePortal
          />
        )}
      </Paper>
    </Container>
  );
};

export default Classes;
