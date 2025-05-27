import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getClasseList } from "../../api";
import { getFundoID, getFundoName, setClasse, currentVariables } from "../../variables/generalVariables";
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
    const fundoNome = getFundoName(); // Used to access permissions

    if (!fundoID || !fundoNome) {
      setError("FAVOR ESCOLHER FUNDO");
      setLoading(false);
      return;
    }

    const fetchClasses = async () => {
      try {
        const list = await getClasseList(fundoID);

        // Load permissions from localStorage
        const chosenFunds = currentVariables.permissions.chosenFunds;

        const allowedClasses = Object.keys(
          chosenFunds?.[fundoNome]?.classe || {}
        ).filter(
          (className) => chosenFunds[fundoNome].classe[className].acesso === true
        );

        const filtered = list.filter((c) => allowedClasses.includes(c.nome));
        setClasses(filtered);
      } catch (err) {
        console.error("Erro ao buscar classes:", err);
        setError("Erro ao carregar classes");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleSelect = (selected: Classe | null) => {
    if (selected) {
      setClasse(selected.id, selected.nome);
      window.dispatchEvent(new Event("classeUpdated"));
      console.log("CURRENT VARIABLES", currentVariables);
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
