"use client";

import { createContext, useContext, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { getUserIdFromToken } from "@/helpers/auth";

export type SaleStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

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

  createSale: (clientId: string) => Promise<void>;
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
};

const SalesContext = createContext<SalesContextType | null>(null);

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);

  //Crear nueva venta
  const createSale = async (clientId: string) => {
    // Ahora acepta un clientId
    try {
      setLoading(true);

      const res = await api.post("/sales", {
        clientId: clientId,
      });
      console.log(
        "DEBUG: Respuesta de GET /sales (Generación de ID):",
        res.data
      );

      setSale(res.data);
    } catch (error) {
      console.error("Error al crear venta:", error);
      toast.error("Error al iniciar la venta en el servidor");
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

    const originalSale = sale;

    setSale((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.filter((i) => i.id !== itemId),
      };
    });

    try {
      await api.delete(`/sales/items/${itemId}`);
    } catch {
      setSale(originalSale);
      toast.error("Error al eliminar item");
      return;
    }

    try {
      const res = await api.get(`/sales/${sale.id}`);
      setSale(res.data);
    } catch {
      console.warn("No se pudo refrescar la venta");
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
    if (!sale?.id) return;

    const userId = getUserIdFromToken();

    if (!sale?.id) {
      console.warn(
        "DEBUG: No se inició el pago porque sale.id es null o undefined"
      );
      toast.error("Error: No hay una venta activa seleccionada");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post(`/pos/sales/${sale.id}/action`, {
        action: "PAYMENT",
        amount,
        paymentMethod: method,
        receivedBy: userId,
      });

      setSale(res.data);
      toast.success("Pago registrado correctamente");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error al registrar el pago"
      );
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
    if (!sale?.id) return;

    try {
      setSale(null);
      toast.success("Venta cancelada");
    } catch (error) {
      console.error("Error:", error);
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

      const resRemito = await api.post(`/remitos`, { saleId: sale.id });

      const resSale = await api.get(`/sales/${sale.id}`);
      setSale(resSale.data);

      toast.success("Venta finalizada y remito generado");
    } catch (error) {
      toast.error("Error al finalizar la venta");
    } finally {
      setLoading(false);
    }
  };

  // const updateSaleClient = async (saleId: string, clientId: string) => {
  //   if (!saleId) {
  //     toast.error("No hay un ID de venta válido");
  //     return;
  //   }

  //   try {
  //     const { data } = await api.patch(`/sales/${saleId}`, { clientId });

  //     setSale(data);
  //     toast.success("Cliente actualizado");
  //   } catch (error) {
  //     toast.error("Error al actualizar el cliente");
  //     throw error;
  //   }
  // };

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
