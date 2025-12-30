"use client";

import { useState, useEffect } from "react";
import { useSales, PaymentMethod } from "@/context/SalesContext";
import { CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { getUserIdFromToken } from "@/helpers/auth";

interface PaymentModalProps {
  finalConsumerId?: string;
  clientId?: string | null;
}

export default function PaymentModal({
  finalConsumerId,
  clientId,
}: PaymentModalProps) {
  const { sale, registerPayment, resetSale } = useSales();
  const [isTotal, setIsTotal] = useState(true);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>("CASH");

  const calculatedTotal =
    sale?.items?.reduce(
      (acc, item) => acc + Number(item.qty) * Number(item.unitPrice),
      0
    ) || 0;

  const paid =
    sale?.payments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0;
  const pendingBalance = calculatedTotal - paid;

  useEffect(() => {
    if (sale) {
      setAmount(isTotal ? pendingBalance : 0);
    }
  }, [sale, isTotal, pendingBalance]);

  if (!sale || pendingBalance <= 0) return null;

  const handlePay = async () => {
    if (!sale?.id) return;
    const userId = getUserIdFromToken();

    if (!userId) {
      toast.error("Usuario no identificado.");
      return;
    }

    const cleanAmount = Number(amount.toString().replace(/\./g, '').replace('$', ''));

  if (isNaN(cleanAmount)) {
    toast.error("El monto ingresado no es válido");
    return;
  }

    try {
      if (cleanAmount <= 0) {
      await api.post(`/pos/sales/${sale.id}/action`, {
        action: "NO_PAYMENT",
        amount: 0,
        paymentMethod: "CASH",
        receivedBy: userId,
      });
      resetSale();
      toast.success("Venta enviada a cuenta corriente");
    } else {
      await registerPayment(cleanAmount, method);
      
      resetSale();
      toast.success("Pago total registrado con éxito");
    }
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || "Error al procesar el pago";
    toast.error(errorMsg);
    console.error("Detalle del error:", error?.response?.data);
  }
};

  return (
    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
      <div className="flex bg-white rounded-xl p-1 shadow-sm mb-4 border border-gray-200">
        <button
          onClick={() => setIsTotal(true)}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            isTotal
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          PAGAR TOTAL
        </button>
        <button
          onClick={() => setIsTotal(false)}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            !isTotal
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          OTRO MONTO
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-sm font-bold text-gray-800">
            Pendiente: ${pendingBalance.toLocaleString()}
          </span>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
            $
          </span>
          <input
            type="number"
            disabled={isTotal}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-xl pl-7 pr-4 py-3 font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 transition-all"
          />
        </div>

        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="EFECTIVO">💵 Efectivo</option>
          <option value="TRANSFERENCIA">🏦 Transferencia</option>
          <option value="TARJETA">💳 Tarjeta</option>
        </select>

        <button
          onClick={handlePay}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100 active:scale-[0.98] transition-all"
        >
          <CheckCircle2 size={20} />
          Confirmar Pago
        </button>
      </div>
    </div>
  );
}
