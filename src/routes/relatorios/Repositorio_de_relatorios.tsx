import React, { useState } from "react";
import { Paper, Typography, Box } from "@mui/material";
import Treeview from "../../components/Treeview";
import PDFViewer from "../../components/PDFViewer";
import "./Repositorio_de_relatorios.css";
import ProtectedRoute from "../../components/ProtectedRoute";

const RepositorioDeRelatorios: React.FC = () => {
  const [selectedPDF, setSelectedPDF] = useState<string>("");

  return (
    <ProtectedRoute>
      <Box className="repositorio-container">
        {/* Left: Treeview */}
        <Paper className="repositorio-sidebar">
          <Treeview onSelectFile={setSelectedPDF} mode="repositorio" title = "Repositório de Documentos do Servidor" />
        </Paper>

        {/* Right: PDF Viewer */}
        <Paper className="repositorio-viewer">
          <Typography variant="h6" gutterBottom sx={{ color: "#1E88E5" }}>
            Visualizador de PDF
          </Typography>
          {selectedPDF ? (
            <PDFViewer fileUrl={selectedPDF} />
          ) : (
            <Typography variant="body2" color="textSecondary">
              Selecione um documento à esquerda.
            </Typography>
          )}
        </Paper>
      </Box>
    </ProtectedRoute>
  );
};

export default RepositorioDeRelatorios;
