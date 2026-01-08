import { api } from "@/lib/api";
import {
  ClientSalesReport,
  RangeSalesReport,
  UserSalesReport,
} from "@/types/reports";

export const ReportsService = {
  // 🔹 SIN rango (vista inicial)
  getSalesByClientAll: () =>
    api.get<ClientSalesReport[]>(`/reports/sales/by-client`),

  getSalesByUserAll: () => api.get<UserSalesReport[]>(`/reports/sales/by-user`),

  // 🔹 CON rango (filtro)
  getSalesByClient: (from: string, to: string) =>
    api.get<ClientSalesReport[]>(
      `/reports/sales/by-client?from=${from}&to=${to}`
    ),

  getSalesByRange: (from: string, to: string) =>
    api.get<RangeSalesReport>(`/reports/sales/range?from=${from}&to=${to}`),

  getSalesByUser: (from: string, to: string) =>
    api.get<UserSalesReport[]>(`/reports/sales/by-user?from=${from}&to=${to}`),
};
