import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import BookingModal from "./BookingModal";

export default function ClientDashboard({ session }) {
  const [barbershops, setBarbershops] = useState([]);
  const [products, setProducts] = useState([]);
  const [points, setPoints] = useState(0);
  const [selectedShop, setSelectedShop] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const profileReq = supabase
          .from("profiles")
          .select("loyalty_points")
          .eq("id", session.user.id)
          .single();
        const shopsReq = supabase.from("barbershops").select("*");
        const productsReq = supabase
          .from("products")
          .select("*, barbershops(name)")
          .limit(6);

        const [profileRes, shopsRes, productsRes] = await Promise.all([
          profileReq,
          shopsReq,
          productsReq,
        ]);

        if (profileRes.data) setPoints(profileRes.data.loyalty_points || 0);
        if (shopsRes.data) setBarbershops(shopsRes.data);
        if (productsRes.data) setProducts(productsRes.data);
      } catch (error) {
        console.error("Erro:", error);
      }
    }
    fetchData();
  }, [session.user.id]);

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-200 font-sans pb-24">
      {/* Container Centralizado (Limita a largura em telas grandes para parecer App) */}
      <div className="max-w-4xl mx-auto bg-zinc-950 min-h-screen shadow-2xl shadow-black border-x border-zinc-900">
        {/* --- 1. HERO HEADER (Minimalista & Luxo) --- */}
        <div className="relative h-80 w-full overflow-hidden rounded-b-[3rem] shadow-2xl bg-zinc-900 border-b border-yellow-900/20">
          {/* Fundo Degradê Premium */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-zinc-950 to-zinc-950"></div>

          <div className="relative z-10 h-full flex flex-col justify-center px-8 pt-4">
            <p className="text-yellow-600 text-[10px] font-bold tracking-[0.4em] uppercase mb-2">
              Bem-vindo
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-white leading-tight">
              <span className="font-light italic text-zinc-400">Olá,</span>{" "}
              <br />
              {session.user.email.split("@")[0]}
            </h1>

            {/* Badge de Pontos Integrado */}
            <div className="mt-6 flex items-center gap-4">
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-[1px] rounded-full">
                <div className="bg-black px-4 py-2 rounded-full flex items-center gap-2">
                  <span className="text-yellow-500 font-bold text-lg">
                    {points}
                  </span>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                    Pontos
                  </span>
                </div>
              </div>
              {points >= 100 && (
                <span className="text-xs text-green-400 animate-pulse">
                  ★ Recompensa disponível
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-10 -mt-4">
          {/* --- 2. VITRINE DE PRODUTOS --- */}
          <section>
            <div className="flex justify-between items-end mb-5 px-1">
              <h2 className="text-xl font-serif text-zinc-100">
                Coleção Exclusiva
              </h2>
              <span className="text-[10px] text-yellow-600 uppercase tracking-widest cursor-pointer hover:text-yellow-500">
                Ver Todos
              </span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="min-w-[160px] snap-start bg-zinc-900/50 rounded-xl border border-zinc-800 p-3 hover:border-yellow-900/50 transition-all group cursor-pointer"
                >
                  <div className="h-28 rounded-lg overflow-hidden mb-3 relative">
                    <img
                      src={product.image_url}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={product.name}
                    />
                  </div>
                  <h3 className="text-zinc-200 text-sm font-serif truncate">
                    {product.name}
                  </h3>
                  <p className="text-yellow-600 font-bold text-sm mt-1">
                    R$ {product.price}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* --- 3. LISTA DE BARBEARIAS --- */}
          <section>
            <h2 className="text-xl font-serif text-zinc-100 mb-5 px-1">
              Agendar Experiência
            </h2>
            <div className="flex flex-col gap-4">
              {barbershops.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => setSelectedShop(shop)}
                  className="relative bg-zinc-900 rounded-2xl p-1 border border-zinc-800 hover:border-yellow-600/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 p-3">
                    {/* Avatar da Barbearia */}
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center border border-zinc-700 group-hover:border-yellow-600/50 transition-colors">
                      <span className="font-serif text-2xl text-zinc-500 group-hover:text-yellow-500 transition-colors">
                        {shop.name.substring(0, 1)}
                      </span>
                    </div>

                    {/* Textos */}
                    <div className="flex-1">
                      <h3 className="text-lg text-white font-serif group-hover:text-yellow-500 transition-colors">
                        {shop.name}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        📍 {shop.address}
                      </p>
                    </div>

                    {/* Botão Seta */}
                    <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-yellow-600 group-hover:text-black transition-all">
                      →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

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
