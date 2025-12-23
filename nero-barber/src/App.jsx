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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    });

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
      console.error("Erro:", error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-yellow-500">
        Carregando...
      </div>
    );

  if (!session) return <Auth onLoginSuccess={() => {}} />;

  return (
    <div className="bg-[#121212] min-h-screen">
      {/* BOTÃO SAIR FLUTUANTE 
          fixed: fica preso na tela
          bottom-6 right-6: canto inferior direito
          z-50: fica acima de tudo
       */}
      <button
        onClick={() => supabase.auth.signOut()}
        className="fixed bottom-6 right-6 h-12 w-12 bg-red-900/80 text-white rounded-full shadow-2xl z-50 hover:bg-red-700 transition-all flex items-center justify-center border border-red-500/30 backdrop-blur-sm"
        title="Sair"
      >
        ✕
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
