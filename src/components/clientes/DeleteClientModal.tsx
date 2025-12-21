"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface DeleteProps {
  clientId: string;
  clientName: string;
  onSuccess: () => void;
}

export default function DeleteClientModal({
  clientId,
  clientName,
  onSuccess,
}: DeleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const loadToast = toast.loading("Eliminando cliente...");
    try {
      await api.delete(`/clients/${clientId}`);
      toast.success("Cliente eliminado con éxito", { id: loadToast });
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      toast.error("No se pudo eliminar el cliente", { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all active:scale-95"
      >
        <Trash2 size={18} />
        Eliminar Cliente
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] p-8 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 text-center animate-in zoom-in duration-300">
        <div className="h-20 w-20 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={40} />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
          ¿Estás seguro?
        </h3>
        <p className="text-sm sm:text-base text-gray-500 mb-8 leading-relaxed">
          Estás a punto de eliminar a{" "}
          <span className="font-bold text-gray-800">{clientName}</span>. Esta
          acción no se puede deshacer.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="w-full py-3 sm:py-4 bg-red-600 text-white rounded-2xl font-bold flex justify-center items-center gap-2 hover:bg-red-700 transition-colors disabled:bg-gray-300"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Confirmar Eliminación"
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            disabled={loading}
            className="w-full py-3 sm:py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-colors"

          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
