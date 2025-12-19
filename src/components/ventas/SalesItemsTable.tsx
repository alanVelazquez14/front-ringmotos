"use client";

import { useState } from "react";
import { useSales } from "@/context/SalesContext";

export default function SaleItemsTable() {
  const { sale, addItem, removeItem } = useSales();

  // Estados para los campos manuales
  const [productId, setProductId] = useState("");
  const [description, setDescription] = useState("");
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);

  if (!sale) return null;

  const currentTotal = qty * unitPrice;

  const handleAdd = async () => {
    if ( qty <= 0 || !description || unitPrice <= 0) {
      alert("Por favor, completa todos los campos con valores válidos.");
      return;
    }

    // Enviamos el objeto tal cual lo pide la API en la imagen
    await addItem({
      description,
      qty,
      unitPrice,
    });

    // Limpiar campos después de agregar
    setProductId("");
    setDescription("");
    setQty(1);
    setUnitPrice(0);
  };

  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2 text-sm">Cantidad</th>
            <th className="p-2 text-sm">Descripción</th>
            <th className="p-2 text-sm">Precio Unit.</th>
            <th className="p-2 text-sm">Total</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {/* Mapeo de ítems existentes */}
          {sale.items?.map((item) => (
            <tr className="border-t">
              <td className="p-2 text-sm">{item.qty}</td>
              <td className="p-2 text-sm">{item.description}</td>
              <td className="p-2 text-sm">${item.unitPrice}</td>
              <td className="p-2 text-sm font-semibold">
                ${item.qty * item.unitPrice}
              </td>
              <td className="p-2 text-right">
                <button
                //   onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:bg-red-50 p-1 rounded"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}

          {/* FILA DE ENTRADA MANUAL */}
          <tr className="border-t bg-blue-50">
            <td className="p-2">
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-20 border rounded px-2 py-1 text-sm"
              />
            </td>
            <td className="p-2">
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nombre del producto"
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </td>
            <td className="p-2">
              <input
                type="number"
                min={0}
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                placeholder="0.00"
                className="w-24 border rounded px-2 py-1 text-sm"
              />
            </td>
            <td className="p-2 text-sm font-bold text-blue-700">
              ${currentTotal.toFixed(2)}
            </td>
            <td className="p-2 text-right">
              <button
                onClick={handleAdd}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 font-bold"
              >
                +
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
