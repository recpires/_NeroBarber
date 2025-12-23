import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function BookingModal({ barbershop, clientSession, onClose }) {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Busca os serviços dessa barbearia específica
  useEffect(() => {
    async function fetchServices() {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("barbershop_id", barbershop.id);
      setServices(data || []);
    }
    fetchServices();
  }, [barbershop.id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedService || !date) return alert("Selecione serviço e horário!");

    setLoading(true);
    try {
      const { error } = await supabase.from("appointments").insert([
        {
          client_id: clientSession.user.id,
          barbershop_id: barbershop.id,
          service_id: selectedService,
          booking_date: date,
          status: "pending", // Agendamento começa como pendente
        },
      ]);

      if (error) throw error;

      alert("Agendamento solicitado com sucesso!");
      onClose(); // Fecha a janela
    } catch (error) {
      alert("Erro ao agendar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-yellow-600/30 p-6 rounded-xl w-full max-w-md relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl font-serif text-yellow-500 mb-1">
          Agendar Horário
        </h2>
        <p className="text-sm text-zinc-400 mb-6">em {barbershop.name}</p>

        <form onSubmit={handleBooking} className="space-y-4">
          {/* Seleção de Serviço */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Escolha o Serviço
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`p-3 rounded border cursor-pointer flex justify-between transition-colors ${
                    selectedService === service.id
                      ? "bg-yellow-600/20 border-yellow-600 text-white"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  <span className="font-bold">{service.name}</span>
                  <span className="text-yellow-500">R$ {service.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Seleção de Data e Hora */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Data e Hora
            </label>
            <input
              type="datetime-local"
              required
              className="w-full bg-zinc-950 border border-zinc-700 text-white p-3 rounded focus:border-yellow-500 outline-none scheme-dark"
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-600 text-black font-bold py-3 rounded hover:bg-yellow-500 transition-colors mt-2"
          >
            {loading ? "Confirmando..." : "Confirmar Agendamento"}
          </button>
        </form>
      </div>
    </div>
  );
}
