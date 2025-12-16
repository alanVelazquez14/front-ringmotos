"use client";

import { useState } from "react";
import { useCashRegister, type CashRegister } from "@/context/CashRegisterContext";

export default function OpenCashPage() {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const { cashRegister, setCashRegister } = useCashRegister();

  const openCash = () => {
    if (!amount) {
      setError("Debe ingresar un monto inicial");
      return;
    }

    const newCash: CashRegister = {
      id: Date.now().toString(),
      name: "Caja Principal",
      status: "OPEN",
      openingAmount: Number(amount),
    };

    setCashRegister(newCash);
    setError("");
    alert("Caja abierta correctamente");
  };

  if (cashRegister) {
    return (
      <div className="max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4">Caja abierta</h1>
        <p>
          Caja "{cashRegister.name}" abierta con ${cashRegister.openingAmount}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Abrir Caja</h1>

      <input
        type="number"
        className="w-full border p-2 rounded mb-4"
        placeholder="Monto inicial"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <button
        onClick={openCash}
        className="w-full bg-slate-900 text-white py-2 rounded"
      >
        Abrir caja
      </button>
    </div>
  );
}
