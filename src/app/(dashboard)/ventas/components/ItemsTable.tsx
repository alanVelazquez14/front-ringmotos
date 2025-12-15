"use client";

import { Trash2 } from "lucide-react";
import { VentaItem } from "@/types/venta";

interface Props {
  items: VentaItem[];
  onDelete: (id: string) => void;
}

export default function ItemsTable({ items, onDelete }: Props) {
  return (
    <table className="w-full text-sm border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 text-left">Producto</th>
          <th className="p-2">Cantidad</th>
          <th className="p-2">Precio</th>
          <th className="p-2">Total</th>
          <th className="p-2"></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="border-t">
            <td className="p-2">{item.nombre}</td>
            <td className="p-2 text-center">{item.cantidad}</td>
            <td className="p-2 text-right">${item.precio}</td>
            <td className="p-2 text-right">
              ${item.precio * item.cantidad}
            </td>
            <td className="p-2 text-center">
              <button onClick={() => onDelete(item.id as string)}>
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
