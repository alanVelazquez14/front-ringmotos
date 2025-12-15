"use client";

import { useVenta } from "@/hooks/useVenta";
import ItemsTable from "./components/ItemsTable";

export default function VentasPage() {
  const {
    items,
    agregarItem,
    eliminarItem,
    total,
    pago,
    setPago,
    saldo,
  } = useVenta();

  const addMockItem = () => {
    agregarItem({
      nombre: "Producto prueba",
      precio: 1000,
      cantidad: 1,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nueva Venta</h1>

      <button
        onClick={addMockItem}
        className="bg-slate-900 text-white px-4 py-2 rounded"
      >
        Agregar producto
      </button>

      <ItemsTable items={items} onDelete={eliminarItem} />

      <div className="max-w-sm space-y-2 ml-auto">
        <div className="flex justify-between">
          <span>Total</span>
          <strong>${total}</strong>
        </div>

        <div className="flex justify-between items-center">
          <span>Paga con</span>
          <input
            type="number"
            value={pago}
            onChange={(e) => setPago(Number(e.target.value))}
            className="border p-1 w-32 text-right"
          />
        </div>

        <div className="flex justify-between">
          <span>Saldo</span>
          <strong
            className={saldo > 0 ? "text-red-600" : "text-green-600"}
          >
            ${saldo}
          </strong>
        </div>

        <button className="w-full bg-green-600 text-white py-2 rounded">
          Confirmar venta
        </button>
      </div>
    </div>
  );
}
