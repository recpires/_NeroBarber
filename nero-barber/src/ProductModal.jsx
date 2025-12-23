import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function ProductModal({
  barbershopId,
  onClose,
  onProductAdded,
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image_url: "", // Num app real, faríamos upload. Aqui usaremos URL direta.
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            barbershop_id: barbershopId,
            name: formData.name,
            price: parseFloat(formData.price),
            description: formData.description,
            image_url:
              formData.image_url ||
              "https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&q=80&w=1000", // Imagem padrão bonita
          },
        ])
        .select()
        .single();

      if (error) throw error;

      onProductAdded(data);
      onClose();
    } catch (error) {
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-yellow-600/30 p-6 rounded-xl w-full max-w-sm shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white"
        >
          ✕
        </button>
        <h2 className="text-xl font-serif text-yellow-500 mb-4">
          Novo Produto
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full bg-zinc-950 border border-zinc-700 text-white p-3 rounded focus:border-yellow-500 outline-none"
            placeholder="Nome (Ex: Pomada Matte)"
            required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              className="w-1/2 bg-zinc-950 border border-zinc-700 text-white p-3 rounded focus:border-yellow-500 outline-none"
              placeholder="Preço (R$)"
              required
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
            <input
              className="w-1/2 bg-zinc-950 border border-zinc-700 text-white p-3 rounded focus:border-yellow-500 outline-none text-xs"
              placeholder="URL da Imagem (Opcional)"
              onChange={(e) =>
                setFormData({ ...formData, image_url: e.target.value })
              }
            />
          </div>
          <textarea
            className="w-full bg-zinc-950 border border-zinc-700 text-white p-3 rounded focus:border-yellow-500 outline-none"
            placeholder="Descrição curta..."
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <button
            disabled={loading}
            className="w-full bg-yellow-600 text-black font-bold py-3 rounded hover:bg-yellow-500 transition-colors"
          >
            {loading ? "Salvando..." : "Cadastrar Produto"}
          </button>
        </form>
      </div>
    </div>
  );
}
