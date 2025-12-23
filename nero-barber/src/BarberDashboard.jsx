import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import CreateBarbershop from "./CreateBarbershop";
import ServiceModal from "./ServiceModal";

export default function BarberDashboard({ session }) {
  const [barbershop, setBarbershop] = useState(null);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // CORREÇÃO 2: A função fetchData agora vive DENTRO do useEffect
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: shop } = await supabase
          .from("barbershops")
          .select("*")
          .eq("owner_id", session.user.id)
          .single();

        if (shop) {
          setBarbershop(shop);

          // Busca Serviços
          const { data: servicesData } = await supabase
            .from("services")
            .select("*")
            .eq("barbershop_id", shop.id);
          setServices(servicesData || []);

          // Busca Agendamentos
          const { data: appointmentsData } = await supabase
            .from("appointments")
            .select(
              `*, profiles (id, full_name, email, phone), services (name, price)`
            )
            .eq("barbershop_id", shop.id)
            .order("booking_date", { ascending: true });

          setAppointments(appointmentsData || []);
        }
      } catch (error) {
        console.log("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session.user.id]);

  // Função para recarregar dados após uma ação (como finalizar serviço)
  const reloadData = async () => {
    // Reutilizamos a lógica simples apenas para atualizar a tabela
    const { data: appointmentsData } = await supabase
      .from("appointments")
      .select(
        `*, profiles (id, full_name, email, phone), services (name, price)`
      )
      .eq("barbershop_id", barbershop.id)
      .order("booking_date", { ascending: true });
    setAppointments(appointmentsData || []);
  };

  const handleStatusChange = async (appointmentId, newStatus, clientId) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointmentId);

      if (error) throw error;

      if (newStatus === "completed" && clientId) {
        const { data: clientData } = await supabase
          .from("profiles")
          .select("loyalty_points")
          .eq("id", clientId)
          .single();

        const currentPoints = clientData?.loyalty_points || 0;

        await supabase
          .from("profiles")
          .update({ loyalty_points: currentPoints + 10 })
          .eq("id", clientId);

        alert("Serviço concluído! Pontos de fidelidade enviados.");
      }

      reloadData(); // Atualiza a tabela
    } catch (error) {
      alert("Erro ao atualizar status: " + error.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return <div className="p-8 text-yellow-500">Carregando painel...</div>;
  if (!barbershop)
    return (
      <CreateBarbershop
        session={session}
        onShopCreated={(shop) => setBarbershop(shop)}
      />
    );

  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-zinc-200 font-sans">
      <header className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-3xl font-serif text-yellow-500">
            {barbershop.name}
          </h1>
          <p className="text-xs text-zinc-500">
            Logado como: {session.user.email}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-yellow-600 text-black px-4 py-2 rounded font-bold hover:bg-yellow-500 transition-colors shadow-lg cursor-pointer flex items-center gap-2"
        >
          <span>+</span> Novo Serviço
        </button>
      </header>

      {/* Resumos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-zinc-900 p-6 rounded-xl border border-yellow-600/20 text-center">
          <h3 className="text-zinc-400 text-xs uppercase tracking-widest">
            Agendamentos
          </h3>
          <p className="text-4xl font-serif text-white mt-2">
            {appointments.length}
          </p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-xl border border-yellow-600/20 text-center">
          <h3 className="text-zinc-400 text-xs uppercase tracking-widest">
            Faturamento Previsto
          </h3>
          <p className="text-4xl font-serif text-yellow-500 mt-2">
            R${" "}
            {appointments
              .reduce((acc, curr) => acc + (curr.services?.price || 0), 0)
              .toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabela de Agendamentos */}
      <div className="mb-10">
        <h2 className="text-xl font-serif text-white mb-4 border-l-4 border-yellow-600 pl-3">
          Agenda do Dia
        </h2>

        {appointments.length === 0 ? (
          <p className="text-zinc-500">Nenhum agendamento.</p>
        ) : (
          <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950 text-yellow-500 uppercase font-bold text-xs">
                <tr>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Serviço</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {appointments.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="p-4 font-bold text-white">
                      {app.profiles?.full_name}
                    </td>
                    <td className="p-4">{app.services?.name}</td>
                    <td className="p-4 text-yellow-100">
                      {formatDate(app.booking_date)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs border uppercase font-bold
                          ${
                            app.status === "pending"
                              ? "bg-yellow-900/20 text-yellow-500 border-yellow-600/30"
                              : ""
                          }
                          ${
                            app.status === "confirmed"
                              ? "bg-blue-900/20 text-blue-400 border-blue-600/30"
                              : ""
                          }
                          ${
                            app.status === "completed"
                              ? "bg-green-900/20 text-green-400 border-green-600/30"
                              : ""
                          }
                        `}
                      >
                        {app.status === "pending"
                          ? "Pendente"
                          : app.status === "confirmed"
                          ? "Confirmado"
                          : app.status === "completed"
                          ? "Concluído"
                          : app.status}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      {app.status === "pending" && (
                        <button
                          onClick={() =>
                            handleStatusChange(
                              app.id,
                              "confirmed",
                              app.client_id
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                          title="Confirmar Agendamento"
                        >
                          ✔ Confirmar
                        </button>
                      )}
                      {app.status === "confirmed" && (
                        <button
                          onClick={() =>
                            handleStatusChange(
                              app.id,
                              "completed",
                              app.client_id
                            )
                          }
                          className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                          title="Finalizar e dar Pontos"
                        >
                          ✅ Finalizar
                        </button>
                      )}
                      {app.status === "completed" && (
                        <span className="text-zinc-600 text-xs italic">
                          Finalizado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CORREÇÃO 1: Listando os serviços aqui embaixo para usar a variável 'services' */}
      <div className="mb-8 opacity-50 hover:opacity-100 transition-opacity">
        <h2 className="text-sm font-serif text-zinc-400 mb-2 uppercase">
          Meus Serviços Cadastrados
        </h2>
        <div className="flex gap-2 flex-wrap">
          {services.map((service) => (
            <span
              key={service.id}
              className="bg-zinc-900 border border-zinc-700 px-3 py-1 rounded text-xs text-zinc-500"
            >
              {service.name}
            </span>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <ServiceModal
          barbershopId={barbershop.id}
          onClose={() => setIsModalOpen(false)}
          onServiceAdded={(newService) =>
            setServices([...services, newService])
          }
        />
      )}
    </div>
  );
}
