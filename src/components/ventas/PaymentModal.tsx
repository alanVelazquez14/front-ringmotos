"use client";

import { useState } from "react";
import { useSales, PaymentMethod } from "@/context/SalesContext";

type Props = {
  type: "TOTAL" | "PARTIAL";
};

export default function PaymentModal({ type }: Props) {
  const { sale, registerPayment } = useSales();
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>("CASH");

  if (!sale) return null;

  const maxAmount = type === "TOTAL" ? sale.total : sale.balance;

  const handlePay = async () => {
    if (amount <= 0 || amount > maxAmount) return;
    await registerPayment(amount, method);
    setAmount(0);
  };

  return (
    <div className="bg-white p-4 rounded shadow w-64">
      <h3 className="font-bold mb-2">
        {type === "TOTAL" ? "Pago Total" : "Pago Parcial"}
      </h3>

      <p className="text-sm text-gray-500 mb-2">
        Total: ${sale.total}
      </p>

      <input
        type="number"
        min={0}
        max={maxAmount}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-full border rounded px-2 py-1 mb-2"
      />

      <select
        value={method}
        onChange={(e) =>
          setMethod(e.target.value as PaymentMethod)
        }
        className="w-full border rounded px-2 py-1 mb-4"
      >
        <option value="CASH">Efectivo</option>
        <option value="TRANSFER">Transferencia</option>
        <option value="CARD">Tarjeta</option>
      </select>

      <button
        onClick={handlePay}
        className="w-full bg-green-600 text-white py-2 rounded"
      >
        Confirmar pago
      </button>
    </div>
  );
}
