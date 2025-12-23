import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function CreateBarbershop({ session, onShopCreated }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insere a barbearia no banco vinculada ao ID do usuário logado (session.user.id)
      const { data, error } = await supabase
        .from("barbershops")
        .insert([
          {
            owner_id: session.user.id,
            name: formData.name,
            address: formData.address,
            description: formData.description,
            // phone e logo_url podemos adicionar depois ou ajustar a tabela se necessário
          },
        ])
        .select()
        .single();

      if (error) throw error;

      alert("Barbearia criada com sucesso!");
      onShopCreated(data); // Avisa o painel que a loja foi criada
    } catch (error) {
      console.error("Erro ao criar loja:", error);
      alert("Erro ao criar loja: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-yellow-600/30 rounded-2xl p-8">
        <h2 className="text-2xl font-serif text-yellow-500 mb-2">
          Configure sua Barbearia
        </h2>
        <p className="text-zinc-400 text-sm mb-6">
          Para começar a atender, precisamos de alguns dados do seu negócio.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome da Barbearia */}
          <div>
            <label className="block text-xs text-yellow-500 mb-1 uppercase">
              Nome do Estabelecimento
            </label>
            <input
              name="name"
              required
              className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 p-3 rounded focus:outline-none focus:border-yellow-500"
              placeholder="Ex: Nero Barber Shop"
              onChange={handleChange}
            />
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-xs text-yellow-500 mb-1 uppercase">
              Endereço Completo
            </label>
            <input
              name="address"
              className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 p-3 rounded focus:outline-none focus:border-yellow-500"
              placeholder="Rua, Número, Bairro, Cidade"
              onChange={handleChange}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs text-yellow-500 mb-1 uppercase">
              Descrição (Slogan)
            </label>
            <textarea
              name="description"
              rows="3"
              className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 p-3 rounded focus:outline-none focus:border-yellow-500"
              placeholder="O melhor corte da região..."
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-600 text-black font-bold py-3 rounded hover:bg-yellow-500 transition-colors mt-4"
          >
            {loading ? "Salvando..." : "Inaugurar Barbearia"}
          </button>
        </form>
      </div>
    </div>
  );
}
