import React, { useMemo, useState } from "react";
import Plot from "react-plotly.js";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  TextField,
} from "@mui/material";
import {
  excelToDateLabel,
  normalizeValues,
  abbreviateLabel,
} from "../utils/utils";

interface Subcategoria {
  titulo: string;
  linhas: (string | number | null)[][];
}

interface CategoriaData {
  categoria: string;
  dates?: string[];
  subcategorias?: Subcategoria[];
  linhas?: (string | number | null)[][];
  total: (string | number | null)[];
}

interface ChartRendererProps {
  spreadsheetData: (string | number | null)[][];
  spreadsheetRawData: CategoriaData[] | CategoriaData[][];
  defaultChart?: {
    chart_type: string;
    y_values: string[] | "NA";
  };
}

const ChartRenderer: React.FC<ChartRendererProps> = ({
  spreadsheetData,
  spreadsheetRawData,
  defaultChart,
}) => {
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">(
    defaultChart?.chart_type === "bar" || defaultChart?.chart_type === "pie"
      ? defaultChart.chart_type
      : "line"
  );

  const [normalize, setNormalize] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(
    Array.isArray(defaultChart?.y_values) ? defaultChart.y_values : []
  );

  const markerSymbols = [
    "circle",
    "square",
    "triangle-up",
    "diamond",
    "cross",
    "x",
    "star",
  ];

  const dateLabels = useMemo(() => {
    if (spreadsheetData.length === 0) return [];
    return spreadsheetData[0].slice(1).map((d) =>
      typeof d === "number" ? excelToDateLabel(d) : String(d)
    );
  }, [spreadsheetData]);

  const allRows = useMemo(() => spreadsheetData.slice(1), [spreadsheetData]);

  const allLabels = useMemo(() => {
    return allRows
      .map((row) => (typeof row[0] === "string" ? row[0] : ""))
      .filter((label) => !!label);
  }, [allRows]);

  const chartData = useMemo(() => {
    const flatData: CategoriaData[] = Array.isArray(spreadsheetRawData[0])
      ? (spreadsheetRawData as CategoriaData[][]).flat()
      : (spreadsheetRawData as CategoriaData[]);

    if (chartType === "pie" && selectedDate) {
      const dateIndex = dateLabels.indexOf(selectedDate);
      const subcategorySums: Record<string, number> = {};

      flatData.forEach((categoria) => {
        if (categoria.subcategorias) {
          categoria.subcategorias.forEach((sub) => {
            let sum = 0;
            sub.linhas.forEach((linha) => {
              const val = linha?.[dateIndex + 1];
              if (typeof val === "number") sum += val;
            });
            if (sub.titulo) {
              subcategorySums[sub.titulo] =
                (subcategorySums[sub.titulo] || 0) + sum;
            }
          });
        } else if (categoria.linhas) {
          // Treat top-level lines as one subcategory
          let sum = 0;
          categoria.linhas.forEach((linha) => {
            const val = linha?.[dateIndex + 1];
            if (typeof val === "number") sum += val;
          });
          subcategorySums[categoria.categoria] = sum;
        }
      });

      const values = Object.values(subcategorySums);
      return [
        {
          type: "pie" as const,
          labels: Object.keys(subcategorySums),
          values: normalize ? normalizeValues(values) : values,
        },
      ];
    }

    // line/bar
    const lines: Record<string, number[]> = {};

    allRows.forEach((row) => {
      const label = row[0];
      if (typeof label !== "string") return;

      const values = row.slice(1).map((v) =>
        typeof v === "number" ? v : parseFloat(v as string) || 0
      );

      lines[label] = normalize ? normalizeValues(values) : values;
    });

    return Object.entries(lines)
      .filter(([label]) =>
        selectedLabels.length === 0 || selectedLabels.includes(label)
      )
      .map(([label, y], index) => ({
        x: dateLabels,
        y,
        name: abbreviateLabel(label),
        ...(chartType === "line"
          ? {
              type: "scatter" as const,
              mode: "lines+markers" as const,
              marker: {
                symbol: markerSymbols[index % markerSymbols.length],
                size: 8,
              },
            }
          : { type: "bar" as const }),
      }));
  }, [
    chartType,
    selectedDate,
    normalize,
    spreadsheetRawData,
    dateLabels,
    selectedLabels,
    allRows,
  ]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <FormControl size="small">
          <InputLabel>Tipo</InputLabel>
          <Select
            value={chartType}
            label="Tipo"
            onChange={(e: SelectChangeEvent) => {
              const val = e.target.value as "bar" | "line" | "pie";
              setChartType(val);
              setSelectedDate(null);
            }}
          >
            <MenuItem value="bar">Barras</MenuItem>
            <MenuItem value="line">Linha</MenuItem>
            <MenuItem value="pie">Pizza</MenuItem>
          </Select>
        </FormControl>

        {chartType !== "pie" && (
          <Autocomplete
            multiple
            options={allLabels}
            value={selectedLabels}
            onChange={(e, value) => setSelectedLabels(value)}
            renderInput={(params) => (
              <TextField {...params} label="Variáveis Y (linhas)" size="small" />
            )}
            sx={{ minWidth: 240 }}
          />
        )}

        {chartType === "pie" && (
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Data</InputLabel>
            <Select
              value={selectedDate || ""}
              label="Data"
              onChange={(e: SelectChangeEvent) => setSelectedDate(e.target.value)}
            >
              {dateLabels.map((label) => (
                <MenuItem key={label} value={label}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControlLabel
          control={<Checkbox checked={normalize} onChange={() => setNormalize(!normalize)} />}
          label="Normalizar"
        />
      </Box>

      <Plot
        data={chartData}
        layout={{
          autosize: true,
          title: {
            text:
              chartType === "pie"
                ? selectedDate
                  ? "Gráfico de Pizza"
                  : ""
                : chartType === "line"
                ? "Gráfico de Linhas"
                : "Gráfico de Barras",
            x: 0.005,
            xanchor: "left",
          },
          margin: { t: 40, l: 50, r: 30, b: 50 },
        }}
        useResizeHandler
        style={{ width: "100%", height: "50%" }}
      />
    </Box>
  );
};

export default ChartRenderer;
