"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Search, RefreshCw } from "lucide-react";
import AddNewClient from "@/components/clientes/AddNewClient";
import { api } from "@/lib/api";
import Link from "next/link";

interface Customer {
  id: string | number;
  dni: string;
  name: string;
  lastName: string;
  adress: string;
  phone: string;
  email: string;
  balance?: number;
}

export default function CustomersPage() {
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/clients");
      setCustomers(response.data);
    } catch (error) {
      console.error("Error cargando clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.dni?.includes(searchTerm)
  );

  return (
    <div className="mt-10 sm:p-6 mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <Users className="text-blue-600" size={28} /> Clientes
          </h1>
          <p className="text-gray-400 text-sm">
            Base de datos de compradores registrados
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
            showForm
              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
              : "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95"
          }`}
        >
          {showForm ? (
            "Cancelar"
          ) : (
            <>
              <UserPlus size={20} /> Nuevo Cliente
            </>
          )}
        </button>
      </div>

      {showForm ? (
        <AddNewClient
          onCancel={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchCustomers();
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
              size={20}
            />
            <input
              placeholder="Buscar por nombre, apellido o DNI..."
              className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <RefreshCw className="animate-spin mx-auto mb-2" />
                <p className="font-medium">Cargando clientes...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                <p>No se encontraron clientes.</p>
              </div>
            ) : (
              filteredCustomers.map((c: any) => (
                <Link key={c.id} href={`/clientes/${c.id}`}>
                  <div
                    key={c.id}
                    className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                        {c.name?.[0]}
                        {c.lastName?.[0]}
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                          {c.name} {c.lastName}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                            DNI: {c.dni}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <span className="opacity-50 text-xs">📞</span>{" "}
                            {c.phone || "Sin teléfono"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="text-gray-300">📍</span>{" "}
                        {c.adress || "Sin dirección"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 italic">
                        {c.email || "Sin email registrado"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
