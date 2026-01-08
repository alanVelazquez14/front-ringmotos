import { ClientSalesReport } from "@/types/reports";

type Props = {
  data: ClientSalesReport[];
};

export default function ClientSalesTable({ data }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-wider font-black">
            <th className="px-6 py-4">Cliente</th>
            <th className="px-6 py-4 text-center">Cant. Compras</th>
            <th className="px-6 py-4 text-right">Total Bruto</th>
            <th className="px-6 py-4 text-right">Pagado</th>
            <th className="px-6 py-4 text-right">Pendiente</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((c, index) => (
            <tr key={`${c.clientId}-${index}`} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 font-bold text-gray-800">{c.clientName}</td>
              <td className="px-6 py-4 text-center font-medium text-gray-500">{c.totalSales}</td>
              <td className="px-6 py-4 text-right font-bold text-gray-900">
                ${Number(c.totalAmount).toLocaleString("es-AR")}
              </td>
              <td className="px-6 py-4 text-right font-bold text-emerald-600">
                ${Number(c.paidAmount).toLocaleString("es-AR")}
              </td>
              <td className="px-6 py-4 text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-black ${
                  Number(c.pendingAmount) > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  ${Number(c.pendingAmount).toLocaleString("es-AR")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}