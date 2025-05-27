// src/api.ts
import axios from "axios";
import { Product, ProductForm, UserPermissions, AcessoAFundos } from "./types/Types";
import { TreeNode } from "./types/Types";

// Base URL from Vite environment
const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Permission-related types ---
export type PermissionValue = ["yes" | "no", Record<string, unknown>];
export interface PermissionNode {
  acesso: boolean;
  edicao: boolean;
  children?: {
    [key: string]: PermissionNode;
  };
}

// --- Auth / login response shape ---
export interface AuthResponse {
  access: string;
  user: {
    id: number;
    nome: string;
    sobrenome: string;
    email: string;
    userPermissions: UserPermissions;
    acesso_a_fundos: AcessoAFundos;
  };
}

// POST /login
export const login = async (
   email: string,
   password: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/login/",
    { email, password },
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
};

// --- User lookup response shape ---
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

// POST /usuarios/check
export const checkUsuario = async (params: {
  email?: string;
  cpf?: string;
}): Promise<CheckUsuarioResponse> => {
  try {
    const response = await api.post<UsuarioResponse>(
      "/usuarios/check",
      params,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return false;
    }
    throw err;
  }
};

// payload for create/update user
export interface UsuarioPayload {
  nome: string;
  sobrenome: string;
  email: string;
  cpf: string;
  company: string;
  cgc: string;
  senha: string;
  userPermissions: UserPermissions;
  acesso_a_fundos: {
    [fundo: string]: {
      classes: string[];
    };
  };
}

// SESSAO PARA O USUARIO
// POST /usuarios — create a new user
export const createUsuario = async (
  payload: UsuarioPayload
): Promise<UsuarioResponse> => {
  const response = await api.post<UsuarioResponse>(
    "/usuarios",
    payload,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return response.data;
};

// PUT /usuarios/:id — update an existing user
export const updateUsuario = async (
  id: number,
  payload: UsuarioPayload
): Promise<UsuarioResponse> => {
  const response = await api.put<UsuarioResponse>(
    `/usuarios/${id}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return response.data;
};

// DELETE /usuarios/:id — delete a user
export const deleteUsuario = async (
  id: number
): Promise<{ success: boolean; deletedId: number }> => {
  const response = await api.delete<{ success: boolean; deletedId: number }>(
    `/usuarios/${id}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return response.data;
};


//SESSAO PARA FUNDOS
// src/api/api.ts
export async function getFundoList(): Promise<{ id: string; nome: string }[]> {
  const response = await api.get("/api/fundos");
  return response.data;
}

export async function getClasseList(fundoID: string): Promise<{ id: string; nome: string }[]> {
  const response = await api.get(`/api/classes?fundoID=${encodeURIComponent(fundoID)}`);
  if (response.status !== 200) {
    throw new Error("Erro ao buscar classes");
  }
  return response.data;
}

export const downloadPDF = async (fullPath: string): Promise<void> => {
  const response = await api.post(
    "/relatorios/repositorio/upload",
    { fullPath },
    {
      responseType: "blob",
    }
  );

  const blob = new Blob([response.data], { type: "application/pdf" });

  // Extract filename from fullPath
  const fileName = fullPath.split(/[/\\]/).pop() || "documento.pdf";

  // Create a download link
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


export async function getFundosComClasses(): Promise<any> {
  const response = await fetch("http://localhost:5000/api/fundos-com-classes");
  if (!response.ok) {
    throw new Error("Failed to fetch fundos with classes");
  }
  return response.json();
}

// SESSAO PARA REPOSITORIOS
// Get the folder structure under the root/fundo/classe
export async function getRepositorioTree(fundo: string, classe: string): Promise<TreeNode> {
  const params = new URLSearchParams({
    fundo,
    classe,
  });
  const response = await api.get<TreeNode>(`/relatorios/repositorio/lista?${params.toString()}`);
  return response.data;
}

// Fetch a file from the server
export async function fetchFileFromServer(fullPath: string): Promise<Blob> {
  console.log("🌐 Sending POST to /upload with fullPath:", fullPath);
  const response = await api.post("/relatorios/repositorio/upload", { fullPath }, {
    responseType: "blob",

  });
  console.log("✅ Server responded with status", response.status);
  return response.data;
}

// TYPES FOR SPREADSHEET DATA
export interface SubcategoriasLinhas {
  titulo: string;
  linhas: (string | number | null)[][];
}

export interface CategoriasSubcategoriasLinhas {
  categoria: string;
  dates?: string[]; // Optional: array of column dates
  subcategorias: SubcategoriasLinhas[];
  total: (string | number | null)[];
}

export interface CategoriaLinhasDatas {
  categoria: string;
  linhas: (string | number | null)[][];
  total: (string | number | null)[];
  dates?: string[]; // Optional header labels (e.g., month/year)
}

export interface CategoriaLinhas {
  categoria: string;
  linhas: (string | number | null)[]; // now 1D array
}


// SESSAO PARA DADOS DE DEMONSTRACOES
// 1. balanco patrimonial
export async function getBalancoPatrimonial(): Promise<CategoriasSubcategoriasLinhas> {
  const response = await api.get("/api/balanco-patrimonial");
  return response.data;
}
// 2. demonstrativo de resultados
export async function getResultado(): Promise<CategoriasSubcategoriasLinhas> {
  const response = await api.get("/api/resultado");
  return response.data;
}
// 3. demonstrativo de fluxo de caixa
export async function getFluxoDeCaixa(): Promise<CategoriasSubcategoriasLinhas> {
  const response = await api.get("/api/fluxo-de-caixa");
  return response.data;
}

//SESSAO PARA DADOS DE COTAS
// 1. cotas
export async function getCotas(): Promise<CategoriasSubcategoriasLinhas> {
  const response = await api.get("/api/cotas");
  return response.data;
}

//SESSAO PARA DADOS DE CARTEIRA
// 1. carteira do fundo
export async function getCarteiraDoFundo(): Promise<CategoriaLinhas[]> {
  const response = await api.get("/api/carteira-do-fundo");
  return response.data;
}





