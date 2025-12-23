import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function ServiceModal({
  barbershopId,
  onClose,
  onServiceAdded,
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "30", // Duração padrão em minutos
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("services")
        .insert([
          {
            barbershop_id: barbershopId,
            name: formData.name,
            price: parseFloat(formData.price),
            duration_minutes: parseInt(formData.duration),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      onServiceAdded(data);
      onClose(); // Fecha a janelinha
    } catch (error) {
      alert("Erro ao salvar serviço: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Fundo escuro transparente (Overlay)
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-yellow-600/50 p-6 rounded-xl w-full max-w-sm shadow-2xl relative">
        {/* Botão de Fechar (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl font-serif text-yellow-500 mb-4">
          Novo Serviço
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Nome do Serviço
            </label>
            <input
              type="text"
              required
              className="w-full bg-zinc-950 border border-zinc-700 text-white p-2 rounded focus:border-yellow-500 outline-none"
              placeholder="Ex: Corte Degradê"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs text-zinc-400 mb-1">
                Preço (R$)
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full bg-zinc-950 border border-zinc-700 text-white p-2 rounded focus:border-yellow-500 outline-none"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-zinc-400 mb-1">
                Duração (min)
              </label>
              <select
                className="w-full bg-zinc-950 border border-zinc-700 text-white p-2 rounded focus:border-yellow-500 outline-none"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1h</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-600 text-black font-bold py-2 rounded mt-2 hover:bg-yellow-500 transition-colors"
          >
            {loading ? "Salvando..." : "Adicionar Serviço"}
          </button>
        </form>
      </div>
    </div>
  );
}
