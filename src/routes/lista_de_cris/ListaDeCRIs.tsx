// src/routes/tabelas/ListaDeCRIs.tsx
import React, { useEffect, useState, useRef } from "react";
import Spreadsheet from "../../components/Spreadsheet";
import {
  getCRIOperacoes,
  CRIOperacao,
  api,
} from "../../api";
import { CircularProgress, Typography, Box } from "@mui/material";
import "../../css/Spreadsheet.css";
import * as XLSX from "xlsx";

// 🔠 Helper to generate Excel-like column names
const getExcelColumnName = (index: number): string => {
  let name = "";
  let n = index;
  while (n >= 0) {
    name = String.fromCharCode((n % 26) + 65) + name;
    n = Math.floor(n / 26) - 1;
  }
  return name;
};

const ListaDeCRIs: React.FC = () => {
  const [data, setData] = useState<(string | number | null)[][]>([]);
  const [loading, setLoading] = useState(true);
  const spreadsheetRef = useRef<any>(null);

  const escapeIdentifier = (val: any): string =>
    val === null || val === undefined ? "" : "\u200B" + String(val);

  // ✅ Load CRI operações
  useEffect(() => {
    (async () => {
      try {
        const rows = await getCRIOperacoes();

        const mapped = rows.map((r: CRIOperacao) => [
          escapeIdentifier(r.codigo_if),
          r.operacao,
          r.securitizadora,
          r.classe_titulo,
          r.emissao,
          r.serie,
          r.data_emissao,
          r.montante_emitido,
          r.remuneracao,
          r.spread_aa,
          r.prazo_meses,
          r.ativo_lastro,
          r.tipo_devedor,
          r.agente_fiduciario,
          r.tipo_oferta,
          r.regime_fiduciario,
          r.pulverizado ? "Sim" : "Não",
          r.qtd_emitida,
          r.segmento_imobiliario,
          r.certificacao_esg,
          r.agencia_certificadora_esg,
          r.contrato_lastro,
          r.isin,
          r.cedentes,
          r.lider_distribuicao,
          r.carencia_principal_meses,
          r.frequencia_principal,
          r.tabela_juros,
          r.frequencia_juros,
          r.metodo_principal,
          r.periodo_integralizacao,
          r.frequencia_integralizacao,
          r.duration,
          r.spread,
          r.taxa,
        ]);
        setData(mapped);
      } catch (err) {
        console.error("❌ Erro ao carregar CRIOperacoes:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ Real columns
  const baseColumns = [
    { title: "Código IF", width: 120, type: "text" },
    { title: "Operação", width: 160, type: "text" },
    { title: "Securitizadora", width: 160, type: "text" },
    { title: "Classe Título", width: 140, type: "text" },
    { title: "Emissão", width: 120, type: "text" },
    { title: "Série", width: 100, type: "text" },
    { title: "Data Emissão", width: 140, type: "text" },
    { title: "Montante Emitido", width: 160, type: "numeric", mask: "#,##0.00" },
    { title: "Remuneração", width: 140, type: "text" },
    { title: "Spread a.a.", width: 120, type: "numeric", mask: "#,##0.00" },
    { title: "Prazo (meses)", width: 120, type: "numeric" },
    { title: "Ativo Lastro", width: 160, type: "text" },
    { title: "Tipo Devedor", width: 160, type: "text" },
    { title: "Agente Fiduciário", width: 160, type: "text" },
    { title: "Tipo Oferta", width: 140, type: "text" },
    { title: "Regime Fiduciário", width: 160, type: "text" },
    { title: "Pulverizado", width: 120, type: "text" },
    { title: "Qtd Emitida", width: 140, type: "numeric" },
    { title: "Segmento Imobiliário", width: 160, type: "text" },
    { title: "Certificação ESG", width: 160, type: "text" },
    { title: "Agência Cert. ESG", width: 180, type: "text" },
    { title: "Contrato Lastro", width: 160, type: "text" },
    { title: "ISIN", width: 160, type: "text" },
    { title: "Cedentes", width: 180, type: "text" },
    { title: "Líder Distribuição", width: 180, type: "text" },
    { title: "Carência Principal (meses)", width: 180, type: "numeric" },
    { title: "Frequência Principal", width: 180, type: "text" },
    { title: "Tabela Juros", width: 180, type: "text" },
    { title: "Frequência Juros", width: 180, type: "text" },
    { title: "Método Principal", width: 180, type: "text" },
    { title: "Período Integralização", width: 180, type: "text" },
    { title: "Frequência Integralização", width: 180, type: "text" },
    { title: "Duration", width: 120, type: "numeric" },
    { title: "Spread", width: 120, type: "numeric" },
    { title: "Taxa", width: 120, type: "numeric" },
  ];

  // ✅ Extra columns
  const dummyCount = 20;
  const extraColumns = Array.from({ length: dummyCount }, (_, i) => ({
    title: getExcelColumnName(i + baseColumns.length),
    width: 120,
    type: "text",
  }));

  const allColumns = [...baseColumns, ...extraColumns];

  // ✅ Trigger backend calculations
  const handleCalculate = async () => {
    try {
      const payload = {
        listaCodigos: data.map((row) => ({
          "CÓDIGO IF": String(row[0] || "")
            .replace("\u200B", "")
            .trim()
            .toUpperCase(),
          Operacao: row[1],
          Remuneração: row[8],
          MontanteEmitido: row[7],
        })),
      };

      const response = await api.post("/api/crioperacoes/calculate/", payload);
      console.log("🟢 API Response:", response.data);

      const updates = (response.data.rows || response.data || []).map((u: any) => ({
        ...u,
        codigo_if: String(u.codigo_if || "")
          .replace("\u200B", "")
          .trim()
          .toUpperCase(),
      }));

      console.log("🔄 Normalized updates:", updates);

      const updatedData = data.map((row) => {
        const codigo_if = String(row[0] || "")
          .replace("\u200B", "")
          .trim()
          .toUpperCase();

        const found = updates.find((u: any) => u.codigo_if === codigo_if);

        if (found) {
          const newRow = [...row];
          newRow[baseColumns.length - 3] = found.duration ?? "";
          newRow[baseColumns.length - 2] = found.spread ?? "";
          newRow[baseColumns.length - 1] = found.taxa ?? "";
          return newRow;
        }
        return row;
      });

      console.log("✅ Updated spreadsheet rows:", updatedData);
      setData(updatedData);

      // ✅ Save results back to Django
      await api.post("/api/crioperacoes/upsert/", {
        unique_by: "codigo_if",
        rows: updates.map((u: any) => ({
          codigo_if: u.codigo_if,
          duration: u.duration,
          spread: u.spread,
          taxa: u.taxa,
        })),
      });
      console.log("💾 Calculated values saved to Django.");

      alert("✅ Script Cálculos rodado e salvo com sucesso!");
    } catch (err) {
      console.error("❌ Erro ao rodar cálculos", err);
      alert("Erro ao rodar cálculos");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Carregando operações de CRI…</Typography>
        </Box>
      ) : (
        <Spreadsheet
          ref={spreadsheetRef}
          data={data.map((row) => [
            ...row,
            ...Array(extraColumns.length).fill(""),
          ])}
          columns={allColumns}
          worksheetName="CRIOperacoes"
          onDataChange={(newData) => setData(newData)}
          customFunctions={{ calcularTaxas: handleCalculate }}
          toolbar={(toolbar: any) => {
            toolbar.items.push(
              {
                type: "i",
                content: "grid_on",
                tooltip: "Exportar para Excel",
                onclick: () => {
                  const ws = XLSX.utils.aoa_to_sheet([
                    allColumns.map((c) => c.title),
                    ...data,
                  ]);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "CRIs");
                  XLSX.writeFile(wb, "Lista_de_CRIs.xlsx");
                },
              }
            );
            return toolbar;
          }}
        />
      )}
    </Box>
  );
};

export default ListaDeCRIs;
