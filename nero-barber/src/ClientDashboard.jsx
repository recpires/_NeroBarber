import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import BookingModal from "./BookingModal";

export default function ClientDashboard({ session }) {
  const [barbershops, setBarbershops] = useState([]);
  const [points, setPoints] = useState(0); // Estado para os pontos
  const [selectedShop, setSelectedShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [session.user.id]);

  async function fetchData() {
    try {
      // 1. Busca Barbearias
      const { data: shops } = await supabase.from("barbershops").select("*");
      setBarbershops(shops || []);

      // 2. Busca os Pontos do Cliente no perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("loyalty_points")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setPoints(profile.loyalty_points || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  // Calcula quanto falta para o prêmio (ex: prêmio com 100 pontos)
  const pointsGoal = 100;
  const progress = (points / pointsGoal) * 100;

  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-zinc-200 font-sans">
      {/* Cabeçalho com Pontos */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-serif text-yellow-500">Olá, Cliente</h1>
          <p className="text-xs text-zinc-500">{session.user.email}</p>
        </div>

        {/* Card de Fidelidade */}
        <div className="bg-zinc-900 border border-yellow-600/30 p-4 rounded-xl flex items-center gap-4 shadow-lg shadow-yellow-900/10">
          <div className="text-right">
            <p className="text-xs text-zinc-400 uppercase tracking-widest">
              Meus Pontos
            </p>
            <p className="text-3xl font-serif text-yellow-500 font-bold">
              {points}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full border-2 border-yellow-600 flex items-center justify-center bg-yellow-600/10">
            👑
          </div>
        </div>
      </header>

      {/* Barra de Progresso da Fidelidade */}
      <div className="mb-10 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <div className="flex justify-between text-xs text-zinc-400 mb-2">
          <span>Próxima Recompensa</span>
          <span>
            {points} / {pointsGoal}
          </span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2.5">
          <div
            className="bg-yellow-600 h-2.5 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-zinc-500 mt-2 text-center">
          {points >= pointsGoal
            ? "🎉 Parabéns! Você ganhou um corte grátis!"
            : `Faltam ${pointsGoal - points} pontos para o seu corte grátis.`}
        </p>
      </div>

      <h2 className="text-xl font-serif text-white mb-4 border-l-4 border-yellow-600 pl-3">
        Agendar Horário
      </h2>

      {loading ? (
        <p className="text-zinc-500">Carregando...</p>
      ) : barbershops.length === 0 ? (
        <p className="text-zinc-500">Nenhuma barbearia encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {barbershops.map((shop) => (
            <div
              key={shop.id}
              className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-yellow-600 transition-all cursor-pointer group"
              onClick={() => setSelectedShop(shop)}
            >
              <div className="h-32 bg-zinc-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                <h3 className="text-3xl font-serif text-zinc-700 font-bold group-hover:text-yellow-600/50 transition-colors z-0">
                  {shop.name.substring(0, 2).toUpperCase()}
                </h3>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-white group-hover:text-yellow-500 transition-colors">
                    {shop.name}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    📍 {shop.address}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
