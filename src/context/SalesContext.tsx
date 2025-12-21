"use client";

import { createContext, useContext, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export type SaleStatus = "OPEN" | "PAID" | "CANCELLED";

export type SaleItem = {
  id?: string;
  productId?: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
};

export type AddSaleItemPayload = {
  productId?: string | null;
  qty: number;
  unitPrice: number;
  description: string;
};

export type PaymentMethod = "CASH" | "TRANSFER" | "CARD";

export type Payment = {
  id: string;
  amount: number;
  method: PaymentMethod;
  createdAt: string;
};

export type Sale = {
  id: string;
  status: SaleStatus;
  clientId: string | null;
  items: SaleItem[];
  payments: Payment[];
  subtotal: number;
  total: number;
  balance: number;
};

type SalesContextType = {
  sale: Sale | null;
  loading: boolean;

  createSale: () => Promise<void>;
  addItem: (item: {
    qty: number;
    unitPrice: number;
    description: string;
  }) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  setClient: (clientId: string | null) => Promise<void>;
  registerPayment: (amount: number, method: PaymentMethod) => Promise<void>;
  resetSale: () => void;
  cancelSale: () => Promise<void>;
  confirmSale: () => Promise<void>;
  createRemito: () => Promise<void>;
  markRemitoAsPrinted: (remitoId: string) => Promise<void>;
  finalizeAndRemit: () => Promise<void>;
  updateSaleClient: (saleId: string, clientId: string) => Promise<void>;
};

const SalesContext = createContext<SalesContextType | null>(null);

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);

  //Crear nueva venta
  const createSale = async () => {
    try {
      setLoading(true);

      const res = await api.post("/sales", {
        clientId: null,
      });

      setSale(res.data);
    } finally {
      setLoading(false);
    }
  };

  //Agregar producto a la venta
  const addItem = async ({
    qty,
    unitPrice,
    description,
  }: AddSaleItemPayload) => {
    if (!sale) return;
    try {
      setLoading(true);
      const res = await api.post(`/sales/${sale.id}/items`, {
        qty,
        unitPrice,
        description,
      });

      const newItem = res.data;

      setSale((prev) => {
        if (!prev) return prev;
        const currentTotal = Number(prev.total) || 0;
        const itemTotal = Number(newItem.total) || 0;
        const currentBalance = Number(prev.balance) || 0;

        return {
          ...prev,
          items: [...(prev.items ?? []), newItem],
          total: currentTotal + itemTotal,
          balance: currentBalance + itemTotal,
        };
      });
    } catch (error) {
      toast.error("Error al agregar item");
    } finally {
      setLoading(false);
    }
  };

  //Eliminar producto de la venta
  const removeItem = async (itemId: string) => {
    if (!sale || !itemId) return;

    const originalSale = { ...sale };
    setSale((prev) => {
      if (!prev) return null;
      const newItems = prev.items.filter((i) => i.id !== itemId);
      return { ...prev, items: newItems };
    });

    try {
      await api.delete(`/sales/items/${itemId}`);
      const res = await api.get(`/sales/${sale.id}`);
      setSale(res.data);
    } catch (error) {
      toast.error("Error en el back, pero ya lo quitamos de la vista:");
    }
  };

  //Asignar cliente a la venta
  const setClient = async (clientId: string | null) => {
    if (!sale) return;

    try {
      setLoading(true);

      const res = await api.patch(`/sales/${sale.id}`, {
        clientId,
      });

      setSale(res.data);
    } finally {
      setLoading(false);
    }
  };

  //Registrar pago de la venta
  const registerPayment = async (amount: number, method: PaymentMethod) => {
    if (!sale) return;
    try {
      setLoading(true);
      const res = await api.post(`/payments`, {
        saleId: sale.id,
        amount,
        method,
      });
      setSale(res.data);
    } finally {
      setLoading(false);
    }
  };

  //Crear remito
  const createRemito = async () => {
    if (!sale) return;
    try {
      setLoading(true);
      await api.post(`/remitos`, {
        saleId: sale.id,
      });
    } finally {
      setLoading(false);
    }
  };

  //Marcar remito como impreso
  const markRemitoAsPrinted = async (remitoId: string) => {
    try {
      setLoading(true);
      await api.post(`/remitos/${remitoId}/printed`);
    } finally {
      setLoading(false);
    }
  };

  //Resetear venta
  const resetSale = () => {
    setSale(null);
  };

  const cancelSale = async () => {
    if (!sale) return;
    try {
      setLoading(true);
      const res = await api.patch(`/sales/${sale.id}/cancel`);
      setSale(null);
    } catch (error) {
      toast.error("Error al cancelar la venta");
      setSale(null);
    } finally {
      setLoading(false);
    }
  };

  const confirmSale = async () => {
    if (!sale) return;
    try {
      setLoading(true);
      const res = await api.patch(`/sales/${sale.id}/confirm`);
      setSale(res.data);
    } finally {
      setLoading(false);
    }
  };

  const finalizeAndRemit = async () => {
    if (!sale) return;
    try {
      setLoading(true);
      await api.patch(`/sales/${sale.id}/confirm`);

      // 2. Creamos el remito automáticamente
      const resRemito = await api.post(`/remitos`, { saleId: sale.id });

      // 3. Actualizamos la venta local para obtener los datos nuevos
      const resSale = await api.get(`/sales/${sale.id}`);
      setSale(resSale.data);

      toast.success("Venta finalizada y remito generado");
    } catch (error) {
      toast.error("Error al finalizar la venta");
    } finally {
      setLoading(false);
    }
  };

const updateSaleClient = async (saleId: string, clientId: string) => {
  if (!saleId) {
    toast.error("No hay un ID de venta válido");
    return;
  }

  try {
    const { data } = await api.patch(`/sales/${saleId}`, { clientId });

    setSale(data);
  } catch (error) {
    toast.error("Error al actualizar el cliente de la venta");
    throw error;
  }
};

  return (
    <SalesContext.Provider
      value={{
        sale,
        loading,
        createSale,
        addItem,
        removeItem,
        setClient,
        registerPayment,
        resetSale,
        cancelSale,
        confirmSale,
        createRemito,
        markRemitoAsPrinted,
        finalizeAndRemit,
        updateSaleClient,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const ctx = useContext(SalesContext);
  if (!ctx) {
    throw new Error("useSales must be used within SalesProvider");
  }
  return ctx;
}
