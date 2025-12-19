"use client";

import { useState } from "react";
import { registerUser, RegisterData } from "@/services/auth.service";

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
      alert("Usuario registrado exitosamente");
      // Limpiar formulario
      setFormData({ firstname: "", lastname: "", email: "", password: "" });
    } catch (err) {
      alert("Error: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 p-6 max-w-md bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">
        Registrar Nuevo Usuario
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre"
          className="w-full border p-2 rounded"
          value={formData.firstname}
          onChange={(e) =>
            setFormData({ ...formData, firstname: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Apellido"
          className="w-full border p-2 rounded"
          value={formData.lastname}
          onChange={(e) =>
            setFormData({ ...formData, lastname: e.target.value })
          }
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <button
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded"
        >
          {loading ? "Registrando..." : "Registrar Usuario"}
        </button>
      </form>
    </div>
  );
}
