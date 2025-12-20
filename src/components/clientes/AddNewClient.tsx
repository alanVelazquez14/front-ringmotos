"use client";

import { useState } from "react";
import { UserPlus, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function AddNewClient({
  onCancel,
  onSuccess,
}: {
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dni: "",
    name: "",
    lastName: "",
    adress: "",
    phone: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/clients", formData);

      alert("Cliente registrado con éxito");
      onSuccess();
    } catch (error: any) {
      console.error("Error al registrar cliente:", error);
      const msg =
        error.response?.data?.message || "Error interno del servidor (500)";
      alert(`No se pudo registrar: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-in fade-in zoom-in duration-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <UserPlus className="text-blue-600" /> Registrar Nuevo Cliente
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
            DNI
          </label>
          <input
            placeholder="Ej: 22555999"
            className="w-full border-gray-200 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.dni}
            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
            Nombre
          </label>
          <input
            placeholder="Juan"
            className="w-full border-gray-200 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
            Apellido
          </label>
          <input
            placeholder="Perez"
            className="w-full border-gray-200 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
            Dirección
          </label>
          <input
            placeholder="Lote 41"
            className="w-full border-gray-200 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.adress}
            onChange={(e) =>
              setFormData({ ...formData, adress: e.target.value })
            }
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
            Teléfono
          </label>
          <input
            placeholder="3857408499"
            className="w-full border-gray-200 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 ml-1 uppercase">
            Email
          </label>
          <input
            type="email"
            placeholder="perez@mail.com"
            className="w-full border-gray-200 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mt-2 flex justify-center items-center gap-2 disabled:bg-blue-300"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Guardar Cliente"}
        </button>
      </form>
    </div>
  );
}
