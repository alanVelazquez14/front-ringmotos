export interface ClientSalesReport {
  clientId: string;
  clientName: string;
  totalSales: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface RangeSalesReport {
  totalSales: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface UserSalesReport {
  userId: string;
  userName: string;
  totalSales: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}
