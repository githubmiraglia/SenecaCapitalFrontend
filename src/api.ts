// src/api.ts
import axios from "axios";
import {
  Product,
  ProductForm,
  UserPermissions,
  AcessoAFundos,
} from "./types/Types";
import { TreeNode } from "./types/Types";
import { currentVariables } from "./variables/generalVariables";

// -------------------------------------------------------
// Single axios instance
// -------------------------------------------------------
const BASE_URL =
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT automatically if present
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("access") ||  // preferred SimpleJWT key
    localStorage.getItem("token") ||   // fallback
    "";
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// -------------------------------------------------------
// Save CNAB Layout (used by SpreadsheetLinhasSaltadas)
// -------------------------------------------------------
export async function saveCnabLayout(rows: any[][], name = ""): Promise<void> {
  await api.post("/api/cnab-layout/save/", { rows, name });
}

// -------------------------------------------------------
// Frontend user
// -------------------------------------------------------
export type PermissionValue = ["yes" | "no", Record<string, unknown>];
export interface PermissionNode {
  acesso: boolean;
  edicao: boolean;
  children?: { [key: string]: PermissionNode };
}
export interface FrontendUserResponse {
  name: string;
  userPermissions: UserPermissions;
  acesso_a_fundos: AcessoAFundos;
}
export const getFrontendUser = async (
  username: string
): Promise<FrontendUserResponse> => {
  const token = localStorage.getItem("token");
  const response = await api.get<FrontendUserResponse>("/api/frontend-user", {
    params: { username },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// -------------------------------------------------------
// Auth
// -------------------------------------------------------
export interface AuthResponse {
  access: string;
  refresh: string;
}
export const login = async (
  username: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/api/token/", {
    username,
    password,
  });
  return response.data;
};

// -------------------------------------------------------
// Usuários (samples you already had)
// -------------------------------------------------------
export interface UsuarioResponse {
  id: number;
  nome: string;
  sobrenome: string;
  email: string;
  cpf: string;
  company: string;
  cgc: string;
  userPermissions: UserPermissions;
  acesso_a_fundos: AcessoAFundos;
}
export type CheckUsuarioResponse = false | UsuarioResponse;

export const checkUsuario = async (params: {
  email?: string;
  cpf?: string;
}): Promise<CheckUsuarioResponse> => {
  try {
    const response = await api.post<UsuarioResponse>("/usuarios/check", params, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return false;
    throw err;
  }
};

export interface UsuarioPayload {
  nome: string;
  sobrenome: string;
  email: string;
  cpf: string;
  company: string;
  cgc: string;
  senha: string;
  userPermissions: UserPermissions;
  acesso_a_fundos: { [fundo: string]: { classes: string[] } };
}

export const createUsuario = async (
  payload: UsuarioPayload
): Promise<UsuarioResponse> => {
  const response = await api.post<UsuarioResponse>("/usuarios", payload, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

export const updateUsuario = async (
  id: number,
  payload: UsuarioPayload
): Promise<UsuarioResponse> => {
  const response = await api.put<UsuarioResponse>(`/usuarios/${id}`, payload, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

export const deleteUsuario = async (
  id: number
): Promise<{ success: boolean; deletedId: number }> => {
  const response = await api.delete<{ success: boolean; deletedId: number }>(
    `/usuarios/${id}`,
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );
  return response.data;
};

// -------------------------------------------------------
// Fundos / Classes (unchanged patterns)
// -------------------------------------------------------
export async function getFundoList(): Promise<{ id: string; nome: string }[]> {
  const response = await api.get("/api/fundos");
  return response.data;
}
export async function getClasseList(
  fundoID: string
): Promise<{ id: string; nome: string }[]> {
  const response = await api.get(
    `/api/classes?fundoID=${encodeURIComponent(fundoID)}`
  );
  if (response.status !== 200) throw new Error("Erro ao buscar classes");
  return response.data;
}
export const downloadPDF = async (fullPath: string): Promise<void> => {
  const response = await api.post(
    "/relatorios/repositorio/upload",
    { fullPath },
    { responseType: "blob" }
  );
  const blob = new Blob([response.data], { type: "application/pdf" });
  const fileName = fullPath.split(/[/\\]/).pop() || "documento.pdf";
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
export async function getFundosComClasses(): Promise<any> {
  const response = await fetch("http://localhost:5000/api/fundos-com-classes");
  if (!response.ok) throw new Error("Failed to fetch fundos with classes");
  return response.json();
}

// -------------------------------------------------------
// Repositório
// -------------------------------------------------------
export async function getRepositorioTree(): Promise<TreeNode> {
  const params = new URLSearchParams({
    basePath: currentVariables.baseServerPath,
  });
  const response = await api.get<TreeNode>(
    `/relatorios/repositorio/lista?${params.toString()}`
  );
  return response.data;
}
export const getPolicyFiles = async (basePath: string) => {
  const response = await api.get("/relatorios/repositorio/politicas", {
    params: { basePath },
  });
  return response.data;
};
export async function fetchFileFromServer(fullPath: string): Promise<Blob> {
  const response = await api.post(
    "/relatorios/repositorio/upload",
    { fullPath },
    { responseType: "blob" }
  );
  return response.data;
}

// -------------------------------------------------------
// Spreadsheet/demonstrativos (unchanged)
// -------------------------------------------------------
export interface SubcategoriasLinhas {
  titulo: string;
  linhas: (string | number | null)[][];
}
export interface CategoriasSubcategoriasLinhas {
  categoria: string;
  dates?: string[];
  subcategorias: SubcategoriasLinhas[];
  total: (string | number | null)[];
}
export interface CategoriaLinhasDatas {
  categoria: string;
  linhas: (string | number | null)[][];
  total: (string | number | null)[];
  dates?: string[];
}
export interface CategoriaLinhas {
  categoria: string;
  linhas: [string, number][];
  total: [string, number];
}

export async function getBalancoPatrimonial(): Promise<CategoriasSubcategoriasLinhas> {
  const response = await api.get("/api/balanco-patrimonial");
  return response.data;
}
export async function getResultado(): Promise<CategoriasSubcategoriasLinhas> {
  const response = await api.get("/api/resultado");
  return response.data;
}
export async function getFluxoDeCaixa(): Promise<CategoriasSubcategoriasLinhas> {
  const response = await api.get("/api/fluxo-de-caixa");
  return response.data;
}
export async function getCotas(): Promise<CategoriasSubcategoriasLinhas> {
  const response = await api.get("/api/cotas");
  return response.data;
}
export async function getCarteiraDoFundo(): Promise<CategoriaLinhas[]> {
  const response = await api.get("/api/carteira-do-fundo");
  return response.data;
}

// -------------------------------------------------------
// Calendário
// -------------------------------------------------------
export interface Evento {
  data: string;
  descricao: string;
  arquivo?: string;
}
export async function getCalendarioDeEventos(): Promise<Evento[]> {
  const response = await api.get("/api/calendario-de-eventos");
  return response.data;
}

// -------------------------------------------------------
// Tabelas do servidor
// -------------------------------------------------------
export const getListaDeTabelas = async (): Promise<string[]> => {
  const response = await api.get("/tabelas/tabelas-disponiveis");
  return response.data;
};
export const getDadosDaTabela = async (
  nomeDaTabela: string
): Promise<{ columns: string[]; data: (string | number | null)[][] }> => {
  const response = await api.get("/tabelas/dados-da-tabela", {
    params: { nomedatabela: nomeDaTabela },
  });
  return response.data;
};

// -------------------------------------------------------
// Spreadsheet upload (example you had)
// -------------------------------------------------------
export async function uploadSpreadsheetData(
  data: Record<string, string | number | null>[],
  headers: string[]
): Promise<void> {
  const payload = { headers, data };
  await api.post("/tabelas/upload-sheet", payload, {
    headers: { "Content-Type": "application/json" },
  });
}

// -------------------------------------------------------
// Leitor CNAB
// -------------------------------------------------------
export const uploadCnabLayoutPdf = async (formData: FormData) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Token não encontrado no localStorage");
  return api.post("/api/ler-layout-cnab/", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
