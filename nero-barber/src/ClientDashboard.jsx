// src/ClientDashboard.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import BookingModal from "./BookingModal";

export default function ClientDashboard({ session }) {
  const [barbershops, setBarbershops] = useState([]);
  const [points, setPoints] = useState(0);
  const [selectedShop, setSelectedShop] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // Pega Pontos
      const { data: profile } = await supabase
        .from("profiles")
        .select("loyalty_points")
        .eq("id", session.user.id)
        .single();
      if (profile) setPoints(profile.loyalty_points);

      // Pega Barbearias
      const { data: shops } = await supabase.from("barbershops").select("*");
      if (shops) setBarbershops(shops);
    }
    fetchData();
  }, [session.user.id]);

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-white pb-20">
      {/* 1. CABEÇALHO (Grande e Espaçoso) */}
      <header className="bg-zinc-900 border-b border-zinc-800 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Saudação */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-yellow-600 rounded-full flex items-center justify-center text-2xl font-bold text-black border-4 border-zinc-800">
              {session.user.email[0].toUpperCase()}
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider">
                Olá, Cliente VIP
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {session.user.email.split("@")[0]}
              </h1>
            </div>
          </div>

          {/* Cartão de Pontos */}
          <div className="bg-black border border-zinc-700 px-6 py-3 rounded-xl flex flex-col items-center min-w-[120px]">
            <span className="text-3xl font-bold text-yellow-500">{points}</span>
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
              Seus Pontos
            </span>
          </div>
        </div>
      </header>

      {/* 2. LISTA DE BARBEARIAS */}
      <main className="max-w-5xl mx-auto p-6 mt-6">
        <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-yellow-600 pl-4">
          Onde você quer cortar hoje?
        </h2>

        {barbershops.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 bg-zinc-900 rounded-xl">
            Nenhuma barbearia cadastrada no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {barbershops.map((shop) => (
              <div
                key={shop.id}
                onClick={() => setSelectedShop(shop)}
                className="group bg-zinc-900 p-6 rounded-xl border border-zinc-800 cursor-pointer hover:border-yellow-600 hover:bg-zinc-800 transition-all shadow-lg flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors">
                    {shop.name}
                  </h3>
                  <p className="text-zinc-400 mt-1 flex items-center gap-2">
                    <span>📍</span> {shop.address}
                  </p>
                </div>

                {/* Botão Seta */}
                <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 group-hover:bg-yellow-600 group-hover:text-black transition-all">
                  ➜
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Agendamento */}
      {selectedShop && (
        <BookingModal
          barbershop={selectedShop}
          clientSession={session}
          onClose={() => setSelectedShop(null)}
        />
      )}
    </div>
  );
}
