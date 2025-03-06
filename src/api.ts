import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interface para resposta da API
interface AuthResponse {
  access: string;
}

// Função para login
export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/api/token/", { username, password });
  return response.data;
};
