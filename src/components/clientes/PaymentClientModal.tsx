"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { DollarSign, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface PaymentModalProps {
  clientId: string;
  saleId: string;
  totalDebt: number;
  onSuccess: () => void | Promise<void>;
}

export default function PaymentClientModal({
  clientId,
  saleId,
  totalDebt,
  onSuccess,
}: PaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && totalDebt > 0) setAmount(totalDebt.toString());
  }, [isOpen, totalDebt]);
  
  const handlePayment = async () => {
  const numericAmount = Number(amount);
  
  if (!clientId) return toast.error("No hay ID de cliente");
  if (isNaN(numericAmount) || numericAmount <= 0) return toast.error("Monto inválido");

  try {
    setLoading(true);
    
    await api.post(`/payments/direct`, {
      clientId: clientId,
      amount: numericAmount,
      paymentMethod: "CASH",
      description: "Pago desde cuenta corriente"
    });

    toast.success("Pago registrado correctamente");
    await onSuccess();
    setIsOpen(false);
  } catch (error: any) {
    console.error("Error en el pago:", error.response?.data);
    toast.error(error?.response?.data?.message || "Error al procesar el pago");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 w-full bg-black text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
      >
        <DollarSign size={20} /> Registrar Pago / Cobrar
      </button>

      {isOpen && totalDebt > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-800">Registrar Pago</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-black">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Monto a Cobrar
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 font-bold text-2xl text-slate-400">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-6 py-2 bg-transparent outline-none text-3xl font-black text-slate-800"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex justify-between items-center px-2">
                <span className="text-xs text-slate-400 font-bold uppercase">Deuda de esta venta</span>
                <span className="text-sm font-black text-red-500">${Number(totalDebt).toLocaleString("es-AR")}</span>
              </div>

              <button
                disabled={loading}
                onClick={handlePayment}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <DollarSign />}
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
