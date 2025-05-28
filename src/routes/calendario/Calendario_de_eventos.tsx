import React, { useEffect, useState } from "react";
import { Paper, Typography, Box, CircularProgress } from "@mui/material";
import Calendario from "../../components/Calendario";
import PdfViewer from "../../components/PDFViewer";
import { Evento } from "../../types/Types";
import { getCalendarioDeEventos } from "../../api"; // Ensure this API function exists
import "./Calendario_de_Eventos.css";
import ProtectedRoute from "../../components/ProtectedRoute";

const CalendarioDeEventos: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [selectedArquivo, setSelectedArquivo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const result = await getCalendarioDeEventos();
        setEventos(result);
      } catch (err) {
        console.error("Erro ao buscar eventos:", err);
        setError("Erro ao carregar os eventos.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
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
      <Box className="container">
        {/* Left: Calendário */}
        <Paper className="calendar-panel">
          <Calendario eventos={eventos} onSelectArquivo={setSelectedArquivo} />
        </Paper>

        {/* Right: PDF Viewer */}
        <Paper className="viewer-panel">
          <Typography variant="h6" gutterBottom sx={{ color: "#1E88E5" }}>
            Visualizador de PDF
          </Typography>
          {selectedArquivo ? (
            <PdfViewer fileUrl={selectedArquivo} />
          ) : (
            <Typography variant="body2" color="textSecondary">
              Selecione um evento no calendário.
            </Typography>
          )}
        </Paper>
      </Box>
    </ProtectedRoute>
  );
};

export default CalendarioDeEventos;
