"use client";

import { useEffect, useState } from "react";
import { CashRegister, useCashRegister } from "@/context/CashRegisterContext";

export default function CashMovementsPage() {
  const { cashRegister, setCashRegister } = useCashRegister();
  const [movements, setMovements] = useState<any[]>([]);

  useEffect(() => {
    if (!cashRegister) return;

    const savedMovements = localStorage.getItem(`movements_${cashRegister.id}`);
    setMovements(savedMovements ? JSON.parse(savedMovements) : []);
  }, [cashRegister]);

  const handleOpenCashRegister = () => {
    const newCash: CashRegister = {
      id: Date.now().toString(),
      status: "OPEN",
      openingAmount: 0,
    };
    setCashRegister(newCash);
    setMovements([]);
  };

  if (!cashRegister) {
    return (
      <div>
        <p>No hay caja abierta</p>
        <button
          onClick={handleOpenCashRegister}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Abrir caja
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Movimientos de Caja</h1>

      {movements.length === 0 && <p>No hay movimientos aún</p>}

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Fecha</th>
            <th className="p-2">Tipo</th>
            <th className="p-2">Monto</th>
            <th className="p-2">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m.id} className="border-b">
              <td className="p-2">{m.date}</td>
              <td className="p-2">{m.type}</td>
              <td className="p-2">${m.amount}</td>
              <td className="p-2">{m.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
