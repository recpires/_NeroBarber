import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Auth({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Alterna entre Login e Cadastro
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("client"); // 'client' ou 'barber'

  // Função que lida com o envio do formulário
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LÓGICA DE LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Se der certo, avisa o App principal
        onLoginSuccess();
      } else {
        // --- LÓGICA DE CADASTRO ---
        // 1. Cria o usuário no sistema de Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        // 2. Salva os detalhes na tabela 'profiles' que criamos no SQL
        if (data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([
              {
                id: data.user.id,
                email: email,
                full_name: fullName,
                role: role, // Salva se é Barbeiro ou Cliente
              },
            ]);

          if (profileError) throw profileError;
        }

        alert("Cadastro realizado com sucesso! Faça login.");
        setIsLogin(true); // Volta para a tela de login
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-yellow-600/30 rounded-2xl shadow-2xl p-8">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-yellow-500 tracking-wider">
            NERO BARBER
          </h1>
          <p className="text-zinc-400 text-xs uppercase tracking-[0.2em] mt-2">
            {isLogin ? "Bem-vindo de volta" : "Crie sua conta exclusiva"}
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleAuth} className="space-y-4">
          {/* Campo Nome (Apenas no Cadastro) */}
          {!isLogin && (
            <div>
              <label className="block text-xs text-yellow-500 mb-1 uppercase tracking-wide">
                Nome Completo
              </label>
              <input
                type="text"
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 p-3 rounded focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="Seu nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          {/* Campo Email */}
          <div>
            <label className="block text-xs text-yellow-500 mb-1 uppercase tracking-wide">
              E-mail
            </label>
            <input
              type="email"
              className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 p-3 rounded focus:outline-none focus:border-yellow-500 transition-colors"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-xs text-yellow-500 mb-1 uppercase tracking-wide">
              Senha
            </label>
            <input
              type="password"
              className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 p-3 rounded focus:outline-none focus:border-yellow-500 transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Seleção de Perfil (Apenas no Cadastro) */}
          {!isLogin && (
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                onClick={() => setRole("client")}
                className={`flex-1 p-3 rounded border text-sm font-bold transition-all ${
                  role === "client"
                    ? "bg-yellow-600 text-black border-yellow-600"
                    : "bg-transparent text-zinc-500 border-zinc-700"
                }`}
              >
                CLIENTE
              </button>
              <button
                type="button"
                onClick={() => setRole("barber")}
                className={`flex-1 p-3 rounded border text-sm font-bold transition-all ${
                  role === "barber"
                    ? "bg-yellow-600 text-black border-yellow-600"
                    : "bg-transparent text-zinc-500 border-zinc-700"
                }`}
              >
                BARBEIRO
              </button>
            </div>
          )}

          {/* Botão Principal */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-black font-bold py-3 px-4 rounded mt-6 hover:bg-yellow-400 transition-colors shadow-lg uppercase tracking-wide disabled:opacity-50"
          >
            {loading ? "Processando..." : isLogin ? "Entrar" : "Cadastrar"}
          </button>
        </form>

        {/* Alternador Login/Cadastro */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-zinc-400 text-sm hover:text-yellow-500 underline decoration-yellow-600/50 underline-offset-4"
          >
            {isLogin
              ? "Não tem conta? Cadastre-se"
              : "Já tem conta? Faça login"}
          </button>
        </div>
      </div>
    </div>
  );
}
