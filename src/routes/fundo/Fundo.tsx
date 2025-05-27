// src/routes/fundo/Fundo.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFundoList } from "../../api";
import { setFundo, currentVariables } from "../../variables/generalVariables";
import {
  Container,
  Paper,
  Typography,
  Autocomplete,
  TextField,
  CircularProgress,
} from "@mui/material";
import "./Fundo.css";

interface Fundo {
  id: string;
  nome: string;
}

const Fundo: React.FC = () => {
  const [fundos, setFundos] = useState<Fundo[]>([]);
  const [selectedFundo, setSelectedFundo] = useState<Fundo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  //const  userChosenFunds = currentVariables.permissions.chosenFunds;

  useEffect(() => {
    const fetchFundos = async () => {
      try {
        const list = await getFundoList();
  
        // Read chosenFunds from localStorage
        const chosenFunds = currentVariables.permissions.chosenFunds;

        // Filter only fundos where acesso === true
        const filtered = list.filter((f) =>
          chosenFunds?.[f.nome]?.acesso === true
        );
        setFundos(filtered);
      } catch (error) {
        console.error("Erro ao buscar fundos:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchFundos();
  }, []);
  

  const handleSelect = (selected: Fundo | null) => {
    if (selected) {
      setFundo(selected.id, selected.nome);
      window.dispatchEvent(new Event("fundoUpdated"));
      setTimeout(() => {
        navigate("/");
      }, 300);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} className="fundo-container">
        <Typography variant="h5" gutterBottom>
          Escolha de Fundo
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
        <Autocomplete
            options={fundos}
            value={selectedFundo}
            onChange={(event, value) => {
                if (value) {
                setSelectedFundo(value);
                handleSelect(value);
                }
            }}
            getOptionLabel={(option) => option.nome}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
                <TextField {...params} label="Fundo" variant="outlined" />
            )}
            fullWidth
            disablePortal
        />
        )}
      </Paper>
    </Container>
  );
};

export default Fundo;
