"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/lib/supabase";

export default function CalendarioSemanaPage() {
  const hoy = new Date();
  const [fechaBase, setFechaBase] = useState(hoy);
  const [citas, setCitas] = useState<any[]>([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState<any>(null);

  const horarios = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
  ];

  const dias = obtenerSemana(fechaBase);

  useEffect(() => {
    cargarCitasSemana();
  }, [fechaBase]);

  function formatoFecha(date: Date) {
    return date.toISOString().split("T")[0];
  }

  function obtenerSemana(fecha: Date) {
    const dia = fecha.getDay();
    const diferencia = dia === 0 ? -6 : 1 - dia;
    const lunes = new Date(fecha);
    lunes.setDate(fecha.getDate() + diferencia);

    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      return d;
    });
  }

  async function cargarCitasSemana() {
    const inicio = formatoFecha(dias[0]);
    const fin = formatoFecha(dias[5]);

    const { data, error } = await supabase
      .from("citas")
      .select(`
        *,
        pacientes (
          nombre,
          telefono
        )
      `)
      .gte("fecha", inicio)
      .lte("fecha", fin)
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    if (error) {
      alert("Error al cargar citas: " + error.message);
      return;
    }

    setCitas(data || []);
  }

  function semanaAnterior() {
    const nueva = new Date(fechaBase);
    nueva.setDate(nueva.getDate() - 7);
    setFechaBase(nueva);
  }

  function semanaSiguiente() {
    const nueva = new Date(fechaBase);
    nueva.setDate(nueva.getDate() + 7);
    setFechaBase(nueva);
  }

  function irHoy() {
    setFechaBase(new Date());
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

    setCitaSeleccionada(null);
    await cargarCitasSemana();
  }

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

    setCitaSeleccionada(null);
    await cargarCitasSemana();
  }

  function limpiarTelefono(telefono: string | undefined) {
    return telefono?.replace(/\D/g, "") || "";
  }

  function colorEstado(estado: string) {
    if (estado === "Confirmada") return "#2563eb";
    if (estado === "Asistió") return "#16a34a";
    if (estado === "No asistió") return "#64748b";
    if (estado === "Cancelada") return "#dc2626";
    return "#eab308";
  }

  function nombreDia(fecha: Date) {
    return fecha.toLocaleDateString("es-MX", { weekday: "short" }).toUpperCase();
  }

  function numeroDia(fecha: Date) {
    return fecha.getDate();
  }

  function mesAnio(fecha: Date) {
    return fecha.toLocaleDateString("es-MX", {
      month: "long",
      year: "numeric",
    });
  }

  function citasPorCelda(fecha: Date, hora: string) {
    const fechaTexto = formatoFecha(fecha);
    return citas.filter(
      (cita) =>
        cita.fecha === fechaTexto &&
        cita.hora?.slice(0, 5) === hora
    );
  }

  function telefonoWhats(cita: any) {
    const tel = limpiarTelefono(cita?.pacientes?.telefono);
    if (!tel) return "";
    return tel.startsWith("52") ? tel : `52${tel}`;
  }

  function mensajeWhats(cita: any) {
    return `Hola ${cita.pacientes?.nombre}

Le recordamos su cita en General Therapy Clinic.

Fecha: ${cita.fecha}
Hora: ${cita.hora?.slice(0, 5)}

Por favor confirme su asistencia respondiendo a este mensaje.

L.R.T.F. Gabriel González Ramírez
General Therapy Clinic`;
  }

  function mensajeManana(cita: any) {
    return `Hola ${cita.pacientes?.nombre}

Le recordamos que tiene una cita programada para mañana en General Therapy Clinic.

Fecha: ${cita.fecha}
Hora: ${cita.hora?.slice(0, 5)}

Por favor confirme su asistencia respondiendo a este mensaje.

L.R.T.F. Gabriel González Ramírez
General Therapy Clinic`;
  }

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <a href="/" style={styles.backButton}>← Regresar</a>

          <div style={styles.weekControls}>
            <button onClick={semanaAnterior} style={styles.controlButton}>‹</button>
            <button onClick={irHoy} style={styles.controlButton}>Hoy</button>
            <button onClick={semanaSiguiente} style={styles.controlButton}>›</button>
          </div>

          <a href="/citas/nueva" style={styles.newButton}>+ Nueva cita</a>
        </div>

        <section style={styles.hero}>
          <p style={styles.heroLabel}>AGENDA CLÍNICA</p>
          <h1 style={styles.title}>Calendario semanal</h1>
          <p style={styles.subtitle}>{mesAnio(dias[0])}</p>
        </section>

        <section style={styles.calendar}>
          <div style={styles.headerCorner}>Hora</div>

          {dias.map((dia) => (
            <div key={formatoFecha(dia)} style={styles.dayHeader}>
              <div style={styles.dayName}>{nombreDia(dia)}</div>
              <div style={styles.dayNumber}>{numeroDia(dia)}</div>
            </div>
          ))}

         {horarios.map((hora) => (
  <div key={`fila-${hora}`} style={{ display: "contents" }}>
    <div key={`hora-${hora}`} style={styles.hourCell}>
      {hora}
    </div>

    {dias.map((dia) => {
      const fechaTexto = formatoFecha(dia);
      const citasCelda = citasPorCelda(dia, hora);

      return (
        <div key={`${fechaTexto}-${hora}`} style={styles.cell}>
          {citasCelda.map((cita) => (
            <button
              key={cita.id}
              onClick={() => setCitaSeleccionada(cita)}
              style={{
                ...styles.appointment,
                borderLeft: `6px solid ${colorEstado(cita.estado)}`,
              }}
            >
              <strong>{cita.pacientes?.nombre || "Paciente"}</strong>
              <span>{cita.motivo || "Sin motivo"}</span>
              <small>{cita.estado || "Pendiente"}</small>
            </button>
          ))}

          {citasCelda.length < 4 && (
            <a
              href={`/citas/nueva?fecha=${fechaTexto}&hora=${hora}`}
              style={styles.addMini}
            >
              +
            </a>
          )}
        </div>
      );
    })}
  </div>
))}
        </section>
      </div>

      {citaSeleccionada && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <button
              onClick={() => setCitaSeleccionada(null)}
              style={styles.closeButton}
            >
              ×
            </button>

            <h2 style={styles.modalTitle}>
              {citaSeleccionada.pacientes?.nombre || "Paciente"}
            </h2>

            <p style={styles.modalText}>
              {citaSeleccionada.fecha} · {citaSeleccionada.hora?.slice(0, 5)}
            </p>

            <p style={styles.modalText}>
              {citaSeleccionada.motivo || "Sin motivo registrado"}
            </p>

            <span
              style={{
                ...styles.statusBadge,
                background: colorEstado(citaSeleccionada.estado),
              }}
            >
              {citaSeleccionada.estado || "Pendiente"}
            </span>

            <div style={styles.modalActions}>
              <button onClick={() => cambiarEstado(citaSeleccionada.id, "Confirmada")} style={boton("#2563eb")}>
                Confirmar
              </button>

              <button onClick={() => cambiarEstado(citaSeleccionada.id, "Asistió")} style={boton("#16a34a")}>
                Asistió
              </button>

              <button onClick={() => cambiarEstado(citaSeleccionada.id, "No asistió")} style={boton("#64748b")}>
                No asistió
              </button>

              <button onClick={() => cambiarEstado(citaSeleccionada.id, "Cancelada")} style={boton("#dc2626")}>
                Cancelar
              </button>

              <button onClick={() => eliminarCita(citaSeleccionada.id)} style={boton("#991b1b")}>
                Eliminar
              </button>

              <a href={`/pacientes/expediente/${citaSeleccionada.paciente_id}`} style={link("#0b5cff")}>
                Expediente
              </a>

              <a href={`/citas/editar/${citaSeleccionada.id}`} style={link("#facc15", "#111827")}>
                Editar
              </a>

              {telefonoWhats(citaSeleccionada) && (
                <a
                  href={`https://api.whatsapp.com/send?phone=${telefonoWhats(citaSeleccionada)}&text=${encodeURIComponent(mensajeWhats(citaSeleccionada))}`}
                  target="_self"
                  style={link("#22c55e")}
                >
                  WhatsApp
                </a>
              )}

              {telefonoWhats(citaSeleccionada) && (
                <a
                  href={`https://api.whatsapp.com/send?phone=${telefonoWhats(citaSeleccionada)}&text=${encodeURIComponent(mensajeManana(citaSeleccionada))}`}
                  target="_self"
                  style={link("#15803d")}
                >
                  Recordar mañana
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function boton(color: string) {
  return {
    background: color,
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "12px",
    fontWeight: "900",
    cursor: "pointer",
  };
}

function link(bg: string, color = "white") {
  return {
    background: bg,
    color,
    padding: "12px",
    borderRadius: "12px",
    fontWeight: "900",
    textDecoration: "none",
    textAlign: "center" as const,
  };
}

const styles: any = {
  main: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top left,#0b5cff 0%,#020617 34%,#111827 100%)",
    padding: "28px",
  },
  container: {
    maxWidth: "1600px",
    margin: "0 auto",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    gap: "12px",
    flexWrap: "wrap",
  },
  backButton: {
    background: "rgba(255,255,255,0.12)",
    color: "white",
    padding: "12px 18px",
    borderRadius: "14px",
    fontWeight: "900",
    textDecoration: "none",
  },
  weekControls: {
    display: "flex",
    gap: "10px",
  },
  controlButton: {
    background: "#0f172a",
    color: "white",
    border: "1px solid rgba(125,211,252,0.25)",
    borderRadius: "12px",
    padding: "10px 18px",
    fontWeight: "900",
    cursor: "pointer",
  },
  newButton: {
    background: "white",
    color: "#0b5cff",
    padding: "12px 20px",
    borderRadius: "14px",
    fontWeight: "900",
    textDecoration: "none",
  },
  hero: {
    background: "linear-gradient(90deg,#020617,#0f2f68,#0088ff)",
    padding: "30px",
    borderRadius: "30px",
    marginBottom: "24px",
    color: "white",
  },
  heroLabel: {
    color: "#7dd3fc",
    fontWeight: "900",
    letterSpacing: "2px",
    margin: 0,
  },
  title: {
    fontSize: "46px",
    margin: "8px 0",
    fontWeight: "900",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: "18px",
  },
  calendar: {
    display: "grid",
    gridTemplateColumns: "80px repeat(6, minmax(160px, 1fr))",
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(125,211,252,0.22)",
    borderRadius: "24px",
    overflow: "hidden",
  },
  headerCorner: {
    background: "#020617",
    color: "#93c5fd",
    padding: "14px",
    fontWeight: "900",
    textAlign: "center",
  },
  dayHeader: {
    background: "#020617",
    color: "white",
    padding: "12px",
    borderLeft: "1px solid rgba(125,211,252,0.12)",
    textAlign: "center",
  },
  dayName: {
    color: "#7dd3fc",
    fontSize: "13px",
    fontWeight: "900",
  },
  dayNumber: {
    fontSize: "28px",
    fontWeight: "900",
  },
  hourCell: {
    minHeight: "110px",
    background: "rgba(2,6,23,0.75)",
    color: "#cbd5e1",
    padding: "12px",
    borderTop: "1px solid rgba(125,211,252,0.12)",
    fontWeight: "900",
  },
  cell: {
    minHeight: "110px",
    padding: "8px",
    borderTop: "1px solid rgba(125,211,252,0.12)",
    borderLeft: "1px solid rgba(125,211,252,0.12)",
    position: "relative",
  },
  appointment: {
    width: "100%",
    background: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "8px",
    marginBottom: "7px",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    fontSize: "12px",
  },
  addMini: {
    position: "absolute",
    right: "8px",
    bottom: "8px",
    background: "rgba(255,255,255,0.12)",
    color: "#7dd3fc",
    width: "24px",
    height: "24px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    fontWeight: "900",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.70)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    zIndex: 9999,
  },
  modal: {
    width: "100%",
    maxWidth: "520px",
    background: "#020617",
    border: "1px solid rgba(125,211,252,0.25)",
    borderRadius: "28px",
    padding: "28px",
    color: "white",
    position: "relative",
    boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
  },
  closeButton: {
    position: "absolute",
    top: "18px",
    right: "18px",
    background: "rgba(255,255,255,0.12)",
    color: "white",
    border: "none",
    borderRadius: "999px",
    width: "34px",
    height: "34px",
    cursor: "pointer",
    fontSize: "22px",
  },
  modalTitle: {
    fontSize: "30px",
    marginBottom: "8px",
  },
  modalText: {
    color: "#cbd5e1",
    fontWeight: "700",
  },
  statusBadge: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: "999px",
    fontWeight: "900",
    margin: "12px 0 18px",
  },
  modalActions: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px",
  },
};