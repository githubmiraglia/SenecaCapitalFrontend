import React, { useEffect, useState } from "react";
import SpreadsheetCategoriasSubcategoriasLinhas from "../../../components/spreadsheetCategoriasSubcategoriasLinhas";
import { getFluxoDeCaixa, CategoriasSubcategoriasLinhas } from "../../../api";
import { CircularProgress, Typography, Box } from "@mui/material";
import ProtectedRoute from "../../../components/ProtectedRoute";

const Extrato: React.FC = () => {
  const [data, setData] = useState<CategoriasSubcategoriasLinhas | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getFluxoDeCaixa();
        setData(result);
      } catch (err) {
        console.error("Erro ao buscar fluxo de caixa:", err);
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

  const normalizedData: CategoriasSubcategoriasLinhas[] = data ? [data] : [];

  return (
    <ProtectedRoute>
      <SpreadsheetCategoriasSubcategoriasLinhas spreadsheetData={normalizedData} />
    </ProtectedRoute>
  );
};

export default Extrato;
