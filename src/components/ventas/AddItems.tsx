import { useSales } from "@/context/SalesContext";
import { Trash2 } from "lucide-react";

export default function AddItemsTable() {
  const { sale, removeItem } = useSales();
  if (!sale) return null;
  return (
    <div className="hidden md:block overflow-x-auto border rounded-lg shadow-sm bg-gray-100 p-6">
      <table className="w-full">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3 text-sm font-semibold text-gray-600">Cant.</th>
            <th className="p-3 text-sm font-semibold text-gray-600">
              Descripción
            </th>
            <th className="p-3 text-sm font-semibold text-gray-600">
              Precio Unit.
            </th>
            <th className="p-3 text-sm font-semibold text-gray-600">Total</th>
            <th />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sale.items
            ?.filter((item) => item.description)
            .map((item, index) => (
              <tr
                key={item.id || index}
                className="hover:bg-gray-300 transition-colors"
              >
                <td className="p-3 text-sm">{item.qty}</td>
                <td className="p-3 text-sm">{item.description}</td>
                <td className="p-3 text-sm">
                  ${(Number(item.unitPrice) || 0).toLocaleString()}
                </td>
                <td className="p-3 text-sm font-bold text-gray-900">
                  ${(Number(item.total) || 0).toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => removeItem(item.id!)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
