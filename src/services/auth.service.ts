import { api } from "@/lib/api";

export interface RegisterData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export const registerUser = async (userData: RegisterData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Error al registrar usuario";
  }
};