"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type CashMovement = {
  id: string;
  type: "IN" | "OUT";
  amount: string;
  reason: string;
  createdAt: string;
};

const getTypeLabel = (type: "IN" | "OUT") => {
  return type === "IN" ? "INGRESO" : "EGRESO";
};

export default function CashView() {
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const { data } = await api.get("/cash-movements");
        setMovements(data);
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, []);

  if (loading) return <p className="p-8 text-slate-600">Cargando caja...</p>;

  const getDescription = (m: CashMovement) => {
    return m.reason ?? "Movimiento de caja";
  };

  const formatAmount = (m: CashMovement) => {
    const value = parseFloat(m.amount) || 0;
    return `$${value.toLocaleString("es-AR")}`;
  };

  // Calculamos el saldo total para el apartado de abajo
  const totalBalance = movements.reduce((acc, m) => {
    const val = parseFloat(m.amount) || 0;
    return m.type === "IN" ? acc + val : acc - val;
  }, 0);

  let cumulativeBalance = 0;

  return (
    <div className="min-h-screen p-4 md:p-6 text-slate-800 pb-24 md:pb-6"> 
      {/* pb-24 en mobile para que el footer no tape el último movimiento */}
      
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold">Caja</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
        {/* Cabecera Desktop */}
        <div className="hidden md:grid grid-cols-5 border-b border-slate-100 bg-slate-50/50 px-6 py-4 text-sm font-semibold text-slate-600">
          <div>Fecha</div>
          <div>Tipo</div>
          <div>Descripción</div>
          <div className="text-right">Monto</div>
          <div className="text-right">Saldo</div>
        </div>

        <div className="divide-y divide-slate-100">
          {movements.map((m) => {
            const amountValue = parseFloat(m.amount) || 0;
            cumulativeBalance += m.type === "IN" ? amountValue : -amountValue;
            const currentBalance = cumulativeBalance;

            return (
              <div key={m.id} className="hover:bg-slate-50 transition-colors">
                {/* VISTA MOBILE: Más limpia sin el saldo interno */}
                <div className="flex md:hidden p-4 items-center justify-between gap-2">
                  <div className="flex gap-3 items-center">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-black shrink-0 ${
                        m.type === "IN"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {m.type === "IN" ? "INC" : "OUT"}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-slate-700 font-bold leading-tight text-sm">
                        {getDescription(m)}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(m.createdAt).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-bold whitespace-nowrap ${
                      m.type === "IN" ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {m.type === "OUT" ? "-" : ""}{formatAmount(m)}
                  </div>
                </div>

                {/* VISTA DESKTOP */}
                <div className="hidden md:grid grid-cols-5 px-6 py-4 items-center text-sm">
                  <div className="text-slate-600">
                    {new Date(m.createdAt).toLocaleDateString("es-AR")}
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${m.type === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {getTypeLabel(m.type)}
                    </span>
                  </div>
                  <div className="text-slate-700 font-medium truncate">{getDescription(m)}</div>
                  <div className={`text-right font-bold ${m.type === "IN" ? "text-emerald-500" : "text-red-500"}`}>
                    {m.type === "OUT" ? "-" : ""}{formatAmount(m)}
                  </div>
                  <div className="text-right font-semibold text-slate-500">
                    ${currentBalance.toLocaleString("es-AR")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* APARTADO DE SALDO MOBILE (Sticky Footer) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:hidden">
        <div className="bg-white rounded-xl p-4 shadow-lg flex justify-between items-center border-t-4 border-emerald-500">
          <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Saldo Total</span>
          <span className="text-xl font-black text-slate-800">
            ${totalBalance.toLocaleString("es-AR")}
          </span>
        </div>
      </div>
    </div>
  );
}