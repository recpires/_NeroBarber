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
      // Busca Pontos
      const { data: profile } = await supabase
        .from("profiles")
        .select("loyalty_points")
        .eq("id", session.user.id)
        .single();
      if (profile) setPoints(profile.loyalty_points);

      // Busca Lojas
      const { data: shops } = await supabase.from("barbershops").select("*");
      // Busca Produtos
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
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-yellow-500 selection:text-black">
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-yellow-600 flex items-center justify-center text-black font-bold text-sm shadow-lg">
              {session.user.email[0].toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">
                Membro VIP
              </p>
              <h1 className="text-sm font-bold text-white">
                {session.user.email.split("@")[0]}
              </h1>
            </div>
          </div>
          <div className="bg-zinc-900 border border-yellow-600/30 px-4 py-2 rounded-full flex items-center gap-2">
            <span className="text-yellow-500 font-bold text-lg">{points}</span>
            <span className="text-[10px] text-zinc-500 uppercase font-bold">
              PTS
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-16">
        {/* 1. HERO BANNER (Bloco Sólido) */}
        <div className="w-full rounded-2xl overflow-hidden shadow-2xl bg-zinc-800 mt-6 border border-zinc-800">
          <div className="relative h-64 md:h-96 w-full">
            {/* Imagem como fundo, mas com container de altura definida */}
            <img
              src="https://images.unsplash.com/photo-1503951914875-452162b7f30a?q=80&w=1600&auto=format&fit=crop"
              className="w-full h-full object-cover opacity-60"
              alt="Banner"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-8">
              <span className="bg-yellow-600 text-black font-bold px-3 py-1 rounded w-fit text-xs uppercase mb-2">
                Nova Coleção
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">
                Estilo & Performance
              </h2>
            </div>
          </div>
        </div>

        {/* 2. PRODUTOS (Imagens Físicas) */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-white border-l-4 border-yellow-600 pl-4">
              Produtos Premium
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-zinc-900 rounded-xl border border-zinc-800 p-3 hover:border-yellow-600/50 transition-all flex flex-col"
              >
                {/* IMAGEM: h-48 força altura física. w-full preenche largura. */}
                <div className="w-full h-48 bg-black rounded-lg mb-3 overflow-hidden">
                  <img
                    src={product.image_url}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    alt={product.name}
                  />
                </div>

                <div className="flex flex-col flex-1">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                    {product.barbershops?.name || "Nero Store"}
                  </p>
                  <h3 className="text-white font-bold text-base truncate">
                    {product.name}
                  </h3>
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <span className="text-yellow-500 font-bold text-lg">
                      R$ {product.price}
                    </span>
                    <button className="bg-zinc-800 text-white px-3 py-1 rounded text-xs font-bold hover:bg-yellow-600 hover:text-black">
                      ADD
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. BARBEARIAS */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-white pl-4">
            Agendar Horário
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {barbershops.map((shop) => (
              <div
                key={shop.id}
                onClick={() => setSelectedShop(shop)}
                className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex items-center gap-4 cursor-pointer hover:bg-zinc-800 hover:border-zinc-600 transition-all shadow-lg"
              >
                <div className="h-14 w-14 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 text-2xl text-zinc-400">
                  ✂️
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-white text-lg truncate">
                    {shop.name}
                  </h3>
                  <p className="text-zinc-400 text-sm truncate">
                    📍 {shop.address}
                  </p>
                </div>
                <div className="bg-white text-black h-8 w-8 flex items-center justify-center rounded-full font-bold">
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
