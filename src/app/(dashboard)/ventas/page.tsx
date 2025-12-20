"use client";

import { useEffect, useState } from "react";
import { useSales } from "@/context/SalesContext";
import SaleItemsTable from "@/components/ventas/SalesItemsTable";
import PaymentModal from "@/components/ventas/PaymentModal";

export default function SalesPage() {
  const {
    sale,
    loading,
    createSale,
    finalizeAndRemit,
    cancelSale,
    markRemitoAsPrinted,
  } = useSales();

  const [isVentaIniciada, setIsVentaIniciada] = useState(false);

  useEffect(() => {
    if (sale) setIsVentaIniciada(true);
  }, [sale]);

  const handleStartSale = () => {
    setIsVentaIniciada(true);
    if (!sale) createSale();
  };

  const handleCancel = async () => {
    if (confirm("¿Cancelar la venta actual?")) {
      await cancelSale();
      setIsVentaIniciada(false);
    }
  };

  const handlePrint = async () => {
    window.print();
    if (sale?.id) await markRemitoAsPrinted(sale.id);
  };

  if (!isVentaIniciada) {
    return (
      <div className="mt-10 flex px-4">
        <button
          onClick={handleStartSale}
          className="hover:bg-green-700 text-black hover:text-white text-xl sm:text-2xl font-bold py-5 px-8 sm:px-10 rounded-xl transition-transform active:scale-95 w-full sm:w-auto"
        >
          + Iniciar Nueva Venta
        </button>
      </div>
    );
  }

  if (loading || !sale) return <p className="p-6 mt-10">Cargando...</p>;

  const isClosed = sale.status === "PAID" || sale.status === "CANCELLED";

  return (
    <div className="mt-5 p-4 sm:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-500">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {isClosed ? "Venta Finalizada" : "Nueva Venta"}
          </h1>
          <p className="text-sm text-gray-400 font-mono mt-1 break-all">
            ID: {sale.id}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {!isClosed ? (
            <>
              <button
                onClick={handleCancel}
                className="px-5 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-colors w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                onClick={finalizeAndRemit}
                disabled={!sale.items || sale.items.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 w-full sm:w-auto"
              >
                Finalizar & Remito
              </button>
            </>
          ) : (
            <button
              onClick={handlePrint}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg flex justify-center items-center gap-2 hover:bg-black transition-colors w-full sm:w-auto"
            >
              <span>🖨️</span> Imprimir Remito
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-md">
            <p className="text-sm text-gray-500">Cliente</p>
            <p className="font-bold text-lg mt-1 break-words">
              {sale.clientId || "Consumidor Final"}
            </p>
          </div>

          <SaleItemsTable />
        </div>

        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-md flex flex-col space-y-3">

            {(() => {
              const calculatedTotal =
                sale.items?.reduce(
                  (acc, item) =>
                    acc + Number(item.qty) * Number(item.unitPrice),
                  0
                ) || 0;

              const totalPayments =
                sale.payments?.reduce((acc, p) => acc + Number(p.amount), 0) ||
                0;
              const currentBalance = calculatedTotal - totalPayments;

              return (
                <>
                  <div className="flex justify-between items-center text-xl sm:text-2xl font-bold">
                    <span>Total</span>
                    <span>${calculatedTotal.toLocaleString()}</span>
                  </div>

                  {currentBalance > 0 && (
                    <div className="flex justify-between items-center text-red-600 font-semibold">
                      <span>Saldo pendiente</span>
                      <span>${currentBalance.toLocaleString()}</span>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          {/* PAGOS */}
          {!isClosed && sale.items?.length > 0 && (
            <div className="bg-white p-2 rounded-xl shadow-md flex flex-col space-y-4">
              <div className="flex flex-col gap-3">
                <PaymentModal
               
                  key={`partial-${sale.items?.length}-${sale.balance ?? 0}`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
