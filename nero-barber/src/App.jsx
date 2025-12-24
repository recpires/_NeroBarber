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
    async function checkUserRole(userId) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      if (data) setUserRole(data.role);
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkUserRole(session.user.id);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkUserRole(session.user.id);
      else {
        setUserRole(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-yellow-500 font-bold">
        Carregando...
      </div>
    );
  if (!session) return <Auth onLoginSuccess={() => {}} />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <button
        onClick={() => supabase.auth.signOut()}
        className="fixed bottom-6 right-6 z-[100] bg-red-600 hover:bg-red-700 text-white h-12 w-12 rounded-full shadow-2xl flex items-center justify-center font-bold transition-transform hover:scale-105"
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
