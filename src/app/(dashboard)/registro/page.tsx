"use client";

import { useState } from "react";
import { registerUser, RegisterData } from "@/services/auth.service";
import { UserPlus, Mail, Lock, User, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminRegisterForm() {
  const [formData, setFormData] = useState<RegisterData>({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(formData);
      toast.success("Usuario registrado exitosamente");
      setFormData({ firstname: "", lastname: "", email: "", password: "" });
    } catch (err) {
      toast.error("Error: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 mt-10 sm:p-8 max-w-4xl">
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 animate-in fade-in zoom-in duration-300">
        {/* Header del Formulario */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
            <UserPlus size={30} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Registrar Usuario
            </h2>
            <p className="text-gray-400 text-sm">
              Crea una nueva cuenta de administrador
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">
                Nombre
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Ej: Alan"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all text-gray-700"
                  value={formData.firstname}
                  onChange={(e) =>
                    setFormData({ ...formData, firstname: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Apellido */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">
                Apellido
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Ej: Velazquez"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all text-gray-700"
                  value={formData.lastname}
                  onChange={(e) =>
                    setFormData({ ...formData, lastname: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                size={20}
              />
              <input
                type="email"
                placeholder="admin@ringmotos.com"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all text-gray-700"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                size={20}
              />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all text-gray-700"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Botón de Acción */}
          <button
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-gray-200 mt-4 flex justify-center items-center gap-2 disabled:bg-gray-400 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <>
                <ShieldCheck size={22} />
                Finalizar Registro
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
