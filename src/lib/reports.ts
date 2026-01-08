import { api } from "@/lib/api";
import {
  ClientSalesReport,
  RangeSalesReport,
  UserSalesReport,
} from "@/types/reports";

export const ReportsService = {
  getSalesByClient: (from: string, to: string) =>
    api.get<ClientSalesReport[]>(
      `/reports/sales/by-client?from=${from}&to=${to}`
    ),

  getSalesBySingleClient: (clientId: string, from: string, to: string) =>
    api.get<ClientSalesReport[]>(
      `/reports/sales/by-client/${clientId}?from=${from}&to=${to}`
    ),

  getSalesByRange: (from: string, to: string) =>
    api.get<RangeSalesReport>(
      `/reports/sales/range?from=${from}&to=${to}`
    ),

  getSalesByUser: (from: string, to: string) =>
    api.get<UserSalesReport[]>(
      `/reports/sales/by-user?from=${from}&to=${to}`
    ),

  getClientMonthlySummary: (clientId: string) =>
    api.get(`/account-entries/summary/${clientId}/monthly`),
};
