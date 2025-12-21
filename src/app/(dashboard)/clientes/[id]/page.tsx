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

interface ClientDetail {
  id: string;
  name: string;
  lastName: string;
  dni: string;
  phone: string;
  adress: string;
  balance: number;
  sales?: any[];
}

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const { data } = await api.get(`/clients/${id}`);
        setClient(data);
      } catch (error) {
        toast.error("Error al cargar detalle");
      } finally {
        setLoading(false);
      }
    };
    fetchClientData();
  }, [id]);

  if (loading) return <p className="p-10 text-center">Cargando perfil...</p>;
  if (!client)
    return <p className="p-10 text-center">Cliente no encontrado.</p>;

  const hasDebt = (client.balance || 0) > 0;

  return (
    <div className="mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} /> Volver a la lista
        </button>

        {/* COMPONENTE DE ELIMINAR */}
        <DeleteClientModal
          clientId={client.id}
          clientName={`${client.name} ${client.lastName}`}
          onSuccess={() => router.push("/clientes")}
        />
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`col-span-1 p-6 rounded-3xl border flex flex-col justify-between ${
            hasDebt
              ? "bg-red-50 border-red-100"
              : "bg-green-50 border-green-100"
          }`}
        >
          <div>
            <p
              className={`text-sm font-bold uppercase tracking-wider ${
                hasDebt ? "text-red-400" : "text-green-500"
              }`}
            >
              Estado de Cuenta
            </p>
            <h2
              className={`text-4xl font-black mt-2 ${
                hasDebt ? "text-red-600" : "text-green-700"
              }`}
            >
              ${(client.balance || 0).toLocaleString()}
            </h2>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {hasDebt ? (
              <AlertCircle className="text-red-500" size={20} />
            ) : (
              <CreditCard className="text-green-500" size={20} />
            )}
            <p
              className={`text-sm font-medium ${
                hasDebt ? "text-red-600" : "text-green-700"
              }`}
            >
              {hasDebt ? "Saldo pendiente de pago" : "Cuenta al día"}
            </p>
          </div>
        </div>

        {/* HISTORIAL DE VENTAS (Resumen) */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Últimos Movimientos
          </h3>
          <div className="space-y-3">
            {/* Aquí puedes mapear las ventas reales del cliente si tu API las trae */}
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="font-bold text-sm text-gray-700">Venta #1234</p>
                <p className="text-xs text-gray-400">20/12/2025</p>
              </div>
              <p className="font-bold text-blue-600">$45.000</p>
            </div>
            <p className="text-center text-gray-400 text-sm mt-4 italic">
              El historial detallado se está cargando...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
