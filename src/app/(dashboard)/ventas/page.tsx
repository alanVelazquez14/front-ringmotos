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
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SalesPage() {
  const {
    sale,
    loading,
    createSale,
    finalizeAndRemit,
    cancelSale,
    markRemitoAsPrinted,
    updateSaleClient,
  } = useSales();

  const [isVentaIniciada, setIsVentaIniciada] = useState(false);
  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [finalConsumer, setFinalConsumer] = useState<any>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const [clientsRes, finalRes] = await Promise.all([
          api.get("/clients"),
          api.get("/clients/final-consumer"),
        ]);
        setAvailableClients(clientsRes.data || []);
        setFinalConsumer(finalRes.data);
      } catch (error) {
        toast.error("Error cargando clientes para venta");
      }
    };
    loadClients();
  }, []);

  useEffect(() => {
    if (sale) setIsVentaIniciada(true);
  }, [sale]);

  const handleClientChange = async (clientId: string) => {
    try {
      if (sale?.id) {
        await updateSaleClient(sale.id, clientId);
        toast.success("Cliente actualizado");
      }
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("No se pudo vincular el cliente a esta venta");
    }
  };

  const handleStartSale = () => {
    setIsVentaIniciada(true);
    if (!sale) createSale();
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
                setIsVentaIniciada(false);
                toast.success("Venta cancelada");
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

  const handlePrint = async () => {
    window.print();
    if (sale?.id) await markRemitoAsPrinted(sale.id);
  };

  const handleFinalizeSale = async () => {
    if (!sale?.id) return;
    try {
      setIsConfirming(true);
      const loadToast = toast.loading("Confirmando venta...");
      await finalizeAndRemit(); //
      toast.success("Venta confirmada", { id: loadToast });

      setTimeout(() => {
        window.print();
        markRemitoAsPrinted(sale.id);
      }, 800);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al confirmar");
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isVentaIniciada) {
    return (
      <div className="mt-10 flex px-4">
        <button
          onClick={handleStartSale}
          className="hover:bg-green-700 text-black hover:text-white text-xl font-bold py-5 px-10 rounded-xl transition-all"
        >
          + Iniciar Nueva Venta
        </button>
      </div>
    );
  }

  if (loading || !sale) return <p className="p-6 mt-10">Cargando...</p>;

  const isClosed = sale.status === "PAID" || sale.status === "CANCELLED";
  const calculatedTotal = (sale.items || []).reduce(
    (acc: number, item: any) => acc + Number(item.qty) * Number(item.unitPrice),
    0
  );
  const totalPayments =
    sale.payments?.reduce((acc: number, p: any) => acc + Number(p.amount), 0) ||
    0;
  const currentBalance = calculatedTotal - totalPayments;
  const selectedClient =
    availableClients.find((c) => c.id === sale.clientId) || finalConsumer;

  return (
    <div className="mt-5 p-4 sm:p-6 space-y-6">
      <style jsx global>{`
        @media print {
          /*Ocultar absolutamente todo lo que no sea la factura */
          body * {
            visibility: hidden;
          }
          #printable-invoice,
          #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          /* Matar scrolls en todos los niveles */
          html,
          body,
          main,
          div,
          section {
            overflow: visible !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            scroll-behavior: auto !important;
          }

          /*Ocultar Toasts (react-hot-toast) */
          [toast-list],
          .toaster,
          div[role="status"] {
            display: none !important;
            opacity: 0 !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>

      {/* UI DE PANTALLA (Oculta en impresión) */}
      <div className="print:hidden space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-white p-4 sm:p-5 rounded-2xl shadow-sm border">
          <div>
            <h1 className="text-2xl font-black">
              {isClosed ? "Venta Finalizada" : "Nueva Venta"}
            </h1>
            <p className="text-xs font-mono text-gray-400">ID: {sale.id}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              onClick={handleCancel}
              disabled={isClosed}
            >
              Cancelar Venta
            </button>
            {!isClosed ? (
              <button
                onClick={handleFinalizeSale}
                disabled={!sale.items?.length || isConfirming}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {isConfirming ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <CheckCircle size={20} />
                )}
                Confirmar y Facturar
              </button>
            ) : (
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Printer size={20} /> Imprimir
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6 text-black">
            <div className="bg-white p-4 rounded-2xl border">
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">
                Cliente
              </label>
              <select
                disabled={isClosed}
                // Forzamos el valor al id del cliente actual o al consumidor final por defecto
                value={sale.clientId || finalConsumer?.id || ""}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full p-3 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-black transition-all font-bold"
              >
                {/* Opción por defecto siempre presente para evitar saltos */}
                {!sale.clientId && !finalConsumer && (
                  <option value="" disabled>
                    Seleccione un cliente
                  </option>
                )}

                {finalConsumer && (
                  <option value={finalConsumer.id}>
                    👤 {finalConsumer.name} (Final)
                  </option>
                )}

                {availableClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.lastName}
                  </option>
                ))}
              </select>
            </div>
            <SaleItemsTable />
          </div>
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border text-black font-black">
              <div className="flex justify-between text-2xl">
                <span>Total</span>
                <span>${calculatedTotal.toLocaleString()}</span>
              </div>
            </div>
            {!isClosed && sale.items?.length > 0 && <PaymentModal />}
          </div>
        </div>
      </div>

      {/* FACTURA PROFESIONAL (ID usado para el selector de impresión) */}
      <div
        id="printable-invoice"
        className="hidden print:block bg-white p-8 text-black font-sans min-h-screen"
      >
        <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-8">
          <div>
            <h2 className="text-5xl font-black tracking-tighter mb-2">
              RING MOTOS
            </h2>
            <div className="text-[10px] uppercase font-bold text-gray-500 space-y-1">
              <p className="flex items-center gap-2">
                <MapPin size={12} /> Av. Principal 1234, San Luis
              </p>
              <p className="flex items-center gap-2">
                <Phone size={12} /> +54 9 266 000-0000
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

        <div className="grid grid-cols-2 gap-8 mb-10 border-2 border-black p-6 rounded-xl bg-gray-50/30">
          <div>
            <p className="text-[10px] uppercase font-black text-gray-400 mb-1">
              Cliente / Razón Social
            </p>
            <p className="font-bold text-2xl uppercase">
              {selectedClient
                ? `${selectedClient.name} ${selectedClient.lastName || ""}`
                : "Consumidor Final"}
            </p>
            <p className="text-sm">DNI/CUIT: {selectedClient?.dni || "---"}</p>
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
              <th className="p-4 text-left">Descripción del Producto</th>
              <th className="p-4 text-center w-24">Cant.</th>
              <th className="p-4 text-right w-32">Unitario</th>
              <th className="p-4 text-right w-40">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 border-b-2 border-black">
            {sale.items?.map((item: any, i: number) => (
              <tr key={i} className="text-sm">
                <td className="p-4 font-bold uppercase">{item.description}</td>
                <td className="p-4 text-center">{item.qty}</td>
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
            <div className="flex justify-between bg-black text-white p-5 rounded-2xl font-black text-3xl">
              <span>TOTAL</span>
              <span>${calculatedTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-24 text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest border-t pt-6">
          Documento no válido como factura legal - Comprobante de entrega
          interna
        </div>
      </div>
    </div>
  );
}
