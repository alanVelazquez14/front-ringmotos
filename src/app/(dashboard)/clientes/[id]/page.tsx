"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Phone,
  MapPin,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import DeleteClientModal from "@/components/clientes/DeleteClientModal";
import PaymentClientModal from "@/components/clientes/PaymentClientModal";

interface AccountEntry {
  id: string;
  type: "CHARGE" | "PAYMENT";
  amount: number;
  description: string;
  createdAt: string;
  balanceAfter: number;
}

interface ClientDetail {
  id: string;
  name: string;
  lastName: string;
  dni: string;
  phone: string;
  adress: string;
  balance: number;
}

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [entries, setEntries] = useState<AccountEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        // Traemos datos del cliente y su historial en paralelo
        const [clientRes, historyRes] = await Promise.all([
          api.get(`/clients/${id}`),
          api.get(`/account-entries/history/${id}`),
        ]);

        setClient(clientRes.data);
        setEntries(historyRes.data);
      } catch (error) {
        toast.error("Error al cargar datos del cliente");
      } finally {
        setLoading(false);
      }
    };
    fetchClientData();
  }, [id]);

  if (loading)
    return (
      <p className="p-10 text-center text-slate-500 italic">
        Cargando perfil...
      </p>
    );
  if (!client)
    return <p className="p-10 text-center">Cliente no encontrado.</p>;

  const balance =
    entries.length > 0 ? entries[entries.length - 1].balanceAfter : 0;

const isDeudor = balance < 0;
const isAcreedor = balance > 0;

  const refreshData = async () => {
    setLoading(true);
    try {
      const [clientRes, historyRes] = await Promise.all([
        api.get(`/clients/${id}`),
        api.get(`/account-entries/history/${id}`),
      ]);
      setClient(clientRes.data);
      setEntries(historyRes.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto sm:p-6 space-y-6">
      {/* HEADER ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Volver a la lista
        </button>

        <DeleteClientModal
          clientId={client.id}
          clientName={`${client.name} ${client.lastName}`}
          onSuccess={() => router.push("/clientes")}
        />
      </div>

      {/* CLIENT CARD */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6">
        <div className="flex gap-4 items-center">
          <div className="h-20 w-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
            {client.name[0]}
            {client.lastName[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {client.name} {client.lastName}
            </h1>
            <p className="text-gray-400 font-mono tracking-widest uppercase text-sm">
              DNI: {client.dni}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={18} className="text-blue-500" />{" "}
            {client.phone || "Sin teléfono"}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={18} className="text-blue-500" />{" "}
            {client.adress || "Sin dirección"}
          </div>
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BALANCE CARD */}
        <div
          className={`p-6 rounded-3xl border flex flex-col justify-between h-fit ${
            isDeudor
              ? "bg-red-50 border-red-100"
              : isAcreedor
              ? "bg-blue-50 border-blue-100"
              : "bg-green-50 border-green-100"
          }`}
        >
          <div>
            <p
              className={`text-sm font-bold uppercase tracking-wider ${
                isDeudor
                  ? "text-red-400"
                  : isAcreedor
                  ? "text-blue-400"
                  : "text-green-500"
              }`}
            >
              {isDeudor
                ? "Saldo Deudor"
                : isAcreedor
                ? "Saldo a Favor"
                : "Cuenta al día"}
            </p>
            <h2
              className={`text-4xl font-black mt-2 ${
                isDeudor
                  ? "text-red-600"
                  : isAcreedor
                  ? "text-blue-700"
                  : "text-green-700"
              }`}
            >
              ${Math.abs(balance).toLocaleString("es-AR")}
            </h2>
          </div>

          {isDeudor && (
            <PaymentClientModal
              clientId={client.id}
              totalDebt={balance}
              onSuccess={refreshData}
            />
          )}

          <div className="mt-6 flex items-center gap-2">
            {isDeudor ? (
              <AlertCircle className="text-red-500" size={20} />
            ) : (
              <CreditCard className="text-green-500" size={20} />
            )}
            <p
              className={`text-sm font-semibold ${
                isDeudor ? "text-red-600" : "text-green-700"
              }`}
            >
              {isDeudor
                ? "El cliente debe dinero"
                : isAcreedor
                ? "El cliente tiene dinero extra"
                : "Sin movimientos pendientes"}
            </p>
          </div>
        </div>

        {/* MOVIMIENTOS DE CUENTA CORRIENTE */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="text-lg font-bold text-gray-800">
              Historial de Cuenta Corriente
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="px-6 py-4 hidden md:table-cell">Fecha</th>
                  <th className="px-6 py-4">Detalle</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-gray-400 italic text-sm"
                    >
                      No hay movimientos registrados para este cliente.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Fecha Desktop */}
                      <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                        {new Date(entry.createdAt).toLocaleDateString("es-AR")}
                      </td>

                      {/* Detalle (con fecha en mobile) */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-700">
                            {entry.description ||
                              (entry.type === "CHARGE"
                                ? "Venta a Crédito"
                                : "Entrega de Efectivo")}
                          </span>
                          <span className="text-[11px] text-gray-400 md:hidden mt-0.5">
                            {new Date(entry.createdAt).toLocaleDateString(
                              "es-AR"
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Monto */}
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`text-sm font-black ${
                            entry.type === "CHARGE"
                              ? "text-red-500"
                              : "text-emerald-500"
                          }`}
                        >
                          {entry.type === "CHARGE" ? "-" : "+"} $
                          {entry.amount.toLocaleString("es-AR")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
