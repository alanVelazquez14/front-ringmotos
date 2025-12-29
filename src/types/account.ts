export type AccountEntryType =
  | "CHARGE"
  | "PAYMENT"
  | "ADJUSTMENT";

export type AccountEntrySale = {
  id: string;
  status: "CONFIRMED" | "CANCELLED";
  totalAmount: string;
  paidAmount: string;
  createdAt: string;
  confirmedAt: string | null;
  printedAt: string | null;
};

export type AccountEntry = {
  id: string;
  type: AccountEntryType;
  amount: string;
  balanceAfter: string;
  description: string;
  createdAt: string;
  status: "ACTIVE";
  sale: AccountEntrySale | null;
  payment: any | null;
};
