"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { DollarSign, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface PaymentModalProps {
  clientId: string;
  totalDebt: number;
  onSuccess: () => void | Promise<void>;
}

export default function PaymentClientModal({
  clientId,
  totalDebt,
  onSuccess,
}: PaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(Math.abs(totalDebt).toString());
  const [loading, setLoading] = useState(false);

const handlePayment = async () => {
  const numericAmount = Number(amount);
  
  if (isNaN(numericAmount) || numericAmount <= 0) {
    toast.error("El monto debe ser un número mayor a cero");
    return;
  }

  try {
    setLoading(true);
        const entriesRes = await api.get(`/account-entries/client/${clientId}`);
    
    const pendingEntry = entriesRes.data.find((e: any) => 
      e.type === "CHARGE" && e.sale && e.sale.id
    );

    if (!pendingEntry) {
      toast.error("No se encontró una venta pendiente para confirmar");
      return;
    }

    const saleId = pendingEntry.sale.id;

    await api.patch(`/sales/${saleId}/confirm`);

    toast.success("Venta confirmada con éxito");
    
    onSuccess();
    setIsOpen(false);
  } catch (error) {
    console.error("Error al confirmar venta:", error);
    toast.error("Error al procesar la confirmación");
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

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-800">
                Registrar Entrega
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-black"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400">
                  Monto a Cobrar
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xl">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl outline-none text-2xl font-black transition-all"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Deuda total: ${Math.abs(totalDebt).toLocaleString()}
                </p>
              </div>

              <button
                disabled={loading}
                onClick={handlePayment}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <DollarSign />
                )}
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
