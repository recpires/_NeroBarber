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
      const { data: profile } = await supabase
        .from("profiles")
        .select("loyalty_points")
        .eq("id", session.user.id)
        .single();
      if (profile) setPoints(profile.loyalty_points);

      const { data: shops } = await supabase.from("barbershops").select("*");
      const { data: prods } = await supabase
        .from("products")
        .select("*, barbershops(name)")
        .limit(10);

      if (shops) setBarbershops(shops);
      if (prods) setProducts(prods);
    }
    fetchData();
  }, [session.user.id]);

  return (
    <div className="min-h-screen pb-20 bg-zinc-950">
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-4 md:px-8 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-yellow-600 flex items-center justify-center text-black font-bold shadow-lg border-2 border-yellow-500 text-sm md:text-base">
              {session.user.email[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-zinc-400 uppercase tracking-widest font-bold">
                Membro VIP
              </p>
              <h1 className="text-sm md:text-lg font-bold text-white">
                {session.user.email.split("@")[0]}
              </h1>
            </div>
          </div>

          <div className="bg-zinc-900 border border-yellow-600/30 px-4 py-2 rounded-full flex items-center gap-2">
            <span className="text-yellow-500 font-bold text-lg md:text-2xl">
              {points}
            </span>
            <span className="text-[10px] md:text-xs text-zinc-500 uppercase font-bold tracking-widest">
              Pts
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-16">
        {/* 1. HERO BANNER - Altura Travada (h-64 mobile, h-96 desktop) */}
        <div className="relative w-full h-64 md:h-96 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-zinc-800 group mt-4">
          {/* Imagem Travada no Fundo */}
          <img
            src="https://images.unsplash.com/photo-1503951914875-452162b7f30a?q=80&w=1600&auto=format&fit=crop"
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
            alt="Banner"
          />

          {/* Texto por cima da imagem */}
          <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12 bg-gradient-to-t from-black via-black/40 to-transparent">
            <span className="bg-yellow-600 text-black font-bold px-3 py-1 rounded w-fit text-[10px] md:text-xs uppercase mb-3 shadow-lg tracking-wide">
              Nova Coleção
            </span>
            <h2 className="text-3xl md:text-6xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
              Estilo & <br />
              Performance.
            </h2>
            <p className="text-zinc-200 max-w-lg text-sm md:text-xl drop-shadow-md">
              Produtos exclusivos para quem exige o melhor.
            </p>
          </div>
        </div>

        {/* 2. PRODUTOS - Grid Responsivo */}
        <section>
          <div className="flex justify-between items-end mb-6 md:mb-8">
            <h2 className="text-xl md:text-3xl font-bold text-white border-l-4 border-yellow-600 pl-4">
              Produtos Premium
            </h2>
            <button className="text-sm md:text-base text-zinc-400 hover:text-white transition-colors">
              Ver Loja →
            </button>
          </div>

          {/* GRID: 2 colunas no celular, 4 no tablet, 5 no PC */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-zinc-900 rounded-xl p-3 border border-zinc-800 hover:border-yellow-600/50 transition-all cursor-pointer flex flex-col"
              >
                {/* CONTAINER DA IMAGEM: h-40 (160px) fixo */}
                <div className="w-full h-40 md:h-52 bg-black rounded-lg mb-3 overflow-hidden relative">
                  <img
                    src={product.image_url}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={product.name}
                  />
                  <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-yellow-500 text-[10px] md:text-xs font-bold px-2 py-1 rounded border border-yellow-600/20">
                    R$ {product.price}
                  </div>
                </div>

                {/* Infos do Produto */}
                <div className="flex-1 flex flex-col">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-bold truncate">
                    {product.barbershops?.name || "Nero Store"}
                  </p>
                  <h3 className="text-white font-bold text-sm md:text-base truncate group-hover:text-yellow-500 transition-colors">
                    {product.name}
                  </h3>

                  <button className="w-full mt-auto pt-3 bg-zinc-800 text-zinc-200 py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase hover:bg-yellow-600 hover:text-black transition-all">
                    Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. BARBEARIAS */}
        <section>
          <h2 className="text-xl md:text-3xl font-bold text-white mb-6 md:mb-8 border-l-4 border-white pl-4">
            Agendar Horário
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {barbershops.map((shop) => (
              <div
                key={shop.id}
                onClick={() => setSelectedShop(shop)}
                className="bg-zinc-900 p-5 md:p-6 rounded-xl border border-zinc-800 flex items-center gap-4 cursor-pointer hover:bg-zinc-800 hover:border-zinc-600 transition-all shadow-lg group"
              >
                <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 text-xl md:text-2xl group-hover:scale-110 transition-transform text-zinc-400 group-hover:text-yellow-500 group-hover:border-yellow-500">
                  ✂️
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-base md:text-lg group-hover:text-yellow-500 transition-colors truncate">
                    {shop.name}
                  </h3>
                  <p className="text-zinc-400 text-xs md:text-sm mt-1 truncate">
                    📍 {shop.address}
                  </p>
                </div>
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-white group-hover:text-black transition-all font-bold text-xs">
                  ➜
                </div>
              </div>
            ))}
          </div>
        </section>
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
