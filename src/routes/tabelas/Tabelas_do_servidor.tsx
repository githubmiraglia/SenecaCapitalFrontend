import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import SpreadsheetSimpleTable from "../../components/spreadsheetSimpleTable";
import "./Tabelas_do_servidor.css";
import { getListaDeTabelas, getDadosDaTabela } from "../../api";


interface TableData {
  columns: string[];
  data: (string | number | null)[][];
}

const TabelasDoServidor: React.FC = () => {
  const [tableList, setTableList] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tableLoading, setTableLoading] = useState<boolean>(false);

  useEffect(() => {
    getListaDeTabelas()
      .then((data) => setTableList(data))
      .catch((err) => console.error("Erro ao carregar tabelas:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedTable) {

      setTableLoading(true);
      getDadosDaTabela(selectedTable)
        .then((data) => setTableData(data))
        .catch((err) => console.error("Erro ao carregar dados da tabela:", err))
        .finally(() => setTableLoading(false));
    }
  }, [selectedTable]);

  return (
    <div className="tabelas-container">
      <div className="tabelas-sidebar">
        <Typography variant="h6" gutterBottom>
          Escolha uma Tabela
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
            <Autocomplete
                options={tableList}
                value={selectedTable}
                onChange={(e, newValue) => {
                    if (e) {
                    e.preventDefault();
                    e.stopPropagation(); // 🔥 prevent bubbling to RootLayout
                    }
                    setSelectedTable(newValue);
                }}
                renderInput={(params) => <TextField {...params} label="Tabela" />}
                fullWidth
            />
        )}
      </div>
      <div className="tabelas-spreadsheet">
        {tableLoading ? (
            <CircularProgress />
            ) : tableData && tableData.columns && tableData.data ? (
            <SpreadsheetSimpleTable
                tableData={tableData.columns.map((col, idx) => ({
                categoria: col,
                linhas: tableData.data.map((row) => (row ? row[idx] : null)),
                }))}
            />
            ) : (
            <Typography variant="body1" color="textSecondary">
                Nenhuma tabela selecionada.
            </Typography>
            )}
      </div>
    </div>
  );
};

export default TabelasDoServidor;
