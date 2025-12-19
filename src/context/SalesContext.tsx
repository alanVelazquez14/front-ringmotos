"use client";

import { createContext, useContext, useState } from "react";
import { api } from "@/lib/api";
import axios from "axios";

export type SaleStatus = "OPEN" | "PAID" | "CANCELLED";

export type SaleItem = {
  productId: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
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
  // Agregar producto a la venta usando la instancia 'api'
  const addItem = async ({
    qty,
    unitPrice,
    description,
  }: {
    qty: number;
    unitPrice: number;
    description: string;
  }) => {
    if (!sale) return;

    try {
      setLoading(true);

      const response = await api.post(`/sales/${sale.id}/items`, {
        qty,
        unitPrice,
        description,
      });

      // Axios guarda la respuesta del servidor en .data
      setSale(response.data);
    } catch (error) {
      console.error("Error al agregar item:", error);
      // Agregamos un log para ver qué responde el servidor de Render en caso de error
      if (axios.isAxiosError(error)) {
        console.error("Detalle del error:", error.response?.data);
      }
    } finally {
      setLoading(false);
    }
  };

  //Eliminar producto de la venta
  const removeItem = async (itemId: string) => {
    if (!sale) return;

    try {
      setLoading(true);

      const res = await api.delete(`/sales/items/${itemId}`);

      setSale(res.data);
    } finally {
      setLoading(false);
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
      // La imagen sugiere /payments, no /sales/{id}/payments
      const res = await api.post(`/payments`, {
        saleId: sale.id, // Probablemente se pase por body
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
      // Aquí podrías actualizar la venta si el remito cambia su estado
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
      console.error("Error al cancelar:", error);
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
      // 1. Confirmamos la venta (cambia estado a PAID/CLOSED)
      await api.patch(`/sales/${sale.id}/confirm`);

      // 2. Creamos el remito automáticamente
      const resRemito = await api.post(`/remitos`, { saleId: sale.id });

      // 3. Actualizamos la venta local para obtener los datos nuevos
      const resSale = await api.get(`/sales/${sale.id}`);
      setSale(resSale.data);

      alert("Venta finalizada y remito generado");
    } catch (error) {
      console.error("Error al finalizar:", error);
    } finally {
      setLoading(false);
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
