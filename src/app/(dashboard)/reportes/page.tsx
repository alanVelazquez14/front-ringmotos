"use client";

import { useEffect, useState } from "react";
import { ReportsService } from "@/lib/reports";
import ReportCard from "@/components/reports/ReportCard";
import UserSalesTable from "@/components/reports/UserSalesTable";
import ClientSalesTable from "@/components/reports/ClientSaleTable";
import {
  RangeSalesReport,
  ClientSalesReport,
  UserSalesReport,
} from "@/types/reports";
import { Search, Calendar } from "lucide-react";

export default function ReportsPage() {
  const [from, setFrom] = useState("2025-01-01");
  const [to, setTo] = useState("2025-12-31");
  const [rangeReport, setRangeReport] = useState<RangeSalesReport | null>(null);
  const [byClient, setByClient] = useState<ClientSalesReport[]>([]);
  const [byUser, setByUser] = useState<UserSalesReport[]>([]);

const loadReports = async () => {
  try {
    const [rangeRes, clientsRes, usersRes] = await Promise.all([
      ReportsService.getSalesByRange(from, to),
      ReportsService.getSalesByClient(from, to),
      ReportsService.getSalesByUser(from, to),
    ]);

    setRangeReport(rangeRes.data);

    const fixedClients = clientsRes.data.map((c: any) => ({
      ...c,
      clientName: c.clientName || c.userName || "Cliente Desconocido"
    }));

    setByClient(fixedClients);
    setByUser(usersRes.data);

  } catch (error) {
    console.error("Error cargando reportes", error);
  }
};

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="mx-auto sm:p-6 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-white p-5 rounded-2xl shadow-sm border">
        <h1 className="text-2xl font-black text-black flex items-center gap-2">
          Reportes
        </h1>
      </div>

      <div className="flex flex-wrap items-end gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
            Desde
          </label>
          <div className="relative">
            <Calendar
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl outline-none font-bold transition-all"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
            Hasta
          </label>
          <div className="relative">
            <Calendar
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl outline-none font-bold transition-all"
            />
          </div>
        </div>
        <button
          onClick={loadReports}
          className="bg-black text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
        >
          <Search size={20} /> Buscar
        </button>
      </div>

      {/* Totales en Grid */}
      {rangeReport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ReportCard
            title="Ventas"
            value={rangeReport.totalSales}
            unit=""
            color="text-blue-600"
          />
          <ReportCard
            title="Total"
            value={rangeReport.totalAmount}
            unit="$"
            color="text-gray-900"
          />
          <ReportCard
            title="Pagado"
            value={rangeReport.paidAmount}
            unit="$"
            color="text-emerald-600"
          />
          <ReportCard
            title="Pendiente"
            value={rangeReport.pendingAmount}
            unit="$"
            color="text-red-600"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-xl font-black text-gray-800">
              Ventas por Cliente
            </h2>
          </div>
          <ClientSalesTable data={byClient} />
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-xl font-black text-gray-800">
              Ventas por Vendedor
            </h2>
          </div>
          <UserSalesTable data={byUser} />
        </section>
      </div>
    </div>
  );
}
