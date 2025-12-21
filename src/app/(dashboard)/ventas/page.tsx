"use client";

import { useEffect, useState } from "react";
import { useSales } from "@/context/SalesContext";
import SaleItemsTable from "@/components/ventas/SalesItemsTable";
import PaymentModal from "@/components/ventas/PaymentModal";
import { api } from "@/lib/api";
import { User } from "lucide-react";

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
        console.error("Error cargando clientes para venta:", error);
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
      }
    } catch (error) {
      alert("No se pudo actualizar el cliente");
    }
  };

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
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
            <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2 block">
              Asignar Cliente
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <select
                disabled={isClosed}
                value={sale.clientId || finalConsumer?.id || ""}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium text-gray-700"
              >
                {/* Opción de Consumidor Final primero */}
                {finalConsumer && (
                  <option value={finalConsumer.id}>
                    {finalConsumer.name} (Consumidor Final)
                  </option>
                )}

                {/* Lista de clientes registrados */}
                <optgroup label="Clientes Registrados">
                  {availableClients
                    .filter((c) => c.id !== finalConsumer?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.lastName} - DNI: {c.dni}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
          </div>

          <SaleItemsTable />
        </div>

        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-md flex flex-col space-y-3">
            {(() => {
              const calculatedTotal = (sale.items || []).reduce(
                (acc, item) => acc + Number(item.qty) * Number(item.unitPrice),
                0
              );

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
