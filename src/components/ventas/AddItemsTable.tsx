"use client";

import { useState } from "react";
import { useSales } from "@/context/SalesContext";
import { Trash2 } from "lucide-react";

export default function AddItemsTable() {
  const { sale, addItem, removeItem } = useSales();

  const [description, setDescription] = useState("");
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);

  if (!sale) return null;

  const currentInputTotal = qty * unitPrice;

  const handleAdd = async () => {
    if (qty <= 0 || !description.trim() || unitPrice <= 0) {
      alert("Por favor, completa descripción, cantidad y precio.");
      return;
    }

    await addItem({
      qty,
      description,
      unitPrice,
    });

    setDescription("");
    setQty(1);
    setUnitPrice(0);
  };

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:block overflow-x-auto border rounded-lg shadow-sm bg-white p-6">
        <table className="w-full">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3 text-sm font-semibold text-gray-600">Cant.</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Descripción</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Precio Unit.</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Total</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sale.items
              ?.filter((item) => item.description)
              .map((item, index) => {
                const itemTotal = Number(item.qty) * Number(item.unitPrice);

                return (
                  <tr
                    key={item.id || index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 text-sm">{item.qty}</td>
                    <td className="p-3 text-sm">{item.description}</td>
                    <td className="p-3 text-sm">
                      ${(Number(item.unitPrice) || 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-sm font-bold text-gray-900">
                      ${itemTotal.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => removeItem(item.id!)}
                        className="text-red-400 hover:text-red-600 p-1 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* MOBILE */}
      <div className="md:hidden max-h-[50vh] overflow-y-auto bg-gray-50 rounded-xl shadow-sm">
        {sale.items?.length === 0 ? (
          <p className="text-center text-gray-400">No hay productos agregados</p>
        ) : (
          sale.items.map((item, index) => (
            <div
              key={item.id || index}
              className="bg-white p-4 rounded-xl shadow mb-3 flex justify-between items-center"
            >
              <div>
                <p className="font-bold">{item.description}</p>
                <p className="text-sm text-gray-500">Cant: {item.qty}</p>
                <p className="text-sm text-gray-500">Unit: ${item.unitPrice}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-blue-600">${item.qty * item.unitPrice}</p>
                <button
                  onClick={() => removeItem(item.id!)}
                  className="text-red-400 hover:text-red-600 p-1 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
