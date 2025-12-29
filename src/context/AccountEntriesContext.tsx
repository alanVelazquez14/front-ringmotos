"use client";

import { createContext, useContext, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { AccountEntry } from "@/types/account";

type Summary = {
  charges: number;
  payments: number;
  adjustments: number;
  lastBalance: number;
};

type AccountEntriesContextType = {
  entries: AccountEntry[];
  summary: Summary | null;
  loading: boolean;

  fetchHistory: (
    clientId: string,
    start?: string,
    end?: string
  ) => Promise<void>;

  fetchSummary: (
    clientId: string,
    month: number,
    year: number
  ) => Promise<void>;
};

const AccountEntriesContext = createContext<AccountEntriesContextType | null>(
  null
);

export function AccountEntriesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [entries, setEntries] = useState<AccountEntry[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async (
    clientId: string,
    start?: string,
    end?: string
  ) => {
    try {
      console.log("Fetching history", { clientId, start, end });

      const { data } = await api.get(`/account-entries/history/${clientId}`, {
        params: { start, end },
      });

      setEntries(data);
    } catch (error: any) {
      console.error("History error", error.response?.data);
      toast.error("Error al cargar movimientos");
    }
  };

  const fetchSummary = async (
    clientId: string,
    month: number,
    year: number
  ) => {
    try {
      setLoading(true);

      const { data } = await api.get(`/account-entries/summary/${clientId}`, {
        params: { month, year },
      });

      setSummary(data);
    } catch {
      toast.error("Error al cargar resumen mensual");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountEntriesContext.Provider
      value={{
        entries,
        summary,
        loading,
        fetchHistory,
        fetchSummary,
      }}
    >
      {children}
    </AccountEntriesContext.Provider>
  );
}

export function useAccountEntries() {
  const ctx = useContext(AccountEntriesContext);
  if (!ctx) {
    throw new Error(
      "useAccountEntries debe usarse dentro de AccountEntriesProvider"
    );
  }
  return ctx;
}
