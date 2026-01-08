import { UserSalesReport } from "@/types/reports";

type Props = {
  data: UserSalesReport[];
};

export default function UserSalesTable({ data }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-wider font-black">
            {/* Cambiamos la etiqueta para evitar confusiones */}
            <th className="px-6 py-4">Vendedor (Usuario)</th>
            <th className="px-6 py-4 text-center">Cant. Ventas</th>
            <th className="px-6 py-4 text-right">Total Generado</th>
            <th className="px-6 py-4 text-right">Cobrado</th>
            <th className="px-6 py-4 text-right">Pendiente</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((u) => (
            <tr key={u.userId} className="hover:bg-slate-50/50 transition-colors">
              {/* Aquí usamos userName del vendedor */}
              <td className="px-6 py-4 font-bold text-blue-600 italic">
                {u.userName}
              </td>
              <td className="px-6 py-4 text-center font-medium text-gray-500">
                {u.totalSales}
              </td>
              <td className="px-6 py-4 text-right font-bold text-gray-900">
                ${Number(u.totalAmount).toLocaleString("es-AR")}
              </td>
              <td className="px-6 py-4 text-right font-bold text-emerald-600">
                ${Number(u.paidAmount).toLocaleString("es-AR")}
              </td>
              <td className="px-6 py-4 text-right font-bold text-gray-400">
                ${Number(u.pendingAmount).toLocaleString("es-AR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}