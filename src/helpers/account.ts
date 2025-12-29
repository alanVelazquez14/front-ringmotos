import { AccountEntry, AccountEntryType } from "@/types/account";

export function getEntryLabel(entry: AccountEntry) {
  if (entry.type === "CHARGE") return "Cargo (Venta)";
  if (entry.type === "PAYMENT") return "Pago";
  if (entry.type === "ADJUSTMENT") return "Ajuste";
  return entry.type;
}


export function getAmountColor(type: AccountEntryType) {
  if (type === "CHARGE") return "text-red-600";
  if (type === "PAYMENT") return "text-green-600";
  if (type === "ADJUSTMENT") return "text-yellow-600";
  return "";
}
