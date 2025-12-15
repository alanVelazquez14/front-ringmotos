"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Wallet, Users, LogOut, HomeIcon } from "lucide-react";

const menuItems = [
  {
    label: "Inicio",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    label: "Ventas",
    href: "/ventas",
    icon: ShoppingCart,
  },
  {
    label: "Caja",
    href: "/caja",
    icon: Wallet,
  },
  {
    label: "Clientes",
    href: "/clientes",
    icon: Users,
  },
];

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/";
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-4 font-bold text-lg">RingMotos</div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 py-2 px-3 rounded hover:bg-slate-800 transition-colors"
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
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-green-800 text-black hover:text-white py-2 rounded transition-colors"
        >
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
