import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import BookingModal from "./BookingModal";

export default function ClientDashboard({ session }) {
  const [barbershops, setBarbershops] = useState([]);
  const [points, setPoints] = useState(0);
  const [selectedShop, setSelectedShop] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // Busca Pontos
      const { data: profile } = await supabase
        .from("profiles")
        .select("loyalty_points")
        .eq("id", session.user.id)
        .single();
      if (profile) setPoints(profile.loyalty_points);

      // Busca Lojas
      const { data: shops } = await supabase.from("barbershops").select("*");
      if (shops) setBarbershops(shops);
    }
    fetchData();
  }, [session.user.id]);

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-white">
      {/* --- CABEÇALHO --- */}
      <header className="w-full border-b border-zinc-800 p-6 bg-zinc-900">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar Grande */}
            <div className="h-16 w-16 bg-yellow-600 rounded-full flex items-center justify-center text-black text-2xl font-bold border-4 border-zinc-800">
              {session.user.email[0].toUpperCase()}
            </div>
            {/* Nome Grande */}
            <div>
              <p className="text-zinc-400 uppercase tracking-widest text-xs font-bold">
                Bem-vindo
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {session.user.email.split("@")[0]}
              </h1>
            </div>
          </div>

          {/* Pontos Grandes */}
          <div className="text-right">
            <span className="block text-4xl font-bold text-yellow-500">
              {points}
            </span>
            <span className="text-sm text-zinc-400 uppercase">Pontos</span>
          </div>
        </div>
      </header>

      {/* --- LISTA DE BARBEARIAS --- */}
      <main className="max-w-4xl mx-auto p-6 mt-8">
        <h2 className="text-3xl font-bold text-white mb-6 border-l-8 border-yellow-600 pl-4">
          Escolha sua Unidade
        </h2>

        {barbershops.length === 0 ? (
          <div className="p-10 text-center bg-zinc-900 rounded-xl border border-zinc-800 text-xl text-zinc-500">
            Carregando barbearias...
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {barbershops.map((shop) => (
              <div
                key={shop.id}
                onClick={() => setSelectedShop(shop)}
                className="group bg-zinc-900 p-8 rounded-2xl border border-zinc-800 cursor-pointer hover:border-yellow-600 hover:bg-zinc-800 transition-all flex items-center justify-between"
              >
                <div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-yellow-500 transition-colors">
                    {shop.name}
                  </h3>
                  <p className="text-lg text-zinc-400 mt-2">
                    📍 {shop.address}
                  </p>
                </div>
                <div className="bg-white text-black h-12 w-12 rounded-full flex items-center justify-center font-bold text-xl group-hover:bg-yellow-500 transition-colors">
                  ➜
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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
