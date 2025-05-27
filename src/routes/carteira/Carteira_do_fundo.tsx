import React, { useEffect, useState } from "react";
import SpreadsheetLinhasSaltadas from "../../components/spreadsheetLinhasSaltadas";
import { getCarteiraDoFundo, CategoriaLinhas } from "../../api";
import { CircularProgress, Typography, Box } from "@mui/material";
import ProtectedRoute from "../../components/ProtectedRoute";

const CarteiraDoFundo: React.FC = () => {
  const [data, setData] = useState<CategoriaLinhas[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getCarteiraDoFundo(); // must return CategoriaLinhas[]
        setData(result);
      } catch (err) {
        console.error("Erro ao buscar carteira do fundo:", err);
        setError("Erro ao carregar dados do servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <ProtectedRoute>
      <SpreadsheetLinhasSaltadas spreadsheetData={data ?? []} />
    </ProtectedRoute>
  );
};

export default CarteiraDoFundo;
