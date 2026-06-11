"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/lib/supabase";
export default function CalendarioCitasPage() {
  const hoy = new Date().toISOString().split("T")[0];
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoy);
  const [citas, setCitas] = useState<any[]>([]);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  async function eliminarCita(id: number) {
  const confirmar = confirm(
    "¿Seguro que deseas eliminar esta cita? Esta acción no se puede deshacer."
  );

  if (!confirmar) return;

  const { error } = await supabase
    .from("citas")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Error al eliminar cita: " + error.message);
    return;
  }

  alert("Cita eliminada correctamente");
  await cargarCitas(fechaSeleccionada);
}
  const horarios = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
  ];
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fechaUrl = params.get("fecha");
    if (fechaUrl) {
      setFechaSeleccionada(fechaUrl);
      cargarCitas(fechaUrl);
    } else {
      cargarCitas(hoy);
    }
  }, []);
  async function cargarCitas(fecha: string) {
    const { data, error } = await supabase
      .from("citas")
      .select(`
        *,
        pacientes (
          nombre,
          telefono
        )
      `)
      .eq("fecha", fecha)
      .order("hora", { ascending: true });
    if (error) {
      alert("Error al cargar citas: " + error.message);
      return;
    }
    setCitas(data || []);
  }
  async function cambiarEstado(id: number, nuevoEstado: string) {
    const { error } = await supabase
      .from("citas")
      .update({ estado: nuevoEstado })
      .eq("id", id);
    if (error) {
      alert("Error al cambiar estado: " + error.message);
      return;
    }
   async function cambiarEstado(id: number, nuevoEstado: string) {
  const { error } = await supabase
    .from("citas")
    .update({ estado: nuevoEstado })
    .eq("id", id);

  if (error) {
    alert("Error al cambiar estado: " + error.message);
    return;
  }

  await cargarCitas(fechaSeleccionada);
}

     }
  function cambiarFecha(e: any) {
    e.preventDefault();
    cargarCitas(fechaSeleccionada);
    window.history.pushState({}, "", `/citas/calendario?fecha=${fechaSeleccionada}`);
  }
  function irHoy() {
    setFechaSeleccionada(hoy);
    cargarCitas(hoy);
    window.history.pushState({}, "", `/citas/calendario?fecha=${hoy}`);
  }
  function limpiarTelefono(telefono: string | undefined) {
    return telefono?.replace(/\D/g, "") || "";
  }
  function colorEstado(estado: string) {
    if (estado === "Confirmada") return "#2563eb";
    if (estado === "Asistió") return "#16a34a";
    if (estado === "No asistió") return "#6b7280";
    if (estado === "Cancelada") return "#dc2626";
    return "#eab308";
  }
  function estiloHorario(cantidad: number) {
    if (cantidad >= 4) {
      return {
        fondo: "linear-gradient(145deg,#450a0a,#7f1d1d)",
        borde: "#ef4444",
        texto: "#fecaca",
        estado: "Lleno",
        punto: "#ef4444",
      };
    }
    if (cantidad >= 1) {
      return {
        fondo: "linear-gradient(145deg,#422006,#854d0e)",
        borde: "#facc15",
        texto: "#fef3c7",
        estado: "Parcial",
        punto: "#facc15",
      };
    }
    return {
      fondo: "linear-gradient(145deg,#052e16,#065f46)",
      borde: "#22c55e",
      texto: "#bbf7d0",
      estado: "Disponible",
      punto: "#22c55e",
    };
  }
  const citasFiltradas =
    filtroEstado === "Todos"
      ? citas
      : citas.filter((cita) => cita.estado === filtroEstado);
  const totalCitas = citas.length;
  const horariosLlenos = horarios.filter(
    (hora) => citas.filter((cita) => cita.hora?.slice(0, 5) === hora).length >= 4
  ).length;
  const horariosParciales = horarios.filter((hora) => {
    const cantidad = citas.filter((cita) => cita.hora?.slice(0, 5) === hora).length;
    return cantidad >= 1 && cantidad < 4;
  }).length;
  const horariosDisponibles = horarios.filter(
    (hora) => citas.filter((cita) => cita.hora?.slice(0, 5) === hora).length === 0
  ).length;
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left,#0b5cff 0%,#020617 34%,#111827 100%)",
        padding: "35px",
      }}
    >
      <div style={{ maxWidth: "1500px", margin: "0 auto" }}>
        <div style={{ marginBottom: "22px" }}>
          <a
            href="/"
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "white",
              padding: "12px 18px",
              borderRadius: "14px",
              fontWeight: "900",
              fontSize: "14px",
              textDecoration: "none",
              display: "inline-block",
              border: "1px solid rgba(125,211,252,0.25)",
            }}
          >
            ← Regresar
          </a>
        </div>
        <div
          style={{
            background: "linear-gradient(90deg,#020617,#0f2f68,#0088ff)",
            borderRadius: "35px",
            padding: "35px",
            marginBottom: "30px",
            boxShadow: "0 0 55px rgba(0,102,255,0.35)",
            border: "1px solid rgba(125,211,252,0.25)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <p
              style={{
                color: "#7dd3fc",
                fontWeight: "900",
                letterSpacing: "2px",
                marginBottom: "8px",
              }}
            >
              AGENDA CLÍNICA
            </p>
            <h1
              style={{
                fontSize: "48px",
                fontWeight: "900",
                color: "white",
                margin: 0,
              }}
            >
              Calendario de Citas
            </h1>
            <p style={{ color: "#cbd5e1", marginTop: "10px", fontSize: "17px" }}>
              Disponibilidad por horario, estados de cita y acceso rápido al expediente.
            </p>
          </div>
          <a
            href="/citas/nueva"
            style={{
              background: "white",
              color: "#0b5cff",
              padding: "15px 24px",
              borderRadius: "16px",
              fontWeight: "900",
              textDecoration: "none",
              boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
            }}
          >
            + Nueva Cita
          </a>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "16px",
            marginBottom: "26px",
          }}
        >
          <Resumen titulo="Total citas" valor={totalCitas} color="#38bdf8" />
          <Resumen titulo="Disponibles" valor={horariosDisponibles} color="#22c55e" />
          <Resumen titulo="Parciales" valor={horariosParciales} color="#facc15" />
          <Resumen titulo="Llenos" valor={horariosLlenos} color="#ef4444" />
        </div>
        <form
          onSubmit={cambiarFecha}
          style={{
            background: "rgba(15,23,42,0.92)",
            padding: "22px",
            borderRadius: "24px",
            marginBottom: "20px",
            border: "1px solid rgba(125,211,252,0.20)",
            boxShadow: "0 15px 35px rgba(0,0,0,0.30)",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <label style={{ fontWeight: "900", color: "#e0f2fe" }}>
            Seleccionar fecha:
          </label>
          <input
            type="date"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            style={{
              padding: "13px",
              borderRadius: "14px",
              border: "1px solid rgba(125,211,252,0.35)",
              background: "#020617",
              color: "white",
              fontWeight: "700",
            }}
          />
          <button
            type="submit"
            style={botonPrincipal()}
          >
            Ver fecha
          </button>
          <button
            type="button"
            onClick={irHoy}
            style={botonSecundario()}
          >
            Hoy
          </button>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{
              padding: "13px",
              borderRadius: "14px",
              border: "1px solid rgba(125,211,252,0.35)",
              background: "#020617",
              color: "white",
              fontWeight: "700",
            }}
          >
            <option>Todos</option>
            <option>Pendiente</option>
            <option>Confirmada</option>
            <option>Asistió</option>
            <option>No asistió</option>
            <option>Cancelada</option>
          </select>
        </form>
        <div
          style={{
            background: "rgba(15,23,42,0.92)",
            padding: "18px",
            borderRadius: "22px",
            marginBottom: "28px",
            border: "1px solid rgba(125,211,252,0.20)",
            display: "flex",
            flexWrap: "wrap",
            gap: "14px",
            color: "#e0f2fe",
            fontWeight: "800",
          }}
        >
          <Leyenda color="#22c55e" texto="Disponible" />
          <Leyenda color="#facc15" texto="Parcial / Pendiente" />
          <Leyenda color="#ef4444" texto="Lleno / Cancelada" />
          <Leyenda color="#2563eb" texto="Confirmada" />
          <Leyenda color="#16a34a" texto="Asistió" />
          <Leyenda color="#6b7280" texto="No asistió" />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: "22px",
          }}
        >
          {horarios.map((hora) => {
            const citasEnHora =
              citasFiltradas?.filter((cita: any) => cita.hora?.slice(0, 5) === hora) || [];
            const totalCitasHora =
              citas?.filter((cita: any) => cita.hora?.slice(0, 5) === hora) || [];
            const cantidad = totalCitasHora.length;
            const estilo = estiloHorario(cantidad);
            return (
              <div
                key={hora}
                style={{
                  background: estilo.fondo,
                  border: `1px solid ${estilo.borde}`,
                  borderRadius: "28px",
                  padding: "24px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
                  transition: "0.3s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "34px",
                      fontWeight: "900",
                      color: "white",
                      margin: 0,
                    }}
                  >
                    {hora}
                  </h2>
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "999px",
                      backgroundColor: estilo.punto,
                      boxShadow: `0 0 20px ${estilo.punto}`,
                    }}
                  />
                </div>
                <p
                  style={{
                    fontWeight: "900",
                    color: estilo.texto,
                    marginBottom: "18px",
                  }}
                >
                  {estilo.estado} — {cantidad}/4 pacientes
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {citasEnHora.length === 0 && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.10)",
                        borderRadius: "18px",
                        padding: "14px",
                        color: estilo.texto,
                        fontWeight: "700",
                      }}
                    >
                      Sin pacientes agendados
                    </div>
                  )}
                  {citasEnHora.map((cita: any) => {
                    const telefono = limpiarTelefono(cita.pacientes?.telefono);
                    const telefonoConPais = telefono.startsWith("52")
                      ? telefono
                      : `52${telefono}`;
                    const mensaje = `Hola ${cita.pacientes?.nombre}

Le recordamos su cita en General Therapy Clinic.

Fecha: ${cita.fecha}
Hora: ${cita.hora?.slice(0, 5)}

Por favor confirme su asistencia respondiendo a este mensaje.

L.R.T.F. Gabriel González Ramírez
General Therapy Clinic`;

const mensajeManana = `Hola ${cita.pacientes?.nombre}

Le recordamos que tiene una cita programada para mañana en General Therapy Clinic.

Fecha: ${cita.fecha}
Hora: ${cita.hora?.slice(0, 5)}

Por favor confirme su asistencia respondiendo a este mensaje.

L.R.T.F. Gabriel González Ramírez
General Therapy Clinic`;


                    return (
                      <div
                        key={cita.id}
                        style={{
                          background: "#0f172a",
                          borderRadius: "20px",
                          padding: "14px",
                          color: "white",
                          fontWeight: "700",
                          boxShadow: `0 8px 22px rgba(0,0,0,0.30), 0 0 18px ${colorEstado(cita.estado)}33`,
                          borderLeft: `7px solid ${colorEstado(cita.estado)}`,
                        }}
                      >
                        <div style={{ marginBottom: "6px", fontSize: "16px" }}>
                          {cita.pacientes?.nombre || "Paciente sin nombre"}
                        </div>
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#cbd5e1",
                            display: "block",
                            marginBottom: "9px",
                          }}
                        >
                          {cita.motivo || "Sin motivo registrado"}
                        </span>
                        <span
                          style={{
                            display: "inline-block",
                            backgroundColor: colorEstado(cita.estado),
                            color: "white",
                            padding: "5px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            marginBottom: "12px",
                            fontWeight: "900",
                          }}
                        >
                          {cita.estado || "Pendiente"}
                        </span>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button onClick={() => cambiarEstado(cita.id, "Confirmada")} style={botonAccion("#2563eb")}>
                            Confirmar
                          </button>
                          <button onClick={() => cambiarEstado(cita.id, "Asistió")} style={botonAccion("#16a34a")}>
                            Asistió
                          </button>
                          <button onClick={() => cambiarEstado(cita.id, "No asistió")} style={botonAccion("#6b7280")}>
                            No asistió
                          </button>
                          <button onClick={() => cambiarEstado(cita.id, "Cancelada")} style={botonAccion("#dc2626")}>
                            Cancelar
                            </button>
                            <button onClick={() => eliminarCita(cita.id)} 
  style={botonAccion("#991b1b")}
>
  Eliminar
</button>
                          <a href={`/pacientes/expediente/${cita.paciente_id}`} style={linkAccion("#0b5cff", "white")}>
                            Expediente
                          </a>
                          <a href={`/citas/editar/${cita.id}`} style={linkAccion("#facc15", "#111827")}>
                            Editar
                          </a>
                          {telefono ? (
                            <a
                              href={`https://api.whatsapp.com/send?phone=${telefonoConPais}&text=${encodeURIComponent(mensaje)}`}
                              target="_self"
                              rel="noopener noreferrer"
                              style={linkAccion("#22c55e", "white")}
                            >
                              WhatsApp
                            </a>
                          ) : (
                            <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                              Sin teléfono
                            </span>
                          )}
                          <a
  href={`https://api.whatsapp.com/send?phone=${telefonoConPais}&text=${encodeURIComponent(mensajeManana)}`}
  target="_self"
  rel="noopener noreferrer"
  style={linkAccion("#16a34a", "white")}
>
  Recordar mañana
</a>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {cantidad < 4 ? (
                  <a
                    href={`/citas/nueva?fecha=${fechaSeleccionada}&hora=${hora}`}
                    style={{
                      display: "inline-block",
                      marginTop: "18px",
                      background: "white",
                      color: "#0b5cff",
                      padding: "11px 16px",
                      borderRadius: "14px",
                      textDecoration: "none",
                      fontWeight: "900",
                    }}
                  >
                    Agendar aquí
                  </a>
                ) : (
                  <div
                    style={{
                      marginTop: "18px",
                      background: "rgba(255,255,255,0.10)",
                      color: "#fecaca",
                      padding: "11px 16px",
                      borderRadius: "14px",
                      fontWeight: "900",
                      textAlign: "center",
                    }}
                  >
                    Horario lleno
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
function Resumen({ titulo, valor, color }: any) {
  return (
    <div
      style={{
        background: "rgba(15,23,42,0.92)",
        border: `1px solid ${color}55`,
        borderRadius: "22px",
        padding: "18px",
        boxShadow: "0 15px 35px rgba(0,0,0,0.30)",
      }}
    >
      <p style={{ color: "#cbd5e1", fontWeight: "800", marginBottom: "8px" }}>
        {titulo}
      </p>
      <h3 style={{ color, fontSize: "34px", fontWeight: "900", margin: 0 }}>
        {valor}
      </h3>
    </div>
  );
}
function Leyenda({ color, texto }: any) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "999px",
          background: color,
          boxShadow: `0 0 12px ${color}`,
        }}
      />
      {texto}
    </span>
  );
}
function botonPrincipal() {
  return {
    background: "linear-gradient(90deg,#0b5cff,#06b6d4)",
    color: "white",
    padding: "13px 22px",
    borderRadius: "14px",
    border: "none",
    fontWeight: "900",
    cursor: "pointer",
  };
}
function botonSecundario() {
  return {
    background: "rgba(255,255,255,0.12)",
    color: "white",
    padding: "13px 22px",
    borderRadius: "14px",
    border: "1px solid rgba(125,211,252,0.25)",
    fontWeight: "900",
    cursor: "pointer",
  };
}
function botonAccion(color: string) {
  return {
    backgroundColor: color,
    color: "white",
    padding: "8px 10px",
    borderRadius: "10px",
    border: "none",
    fontSize: "13px",
    fontWeight: "900",
    cursor: "pointer",
  };
}
function linkAccion(fondo: string, color: string) {
  return {
    backgroundColor: fondo,
    color,
    padding: "8px 10px",
    borderRadius: "10px",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "900",
  };
}