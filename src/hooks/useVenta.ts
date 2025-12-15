"use client";

import { useState } from "react";
import { VentaItem } from "@/types/venta";

export function useVenta() {
  const [items, setItems] = useState<VentaItem[]>([]);
  const [pago, setPago] = useState(0);

  const agregarItem = (item: VentaItem) => {
    setItems((prev) => [...prev, item]);
  };

  const eliminarItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const total = items.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  const saldo = total - pago;

  return {
    items,
    pago,
    setPago,
    total,
    saldo,
    agregarItem,
    eliminarItem,
  };
}
