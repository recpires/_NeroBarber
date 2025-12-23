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
        console.error("Erro ao carregar:", error);
      }
    }
    fetchData();
  }, [session.user.id]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans pb-20">
      {/* --- 1. HERO SECTION (BANNER) --- */}
      <div
        className="relative w-full overflow-hidden flex items-end p-8"
        style={{
          height: "400px",
          background: "linear-gradient(135deg, #121212 0%, #000000 100%)",
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-600/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>

        {/* CORREÇÃO AQUI: items-start para celular, md:items-end para PC */}
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="mb-2 md:mb-0">
            <p className="text-yellow-500 text-xs font-bold tracking-[0.3em] uppercase mb-3">
              Olá, {session.user.email.split("@")[0]}
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-white font-bold leading-tight drop-shadow-lg text-left">
              Seu Estilo, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                Sua Assinatura.
              </span>
            </h1>
          </div>

          {/* Card de Pontos (PC) */}
          <div className="hidden md:block bg-white/5 backdrop-blur-md border border-yellow-500/30 p-6 rounded-2xl text-center shadow-2xl min-w-[150px]">
            <span className="block text-5xl font-serif font-bold text-yellow-500">
              {points}
            </span>
            <span className="text-xs text-zinc-300 uppercase tracking-widest mt-1 block">
              Pontos
            </span>
          </div>
        </div>
      </div>

      {/* Card de Pontos (Mobile) */}
      <div className="md:hidden px-6 -mt-8 relative z-20">
        <div className="bg-zinc-900 border border-yellow-600/30 p-4 rounded-xl flex items-center justify-between shadow-xl shadow-black/50">
          <span className="text-sm text-zinc-400 uppercase font-bold">
            Meus Pontos
          </span>
          <span className="text-3xl font-serif font-bold text-yellow-500 flex items-center gap-2">
            {points} <span className="text-lg">👑</span>
          </span>
        </div>
      </div>

      <div className="p-6 space-y-12">
        {/* --- 2. DESTAQUES --- */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif text-white border-l-4 border-yellow-600 pl-3">
              Produtos Exclusivos
            </h2>
            <span className="text-xs text-zinc-500 hover:text-yellow-500 cursor-pointer transition-colors">
              Ver loja completa →
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-[180px] w-[180px] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-yellow-600/50 transition-all group shadow-lg"
              >
                <div className="h-32 overflow-hidden relative">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-zinc-500 mb-1 uppercase tracking-wider truncate">
                    {product.barbershops?.name}
                  </p>
                  <h3 className="font-bold text-white text-md truncate font-serif">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-yellow-500 font-bold">
                      R$ {product.price}
                    </p>
                    <button className="bg-yellow-600 text-black text-xs p-2 rounded-full hover:bg-yellow-400 transition-colors">
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- 3. BARBEARIAS --- */}
        <section>
          <h2 className="text-2xl font-serif text-white mb-6 border-l-4 border-zinc-700 pl-3">
            Agendar Horário
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {barbershops.map((shop) => (
              <div
                key={shop.id}
                onClick={() => setSelectedShop(shop)}
                className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-xl relative group cursor-pointer hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="h-40 bg-gradient-to-r from-zinc-800 to-zinc-900 relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                    <h3 className="text-6xl font-serif text-white font-bold">
                      {shop.name.substring(0, 1)}
                    </h3>
                  </div>
                  <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
                    DISPONÍVEL
                  </div>
                </div>

                <div className="p-5 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-xl text-white group-hover:text-yellow-500 transition-colors font-serif">
                      {shop.name}
                    </h3>
                    <p className="text-sm text-zinc-400 mt-2 flex items-center gap-2">
                      📍 {shop.address}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-600 rounded-full flex items-center justify-center text-black text-xl shadow-lg shadow-yellow-600/20 group-hover:scale-110 transition-transform">
                    ✂
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

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
