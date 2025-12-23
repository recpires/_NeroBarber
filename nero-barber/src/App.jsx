import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import ClientDashboard from "./ClientDashboard";
import BarberDashboard from "./BarberDashboard";

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verifica sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    });

    // 2. Escuta mudanças (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Função para buscar se é Cliente ou Barbeiro no banco
  async function fetchUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) throw error;
      if (data) setUserRole(data.role);
    } catch (error) {
      console.error("Erro ao buscar perfil:", error.message);
    } finally {
      setLoading(false);
    }
  }

  // Tela de Carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-yellow-500 animate-pulse text-xl font-serif">
          Carregando Nero Barber...
        </div>
      </div>
    );
  }

  // Se não estiver logado -> Tela de Login
  if (!session) {
    return <Auth onLoginSuccess={() => {}} />;
  }

  // --- ÁREA LOGADA (DASHBOARD) ---
  return (
    <div>
      {/* Botão de Sair FLUTUANTE (Canto Inferior Direito) */}
      <button
        onClick={() => supabase.auth.signOut()}
        className="fixed bottom-6 right-6 bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg z-50 hover:bg-red-700 transition-colors cursor-pointer"
        title="Sair da conta"
      >
        Sair
      </button>

      {/* Decide qual Dashboard mostrar */}
      {userRole === "barber" ? (
        <BarberDashboard session={session} />
      ) : (
        <ClientDashboard session={session} />
      )}
    </div>
  );
}

export default App;
