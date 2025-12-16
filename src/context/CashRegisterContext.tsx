"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type CashRegister = {
  id: string;
  name?: string;
  status: "OPEN" | "CLOSED";
  openingAmount: number;
};

type ContextType = {
  cashRegister: CashRegister | null;
  setCashRegister: (c: CashRegister | null) => void;
};

const CashRegisterContext = createContext<ContextType | null>(null);

export function CashRegisterProvider({ children }: { children: React.ReactNode }) {
  const [cashRegister, setCashRegisterState] = useState<CashRegister | null>(null);

  // Al montar, cargamos la caja del localStorage si existe
  useEffect(() => {
    const saved = localStorage.getItem("cashRegister");
    if (saved) {
      setCashRegisterState(JSON.parse(saved));
    }
  }, []);

  const setCashRegister = (c: CashRegister | null) => {
    setCashRegisterState(c);
    if (c) {
      localStorage.setItem("cashRegister", JSON.stringify(c));
    } else {
      localStorage.removeItem("cashRegister");
    }
  };

  return (
    <CashRegisterContext.Provider value={{ cashRegister, setCashRegister }}>
      {children}
    </CashRegisterContext.Provider>
  );
}

export function useCashRegister() {
  const ctx = useContext(CashRegisterContext);
  if (!ctx) throw new Error("useCashRegister must be used within CashRegisterProvider");
  return ctx;
}
