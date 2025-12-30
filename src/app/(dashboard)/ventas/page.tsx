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
  const { sale, loading, createSale, cancelSale } = useSales();

  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [finalConsumer, setFinalConsumer] = useState<any>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [isConfirming, setIsConfirming] = useState(false);

  const currentBalance =
    sale?.payments?.reduce(
      (acc: number, p: any) => acc - Number(p.amount),
      sale?.total || 0
    ) || 0;

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

  const handleFinalizeSale = () => {
    if (!sale?.id) return;
    const isFinalConsumer = sale.clientId === finalConsumer?.id;
    if (isFinalConsumer && currentBalance > 0) {
      toast.error(
        "El consumidor final debe abonar el total para imprimir remito"
      );
      return;
    }
    window.print();
  };

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
      <div className="max-w-2xl mt-20 p-8 bg-white rounded-3xl border shadow-xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="text-blue-600" size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900">Nueva Venta</h1>
          <p className="text-gray-500">Selecciona el cliente para comenzar</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs font-black uppercase text-gray-400 ml-1">
              Cliente
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full mt-2 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-lg text-black"
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
            className="w-full py-5 bg-black text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-gray-800 transition-all active:scale-95"
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
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: A4;
          }

          /* Ocultamos todo lo que no es el remito */
          body * {
            visibility: hidden !important;
          }
          #printable-invoice,
          #printable-invoice * {
            visibility: visible !important;
          }

          /* Eliminamos Toasts y UI */
          .print\:hidden,
          div[role="status"],
          .toaster,
          #react-hot-toast {
            display: none !important;
          }

          html,
          body {
            height: 100% !important;
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }

          #printable-invoice {
            /* CLAVE: Convertimos el remito en un contenedor flexible de alto total */
            display: flex !important;
            flex-direction: column !important;
            min-height: 95vh !important;
            max-height: 98vh !important;
            width: 100% !important;
            padding: 40px !important;
            box-sizing: border-box !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
          }

          .print-footer {
            /* CLAVE: El margin-top: auto empuja este div al fondo del contenedor flex */
            margin-top: auto !important;
            padding-top: 20px !important;
            padding-bottom: 5px !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* INTERFAZ DE USUARIO (OCULTA EN IMPRESIÓN) */}
      <div className="print:hidden space-y-6">
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
            {!isClosed ? (
              <button
                onClick={handleFinalizeSale}
                disabled={!sale.items?.length || isConfirming}
                className="px-8 py-3 bg-black text-white rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                {isConfirming ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <CheckCircle />
                )}
                Confirmar y Facturar
              </button>
            ) : (
              <button
                onClick={() => window.print()}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2"
              >
                <Printer /> Imprimir Remito
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-5 rounded-2xl border flex items-center justify-between">
              <div className="flex items-center gap-2">
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
              <span className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-black uppercase">
                Activa
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

      {/* REMITO PARA IMPRESIÓN */}
      <div
        id="printable-invoice"
        className="hidden print:block bg-white text-black font-sans"
      >
        <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-8">
          <div>
            <h2 className="text-5xl font-black tracking-tighter mb-2">
              RING MOTOS
            </h2>
            <div className="text-[10px] uppercase font-bold text-gray-500 space-y-1">
              <p className="flex items-center gap-2">
                <MapPin size={12} /> Calle Ejemplo 123, Ciudad
              </p>
              <p className="flex items-center gap-2">
                <Phone size={12} /> +54 9 11 0000-0000
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="border-4 border-black px-6 py-2 mb-2 inline-block font-black text-4xl">
              R
            </div>
            <p className="font-black text-xl uppercase">Remito de Venta</p>
            <p className="font-mono text-sm">
              N°: {sale.id.toUpperCase().substring(0, 12)}
            </p>
            <p className="font-bold">
              Fecha: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10 border-2 border-black p-6 rounded-xl bg-gray-50">
          <div>
            <p className="text-[10px] uppercase font-black text-gray-400 mb-1">
              Cliente / Razón Social
            </p>
            <p className="font-bold text-2xl uppercase">
              {selectedClientData
                ? `${selectedClientData.name} ${
                    selectedClientData.lastName || ""
                  }`
                : "Consumidor Final"}
            </p>
            <p className="text-sm">
              DNI/CUIT: {selectedClientData?.dni || "---"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-black text-gray-400 mb-1">
              Condición de Venta
            </p>
            <p className="font-black text-xl">
              {currentBalance <= 0 ? "CONTADO / PAGADO" : "CUENTA CORRIENTE"}
            </p>
          </div>
        </div>

        <table className="w-full mb-10 border-collapse">
          <thead>
            <tr className="bg-black text-white uppercase text-[10px] tracking-widest">
              <th className="p-4 text-center w-24">Cant.</th>
              <th className="p-4 text-left">Descripción del Producto</th>
              <th className="p-4 text-right w-32">Precio Unit.</th>
              <th className="p-4 text-right w-40">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 border-b-2 border-black">
            {sale.items?.map((item: any, i: number) => (
              <tr key={i} className="text-sm">
                <td className="p-4 text-center">{item.qty}</td>
                <td className="p-4 font-bold uppercase">{item.description}</td>
                <td className="p-4 text-right">
                  ${Number(item.unitPrice).toLocaleString()}
                </td>
                <td className="p-4 text-right font-black text-lg">
                  ${(item.qty * item.unitPrice).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-end">
          <div className="w-1/2 p-6 border-2 border-dashed border-gray-300 rounded-2xl">
            <p className="text-xs font-black uppercase mb-16 text-gray-400">
              Recibí conforme:
            </p>
            <div className="border-t-2 border-black w-full pt-2 flex justify-between text-[10px] font-bold">
              <span>FIRMA Y ACLARACIÓN</span>
              <span>DNI N°</span>
            </div>
          </div>
          <div className="w-1/3 space-y-3">
            <div className="flex justify-between text-gray-500 font-bold px-4 uppercase text-xs">
              <span>Subtotal Neto</span>
              <span>${calculatedTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between bg-black text-white p-5 rounded-2xl font-black text-xl">
              <span>TOTAL</span>
              <span>${calculatedTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="print-footer">
          <div className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest border-t pt-4">
            Documento no válido como factura legal - Comprobante de entrega
            interna
          </div>
        </div>
      </div>
    </div>
  );
}
