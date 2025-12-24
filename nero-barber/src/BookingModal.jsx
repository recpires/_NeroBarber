import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function BookingModal({ barbershop, clientSession, onClose }) {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!selectedService || !date) return alert("Preencha tudo!");
    setLoading(true);
    try {
      const { error } = await supabase.from("appointments").insert([
        {
          client_id: clientSession.user.id,
          barbershop_id: barbershop.id,
          service_id: selectedService,
          booking_date: date,
          status: "pending",
        },
      ]);
      if (error) throw error;
      alert("Agendamento realizado! ✂️");
      onClose();
    } catch (error) {
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white z-10 font-bold bg-zinc-800 h-8 w-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          ✕
        </button>

        <div className="p-6 border-b border-zinc-800 bg-zinc-950">
          <h2 className="text-xl font-bold text-white">Agendar Horário</h2>
          <p className="text-zinc-400 text-sm mt-1">em {barbershop.name}</p>
        </div>

        <form onSubmit={handleBooking} className="p-6 space-y-6">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-3">
              Serviço
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
                    selectedService === service.id
                      ? "bg-yellow-600 border-yellow-600 text-black shadow-lg"
                      : "bg-black border-zinc-800 text-zinc-300 hover:border-zinc-600"
                  }`}
                >
                  <span className="font-bold text-sm">{service.name}</span>
                  <span className="text-xs font-bold">R$ {service.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">
              Data
            </label>
            <input
              type="datetime-local"
              required
              className="w-full bg-black border border-zinc-700 text-white p-3 rounded-lg focus:border-yellow-600 outline-none text-sm scheme-dark"
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-yellow-500 transition-colors text-sm uppercase tracking-wide"
          >
            {loading ? "Confirmando..." : "CONFIRMAR AGENDAMENTO"}
          </button>
        </form>
      </div>
    </div>
  );
}
