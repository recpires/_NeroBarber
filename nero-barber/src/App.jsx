import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import ClientDashboard from "./ClientDashboard";
import BarberDashboard from "./BarberDashboard";

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'client' ou 'barber'
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

  // Tela de Carregamento (Spinner simples)
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

  // Se estiver logado, decide qual tela mostrar e adiciona botão de sair
  return (
    <div>
      {/* Botão de Sair Flutuante (Temporário para facilitar testes) */}
      <button
        onClick={() => supabase.auth.signOut()}
        className="fixed bottom-4 right-4 bg-red-900/80 text-white text-xs px-3 py-1 rounded hover:bg-red-800 z-50"
      >
        Sair
      </button>

      {userRole === "barber" ? (
        <BarberDashboard session={session} />
      ) : (
        <ClientDashboard session={session} />
      )}
    </div>
  );
}

export default App;
