"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Loader2,
  Printer,
  User,
  MapPin,
  Phone,
  PlusCircle,
  Trash2,
  FileText,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

interface Item {
  id: number;
  description: string;
  qty: number;
  unitPrice: number;
}

export default function PresupuestosPage() {
  const [availableClients, setAvailableClients] = useState<any[] | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [validityDays, setValidityDays] = useState<number>(15);
  const [items, setItems] = useState<Item[]>([
    { id: Date.now(), description: "", qty: 1, unitPrice: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await api.get("/clients");
        setAvailableClients(res.data || []);
      } catch (error) {
        toast.error("Error cargando clientes");
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now(), description: "", qty: 1, unitPrice: 0 },
    ]);
  };

  const updateItem = (id: number, field: keyof Item, value: any) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (id: number) => {
    if (items.length === 1) {
      setItems([{ id: Date.now(), description: "", qty: 1, unitPrice: 0 }]);
      return;
    }
    setItems(items.filter((item) => item.id !== id));
  };

  const calculatedTotal = items.reduce(
    (acc, item) => acc + Number(item.qty) * Number(item.unitPrice),
    0
  );

  const selectedClientData = availableClients?.find(
    (c) => c.id === selectedClientId
  );

  if (loading)
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
          body * {
            visibility: hidden !important;
          }
          #printable-quote,
          #printable-quote * {
            visibility: visible !important;
          }
          .print\:hidden {
            display: none !important;
          }
          html,
          body {
            background-color: white !important;
          }
          #printable-quote {
            display: flex !important;
            flex-direction: column !important;
            min-height: 95vh !important;
            width: 100% !important;
            padding: 40px !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
          }
          .print-footer {
            margin-top: auto !important;
          }
        }
      `}</style>

      {/* INTERFAZ DE USUARIO */}
      <div className="print:hidden space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-white p-5 rounded-2xl shadow-sm border">
          <div>
            <h1 className="text-2xl font-black text-black flex items-center gap-2">
              <FileText className="text-blue-600" /> Nuevo Presupuesto
            </h1>
            <p className="text-sm text-gray-400 font-medium">
              RING MOTOS - Gestión Documental
            </p>
          </div>
          <button
            onClick={() => window.print()}
            disabled={items[0].description === ""}
            className="px-8 py-3 bg-black text-white rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            <Printer size={20} /> Imprimir Presupuesto
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* SELECTOR DE CLIENTE */}
              <div className="bg-white p-5 rounded-2xl border">
                <label className="text-xs font-black uppercase text-gray-400 mb-2 block">
                  Seleccionar Cliente
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-black"
                >
                  <option value="">-- Buscar Cliente --</option>
                  {availableClients?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* CONFIGURACIÓN DE VIGENCIA */}
              <div className="bg-white p-5 rounded-2xl border">
                <label className="text-xs font-black uppercase text-gray-400 mb-2 flex items-center gap-1">
                  <Clock size={14} /> Vigencia del Presupuesto (Días)
                </label>
                <input
                  type="number"
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value))}
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-black text-xl"
                  placeholder="Ej: 15"
                />
              </div>
            </div>

            {/* TABLA DE PRODUCTOS */}
            <div className="bg-white rounded-2xl border overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500 border-b">
                    <th className="p-4 w-24 text-center">Cant.</th>
                    <th className="p-4">Descripción</th>
                    <th className="p-4 w-32 text-right">Precio</th>
                    <th className="p-4 w-32 text-right">Subtotal</th>
                    <th className="p-4 w-16 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2">
                        <input
                          type="number"
                          className="w-full p-2 text-center bg-transparent focus:bg-blue-50 outline-none rounded-lg"
                          value={item.qty}
                          onChange={(e) =>
                            updateItem(item.id, "qty", Number(e.target.value))
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="Descripción del ítem"
                          className="w-full p-2 bg-transparent focus:bg-blue-50 outline-none rounded-lg font-bold"
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, "description", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="w-full p-2 text-right bg-transparent focus:bg-blue-50 outline-none rounded-lg font-semibold"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "unitPrice",
                              Number(e.target.value)
                            )
                          }
                        />
                      </td>
                      <td className="p-4 text-right font-black">
                        ${(item.qty * item.unitPrice).toLocaleString("es-AR")}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={addItem}
                className="w-full p-4 text-blue-600 font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors border-t"
              >
                <PlusCircle size={20} /> Agregar Fila
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <p className="text-xs font-black text-gray-400 uppercase mb-1">
                Total Presupuestado
              </p>
              <h2 className="text-4xl font-black text-black">
                ${calculatedTotal.toLocaleString("es-AR")}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* VISTA DE IMPRESIÓN */}
      <div
        id="printable-quote"
        className="hidden print:block bg-white text-black"
      >
        <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-8">
          {/* Izquierda: Logo Principal */}
          <div className="w-1/3 flex justify-start">
            <img
              src="/LogoRingMotos.jpeg"
              alt="Ring Motos"
              className="h-28 w-auto object-contain"
            />
          </div>

          {/* Centro: Título del Documento */}
          <div className="w-1/3 text-center">
            <div className="border-4 border-black px-4 py-1 inline-block font-black text-4xl mb-1">
              P
            </div>
            <h2 className="font-black text-2xl uppercase tracking-tighter">
              Presupuesto
            </h2>
            <p className="text-sm font-bold">
              Fecha: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Derecha: Logo Partner */}
          <div className="w-1/3 flex justify-end">
            <img
              src="/LogoBiliMotos2.jpeg"
              alt="Bili Motos"
              className="h-24 w-auto object-contain"
            />
          </div>
        </div>

        {/* SECCIÓN CLIENTE Y VALIDEZ (Igual a tu código) */}
        <div className="grid grid-cols-2 gap-8 mb-10 border-2 border-black p-6 rounded-xl bg-gray-50">
          <div>
            <p className="text-[10px] uppercase font-black text-gray-400 mb-1">
              Cliente:
            </p>
            <p className="font-bold text-2xl uppercase">
              {selectedClientData
                ? `${selectedClientData.name} ${
                    selectedClientData.lastName || ""
                  }`
                : "Consumidor Final"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-black text-gray-400 mb-1">
              Validez del Presupuesto
            </p>
            <p className="font-black text-xl text-blue-800 italic uppercase">
              {validityDays} DÍAS CORRIDOS
            </p>
            <p className="text-[8px] text-gray-500">
              A partir de la fecha de emisión.
            </p>
          </div>
        </div>

        <table className="w-full mb-10 border-collapse">
          <thead>
            <tr className="bg-black text-white uppercase text-[10px] tracking-widest">
              <th className="p-4 text-center w-24">Cant.</th>
              <th className="p-4 text-left">Descripción</th>
              <th className="p-4 text-right w-32">Unitario</th>
              <th className="p-4 text-right w-40">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 border-b-2 border-black">
            {items.map((item, i) => (
              <tr key={i} className="text-sm">
                <td className="p-4 text-center">{item.qty}</td>
                <td className="p-4 font-bold uppercase">{item.description}</td>
                <td className="p-4 text-right">
                  ${item.unitPrice.toLocaleString()}
                </td>
                <td className="p-4 text-right font-black text-lg">
                  ${(item.qty * item.unitPrice).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-1/3 bg-black text-white p-5 rounded-2xl text-right">
            <p className="text-[10px] font-bold uppercase opacity-60">
              Total Final
            </p>
            <p className="font-black text-3xl">
              ${calculatedTotal.toLocaleString("es-AR")}
            </p>
          </div>
        </div>

        <div className="print-footer mt-auto">
          <div className="text-center text-[10px] text-gray-400 font-bold uppercase border-t pt-4">
            Precios sujetos a variaciones sin previo aviso una vez vencida la
            validez de {validityDays} días.
          </div>
        </div>
      </div>
    </div>
  );
}
