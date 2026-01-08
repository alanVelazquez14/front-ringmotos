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
  saleId?: string;
  sale?: {
    id: string;
  };
}

interface ClientDetail {
  id: string;
  name: string;
  lastName: string;
  dni: string;
  phone: string;
  address: string;
  balance: number;
  totalDebtCache?: string;
}

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [clientRes, historyRes] = await Promise.all([
        api.get(`/clients/${id}`),
        api.get(`/account-entries/history/${id}`),
      ]);
      setClient(clientRes.data);
      setEntries(historyRes.data);
    } catch (error) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [id]);

  if (loading)
    return <p className="p-10 text-center italic">Cargando perfil...</p>;
  if (!client)
    return <p className="p-10 text-center">Cliente no encontrado.</p>;

  const currentSaleId = entries.find(
    (entry) => entry.type === "CHARGE"
  )?.sale?.id;

  const totalBalance = entries.reduce((acc, entry) => {
    const amount = Number(entry.amount);
    return entry.type === "CHARGE" ? acc + amount : acc - amount;
  }, 0);
  const isDeudor = totalBalance > 0;

  return (
    <div className="mx-auto sm:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mt-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium"
        >
          <ArrowLeft size={20} /> Volver a la lista
        </button>
        <DeleteClientModal
          clientId={client.id}
          clientName={`${client.name}`}
          onSuccess={() => router.push("/clientes")}
        />
      </div>

      {/* CLIENT CARD */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6">
        <div className="flex gap-4 items-center">
          <div className="h-20 w-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold uppercase">
            {client.name[0]} {client.lastName[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name} {client.lastName}</h1>
            <p className="text-gray-400 font-mono text-sm uppercase">
              DNI: {client.dni}
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={18} className="text-blue-500" />{" "}
            {client.phone || "---"}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={18} className="text-blue-500" />{" "}
            {client.address || "---"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BALANCE CARD */}
        <div
          className={`p-6 rounded-3xl border flex flex-col justify-between h-fit ${
            isDeudor
              ? "bg-red-50 border-red-100"
              : "bg-green-50 border-green-100"
          }`}
        >
          <div>
            <p
              className={`text-sm font-bold uppercase ${
                isDeudor ? "text-red-400" : "text-green-500"
              }`}
            >
              {isDeudor ? "Saldo Deudor" : "Cuenta al día"}
            </p>
            <h2
              className={`text-4xl font-black mt-2 ${
                isDeudor ? "text-red-600" : "text-green-700"
              }`}
            >
              ${Math.abs(totalBalance).toLocaleString("es-AR")}
            </h2>
          </div>

          {isDeudor && (
            <PaymentClientModal
              clientId={client.id}
              saleId={currentSaleId}
              totalDebt={totalBalance}
              onSuccess={fetchClientData}
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
                : "Sin movimientos pendientes"}
            </p>
          </div>
        </div>

        {/* TABLA DE MOVIMIENTOS */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 font-bold text-lg text-gray-800">
            Historial de Cuenta Corriente
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Detalle</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entries.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(entry.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700">
                      {entry.description ||
                        (entry.type === "CHARGE"
                          ? "Venta Confirmada"
                          : "Pago Recibido")}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-black ${
                        entry.type === "CHARGE"
                          ? "text-red-500"
                          : "text-emerald-500"
                      }`}
                    >
                      {entry.type === "CHARGE" ? "-" : "+"} $
                      {Number(entry.amount).toLocaleString("es-AR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
