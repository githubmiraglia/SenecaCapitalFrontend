import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Button,
  Alert,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import DownloadIcon from "@mui/icons-material/Download";
import { fetchFileFromServer, downloadPDF } from "../api";

// ✅ Vite-compatible worker resolution
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

interface PDFViewerProps {
  fileUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileUrl) return;
    let cancelled = false;
    const fetchPdf = async () => {
      try {
        const blob = await fetchFileFromServer(fileUrl);
        if (!cancelled) {
          const blobUrl = URL.createObjectURL(blob);
          setPdfBlobUrl(blobUrl);
          setPdfError(null); // clear any previous error
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Erro ao carregar o arquivo:", err);
          setPdfError("Erro ao carregar o PDF. Verifique o nome ou formato do arquivo.");
        }
      }
    };

    fetchPdf();

    return () => {
      cancelled = true;
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [fileUrl]);

  useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      nextPage();
    } else if (event.key === "ArrowLeft") {
      prevPage();
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
  }, [pageNumber, numPages]);


  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const nextPage = () => {
    if (pageNumber < (numPages || 0)) setPageNumber(pageNumber + 1);
  };

  const prevPage = () => {
    if (pageNumber > 1) setPageNumber(pageNumber - 1);
  };

  const handleDownload = async () => {
    try {
      await downloadPDF(fileUrl);
    } catch (err) {
      console.error("Erro ao baixar o PDF:", err);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      {/* Controls at the top */}
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <IconButton onClick={prevPage} disabled={pageNumber <= 1}>
          <NavigateBeforeIcon />
        </IconButton>
        <Typography>
          Página {pageNumber} de {numPages ?? "?"}
        </Typography>
        <IconButton onClick={nextPage} disabled={pageNumber >= (numPages || 0)}>
          <NavigateNextIcon />
        </IconButton>
        <IconButton onClick={() => setScale((s) => s + 0.1)}>
          <ZoomInIcon />
        </IconButton>
        <IconButton onClick={() => setScale((s) => Math.max(0.5, scale - 0.1))}>
          <ZoomOutIcon />
        </IconButton>
        <Button onClick={handleDownload} variant="outlined" startIcon={<DownloadIcon />}>
          Baixar
        </Button>
      </Box>

      {/* PDF rendering or error */}
      <Box
        sx={{
          border: "1px solid #ccc",
          width: "80vh",
          height: "75vh",
          overflow: "auto",
          textAlign: "center",
        }}
      >
        {pdfError ? (
          <Alert severity="error">{pdfError}</Alert>
        ) : pdfBlobUrl ? (
          <Document
            key={pdfBlobUrl}
            file={pdfBlobUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={(err) => {
              console.error("Erro ao carregar PDF:", err);
              setPdfError("Erro ao abrir o PDF. O arquivo pode estar corrompido.");
            }}
            loading={<CircularProgress />}
            error={<Typography color="error">Erro ao carregar PDF</Typography>}
            noData={<Typography>Arquivo não encontrado.</Typography>}
          >
            <Page pageNumber={pageNumber} scale={scale} />
          </Document>
        ) : (
          <CircularProgress />
        )}
      </Box>
    </Box>
  );
};

export default PDFViewer;
