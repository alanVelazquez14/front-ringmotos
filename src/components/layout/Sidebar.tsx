"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ShoppingCart,
  Wallet,
  Users,
  LogOut,
  HomeIcon,
  CreditCard,
  ChartCandlestick,
  UserRoundPlus,
  Menu,
  X,
} from "lucide-react";

const menuItems = [
  // { label: "Inicio", href: "/dashboard", icon: HomeIcon },
  { label: "Ventas", href: "/ventas", icon: ShoppingCart },
  { label: "Caja", href: "/caja", icon: Wallet },
  { label: "Cuenta Corriente", href: "/cuenta-corriente", icon: CreditCard },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Reportes", href: "/reportes", icon: ChartCandlestick },
  { label: "Registro", href: "/registro", icon: UserRoundPlus },
];

export default function Sidebar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/";
    router.push("/login");
  };

  return (
    <>
      {/* Botón hamburguesa (solo mobile) */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-slate-900 text-white p-2 rounded"
      >
        <Menu size={22} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      <aside
        className={`
          fixed md:static z-50
          w-64 bg-slate-900 text-slate-100 flex flex-col
          h-full
          transition-transform
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="p-5 font-bold text-lg flex items-center justify-between">
          RingMotos
          {/* Cerrar en mobile */}
          <button onClick={() => setOpen(false)} className="md:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-6">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 py-2 px-3 rounded font-bold text-lg hover:bg-slate-800 hover:text-slate-300 transition-colors"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-300 hover:bg-green-700 text-black hover:text-white py-2 rounded transition-colors"
          >
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
