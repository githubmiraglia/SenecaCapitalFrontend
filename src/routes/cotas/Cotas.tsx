import React, { useEffect, useState } from "react";
import { getCotas, CategoriasSubcategoriasLinhas } from "../../api";
import { CircularProgress, Typography, Box } from "@mui/material";
import ProtectedRoute from "../../components/ProtectedRoute";
import SpreadsheetCategoriasSubcategoriasLinhas from "../../components/spreadsheetCategoriasSubcategoriasLinhas";

const Cotas: React.FC = () => {
  const [data, setData] = useState<CategoriasSubcategoriasLinhas | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getCotas();
        setData(result);
      } catch (err) {
        console.error("Erro ao buscar dados de cotas:", err);
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
      {/* Wrap result into an array if needed by the spreadsheet component */}
      <SpreadsheetCategoriasSubcategoriasLinhas spreadsheetData={data ? [data] : []} />
    </ProtectedRoute>
  );
};

export default Cotas;
