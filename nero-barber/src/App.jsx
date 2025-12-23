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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-yellow-500">
        Carregando...
      </div>
    );

  if (!session) return <Auth onLoginSuccess={() => {}} />;

  return (
    <div>
      {/* Botão Flutuante Vermelho no Canto Inferior */}
      <button
        onClick={() => supabase.auth.signOut()}
        className="fixed bottom-6 right-6 bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg z-50 hover:bg-red-700 transition-colors"
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
