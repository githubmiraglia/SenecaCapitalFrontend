import React, { useState } from "react";
import Treeview from "../../components/Treeview";
import PdfViewer from "../../components/PDFViewer";
import "./Politicas_da_gestora.css";

const Politicas_da_gestora: React.FC = () => {
  const [selectedPdf, setSelectedPdf] = useState<string>("");

  return (
    <div className="politicas-container">
      <div className="politicas-treeview">
        <Treeview onSelectFile={setSelectedPdf} mode="politicas" title = "Repositório de Políticas da Gestora" />
      </div>

      <div className="politicas-pdfviewer">
        <h2 className="politicas-title">Visualizador de PDF</h2>
        {selectedPdf ? (
          <PdfViewer fileUrl={selectedPdf} />
        ) : (
          <p className="pdf-placeholder">Selecione um documento à esquerda.</p>
        )}
      </div>
    </div>
  );
};

export default Politicas_da_gestora;
