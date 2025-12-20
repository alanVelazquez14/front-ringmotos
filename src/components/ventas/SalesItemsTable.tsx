"use client";

import { useState } from "react";
import { useSales } from "@/context/SalesContext";
import { Plus, Trash2, ShoppingBag } from "lucide-react";

export default function SaleItemsTable() {
  const { sale, addItem, removeItem } = useSales();
  const [productId, setProductId] = useState("");
  const [description, setDescription] = useState("");
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);

  if (!sale) return null;

  const currentTotal = qty * unitPrice;

  const handleAdd = async () => {
    if (qty <= 0 || !description || unitPrice <= 0) {
      alert("Por favor, completa descripción, cantidad y precio.");
      return;
    }
    await addItem({
      qty,
      description,
      unitPrice,
    });

    setProductId("");
    setDescription("");
    setQty(1);
    setUnitPrice(0);
  };

  return (
    <>
      <div className="bg-gray-50 md:bg-white rounded-xl md:p-6 shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto mb-6">
          <table className="w-full">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Cant.
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Descripción
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Precio Unit.
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Total
                </th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-blue-50/50">
                <td className="p-2">
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-20 border rounded p-1.5 text-sm"
                  />
                </td>
                <td className="p-2">
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Producto..."
                    className="w-full border rounded p-1.5 text-sm"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-24 border rounded p-1.5 text-sm"
                  />
                </td>
                <td className="p-2 text-sm font-bold text-blue-600">
                  ${(currentTotal || 0).toLocaleString()}
                </td>
                <td className="p-2 text-right">
                  <button
                    onClick={handleAdd}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={20} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FORMULARIO DE ENTRADA - MOBILE */}
        <div className="md:hidden flex flex-col">
          <div className="bg-white border-t border-gray-200 p-4 pb-8 space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
              <h3 className="text-sm font-bold text-center text-black uppercase tracking-wider">
                Agregar Producto
              </h3>

            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del producto..."
              className="w-full border-gray-200 border rounded-xl px-2 py-1 text-base focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 ml-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full border-gray-200 border rounded-xl px-2 py-1 text-base"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 ml-1">
                  Precio Unit.
                </label>
                <input
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="w-full border-gray-200 border rounded-xl px-2 py-1 text-base"
                />
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="w-full bg-blue-600 active:bg-blue-800 text-white py-2 rounded-2xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all"
            >
              <Plus size={24} /> Agregar por ${currentTotal.toLocaleString()}
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden mt-4">
        {sale.items?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30 text-center">
            <ShoppingBag className="text-gray-300 mb-2 opacity-20" size={48} />
            <p className="text-gray-400 text-sm font-medium">
              No hay productos agregados
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
              {sale.items.map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-4 flex justify-between items-center active:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 leading-tight">
                      {item.description}
                    </p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-gray-500 font-medium">
                        Cant: {item.qty}
                      </span>
                      <span className="text-xs text-gray-400">
                        ${Number(item.unitPrice).toLocaleString()} c/u
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <p className="font-bold text-blue-600 text-base">
                      ${(item.qty * item.unitPrice).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeItem(item.id!)}
                      className="bg-red-50 p-2 rounded-xl text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
