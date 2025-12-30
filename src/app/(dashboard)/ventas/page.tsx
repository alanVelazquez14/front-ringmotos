"use client";

import { useEffect, useState } from "react";
import { useSales } from "@/context/SalesContext";
import SaleItemsTable from "@/components/ventas/SalesItemsTable";
import PaymentModal from "@/components/ventas/PaymentModal";
import { api } from "@/lib/api";
import {
  CheckCircle,
  Loader2,
  Printer,
  User,
  MapPin,
  Phone,
  PlusCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SalesPage() {
  const { sale, loading, createSale, cancelSale } =
    useSales();

  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [finalConsumer, setFinalConsumer] = useState<any>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  // Carga inicial de clientes
  useEffect(() => {
    const loadClients = async () => {
      try {
        const [clientsRes, finalRes] = await Promise.all([
          api.get("/clients"),
          api.get("/clients/final-consumer"),
        ]);
        setAvailableClients(clientsRes.data || []);
        setFinalConsumer(finalRes.data);

        if (finalRes.data && !sale) {
          setSelectedClientId(finalRes.data.id);
        }
      } catch (error) {
        toast.error("Error cargando clientes");
      }
    };
    loadClients();
  }, [sale]);

  useEffect(() => {
    if (sale?.clientId) {
      setSelectedClientId(sale.clientId);
    }
  }, [sale]);

  const handleStartSale = async () => {
    if (!selectedClientId) {
      toast.error("Selecciona un cliente para iniciar");
      return;
    }
    await createSale(selectedClientId);
    toast.success("Venta iniciada");
  };

  const handleCancel = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-semibold text-gray-800">
            ¿Cancelar la venta actual?
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await cancelSale();
              }}
              className="flex-1 bg-red-600 text-white py-2 rounded-xl font-bold"
            >
              Sí, cancelar
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl font-bold"
            >
              No
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  // --- LÓGICA DE ESTADOS ---
  const isVentaActiva = !!sale?.id;
  const isClosed = sale?.status === "CONFIRMED" || sale?.status === "CANCELLED";

  const calculatedTotal = (sale?.items || []).reduce(
    (acc: number, item: any) => acc + Number(item.qty) * Number(item.unitPrice),
    0
  );

  const clientId = sale?.clientId ?? selectedClientId;

  const selectedClientData = availableClients.find((c) => c.id === clientId);

  const isFinalConsumer = clientId === finalConsumer?.id;

  if (!isVentaActiva && !loading) {
    return (
      <div className="max-w-2xl mt-20 p-8 bg-white rounded-3xl border shadow-xl">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="text-blue-600" size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900">Nueva Venta</h1>
          <p className="text-gray-500">
            Selecciona el cliente para comenzar a cargar productos
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs font-black uppercase text-gray-400 ml-1">
              Cliente / Razón Social
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full mt-2 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-lg transition-all text-black"
            >
              {finalConsumer && (
                <option value={finalConsumer.id}>
                  {finalConsumer.name} (Consumidor Final)
                </option>
              )}
              {availableClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.lastName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleStartSale}
            className="w-full py-5 bg-black text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-lg active:scale-95"
          >
            <PlusCircle /> Iniciar Venta
          </button>
        </div>
      </div>
    );
  }

  if (loading || !sale)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );

  return (
    <div className="mt-5 p-4 sm:p-6 space-y-6">
      {/* Estilos de Impresión (Igual que los tuyos) */}
      <style jsx global>{` @media print { ... } `}</style>

      <div className="print:hidden space-y-6">
        {/* Header con acciones */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-white p-5 rounded-2xl shadow-sm border">
          <div>
            <h1 className="text-2xl font-black text-black">
              {isClosed ? "Venta Finalizada" : "Venta en Curso"}
            </h1>
            <p className="text-xs font-mono text-gray-400">ID: {sale.id}</p>
          </div>
          <div className="flex gap-3">
            <button
              className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold transition-all"
              onClick={handleCancel}
              disabled={isClosed}
            >
              Cancelar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-5 rounded-2xl border flex items-center justify-between">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block">
                  Cliente Vinculado
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <User size={16} />
                  </div>
                  <span className="font-bold text-lg text-black">
                    {isFinalConsumer
                      ? "Consumidor Final"
                      : `${selectedClientData?.name} ${
                          selectedClientData?.lastName ?? ""
                        }`}
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-black uppercase">
                Venta Iniciada
              </span>
            </div>

            <SaleItemsTable />
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase mb-1">
                Total a Cobrar
              </p>
              <h2 className="text-4xl font-black text-black">
                ${calculatedTotal.toLocaleString("es-AR")}
              </h2>
            </div>

            {!isClosed && sale.items?.length > 0 && (
              <PaymentModal
                finalConsumerId={finalConsumer?.id}
                clientId={sale?.clientId ?? selectedClientId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
