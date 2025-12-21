"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Mail, Lock, LogIn, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Por favor, completa todos los campos");
      return;
    }

    const loadToast = toast.loading("Verificando credenciales...");

    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.access_token;

      Cookies.set("token", token, {
        expires: 7,
        secure: true,
        sameSite: "Strict",
      });

      toast.success("¡Bienvenido de nuevo!", { id: loadToast });
      router.replace("/ventas");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al iniciar sesión", {
        id: loadToast,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] shadow-2xl shadow-gray-200/60 border border-gray-50 w-full max-w-[400px] animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#111827] flex items-center justify-center text-white mb-4 sm:mb-6 shadow-lg shadow-gray-200">
            <LogIn size={24} className="sm:w-7 sm:h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Ring Motos
          </h1>
          <p className="text-gray-400 mt-1 sm:mt-2 font-medium text-xs sm:text-sm">
            Ingresa al sistema de gestión
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400 tracking-[0.15em] ml-1">
              Correo Electrónico
            </label>
            <div className="relative group">
              <Mail
                className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors"
                size={18}
              />
              <input
                type="email"
                className="w-full pl-11 sm:pl-14 pr-4 sm:pr-6 py-3.5 sm:py-4 bg-gray-50/50 border-none rounded-xl sm:rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all text-gray-700 text-sm sm:text-base font-medium"
                placeholder="nombre@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400 tracking-[0.15em] ml-1">
              Contraseña
            </label>
            <div className="relative group">
              <Lock
                className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors"
                size={18}
              />
              <input
                type="password"
                className="w-full pl-11 sm:pl-14 pr-4 sm:pr-6 py-3.5 sm:py-4 bg-gray-50/50 border-none rounded-xl sm:rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all text-gray-700 text-sm sm:text-base font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

          {/* Login Button: Padding ajustado para pulgares en mobile */}
          <div className="pt-2 sm:pt-4">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#111827] hover:bg-black text-white py-4 sm:py-5 rounded-xl sm:rounded-[24px] font-bold text-base sm:text-lg transition-all flex justify-center items-center gap-3 disabled:bg-gray-300 active:scale-[0.97] group/btn shadow-xl shadow-gray-200"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Entrar al Panel</span>
                  <ArrowRight
                    size={18}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-[10px] text-gray-300 mt-6 sm:mt-8 font-medium">
          Sistema de Control Interno v1.0
        </p>
      </div>
    </div>
  );
}
