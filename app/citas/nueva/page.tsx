"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/lib/supabase";

export default function NuevaCitaPage() {
  return (
    <Suspense fallback={<div style={{ color: "white", padding: "40px" }}>Cargando...</div>}>
      <NuevaCita />
    </Suspense>
  );
}

function NuevaCita() {
  const searchParams = useSearchParams();

  const [pacientes, setPacientes] = useState<any[]>([]);
  const [idDelPaciente, setIdDelPaciente] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [motivo, setMotivo] = useState("");
  const [estado, setEstado] = useState("Pendiente");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    obtenerPacientes();

    const fechaUrl = searchParams.get("fecha");
    const horaUrl = searchParams.get("hora");
    const pacienteUrl = searchParams.get("pacienteId");

    if (fechaUrl) setFecha(fechaUrl);
    if (horaUrl) setHora(horaUrl);
    if (pacienteUrl) setIdDelPaciente(pacienteUrl);
  }, [searchParams]);

  async function obtenerPacientes() {
    const { data, error } = await supabase
      .from("pacientes")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      alert("Error al cargar pacientes: " + error.message);
      return;
    }

    setPacientes(data || []);
  }

  async function guardarCita() {
    if (guardando) return;

    if (!idDelPaciente) {
      alert("Selecciona un paciente");
      return;
    }

    if (!fecha) {
      alert("Selecciona una fecha");
      return;
    }

    if (!hora) {
      alert("Selecciona una hora");
      return;
    }

    setGuardando(true);

    const horaNormalizada = hora.length === 5 ? `${hora}:00` : hora;

    const { count, error: errorConteo } = await supabase
      .from("citas")
      .select("*", { count: "exact", head: true })
      .eq("fecha", fecha)
      .eq("hora", horaNormalizada);

    if (errorConteo) {
      setGuardando(false);
      alert("Error al revisar disponibilidad: " + errorConteo.message);
      return;
    }

    if ((count || 0) >= 4) {
      setGuardando(false);
      alert("Este horario ya tiene 4 pacientes agendados");
      return;
    }

    const { error } = await supabase.from("citas").insert([
      {
        paciente_id: Number(idDelPaciente),
        fecha,
        hora: horaNormalizada,
        motivo,
        estado,
        notas,
      },
    ]);

    if (error) {
      setGuardando(false);
      console.log(error);
      alert("Error al guardar cita: " + error.message);
      return;
    }

    alert("Cita guardada correctamente");
    window.location.href = `/citas/calendario?fecha=${fecha}`;
  }

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.backBox}>
          <a href={`/citas/calendario${fecha ? `?fecha=${fecha}` : ""}`} style={styles.backButton}>
            ← Regresar al calendario
          </a>
        </div>

        <section style={styles.hero}>
          <div>
            <p style={styles.heroLabel}>AGENDA CLÍNICA</p>

            <h1 style={styles.title}>Nueva Cita</h1>

            <p style={styles.subtitle}>
              Agenda una sesión, valida disponibilidad y regresa automáticamente al calendario.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Estado inicial</p>
            <span style={{ ...styles.statusBadge, backgroundColor: colorEstado(estado) }}>
              {estado}
            </span>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Datos de la cita</h2>

          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Paciente</label>

              <select
                value={idDelPaciente}
                onChange={(e) => setIdDelPaciente(e.target.value)}
                style={styles.input}
              >
                <option value="">Seleccionar paciente</option>

                {pacientes.map((paciente) => (
                  <option key={paciente.id} value={paciente.id}>
                    {paciente.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>Fecha</label>

              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Hora</label>

              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Estado</label>

              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                style={styles.input}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Asistió">Asistió</option>
                <option value="No asistió">No asistió</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Motivo y notas</h2>

          <div style={{ marginBottom: "22px" }}>
            <label style={styles.label}>Motivo de la cita</label>

            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ejemplo: dolor lumbar, valoración inicial, seguimiento postquirúrgico..."
              style={styles.textarea}
            />
          </div>

          <div>
            <label style={styles.label}>Notas internas</label>

            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas adicionales para la sesión..."
              style={styles.textarea}
            />
          </div>
        </section>

        <section style={styles.actionsCard}>
          <a href="/pacientes/nuevo" style={styles.secondaryButton}>
            + Registrar paciente nuevo
          </a>

          <button
            onClick={guardarCita}
            disabled={guardando}
            style={{
              ...styles.primaryButton,
              opacity: guardando ? 0.7 : 1,
              cursor: guardando ? "not-allowed" : "pointer",
            }}
          >
            {guardando ? "Guardando..." : "Guardar Cita"}
          </button>
        </section>
      </div>
    </main>
  );
}

function colorEstado(estado: string) {
  if (estado === "Confirmada") return "#2563eb";
  if (estado === "Asistió") return "#16a34a";
  if (estado === "No asistió") return "#6b7280";
  if (estado === "Cancelada") return "#dc2626";
  return "#eab308";
}

const styles: any = {
  main: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left,#0b5cff 0%,#020617 35%,#111827 100%)",
    padding: "clamp(14px, 3vw, 35px)",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  backBox: {
    marginBottom: "22px",
  },

  backButton: {
    background: "rgba(255,255,255,0.10)",
    color: "white",
    padding: "12px 18px",
    borderRadius: "14px",
    fontWeight: "900",
    fontSize: "14px",
    textDecoration: "none",
    display: "inline-block",
    border: "1px solid rgba(125,211,252,0.25)",
  },

  hero: {
    background: "linear-gradient(90deg,#020617,#0f2f68,#0088ff)",
    borderRadius: "clamp(22px, 4vw, 35px)",
    padding: "clamp(22px, 4vw, 38px)",
    marginBottom: "28px",
    boxShadow: "0 0 55px rgba(0,102,255,0.35)",
    border: "1px solid rgba(125,211,252,0.25)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  heroLabel: {
    color: "#7dd3fc",
    fontWeight: "900",
    letterSpacing: "2px",
    marginBottom: "8px",
  },

  title: {
    fontSize: "clamp(34px, 6vw, 52px)",
    fontWeight: "900",
    color: "white",
    margin: 0,
  },

  subtitle: {
    color: "#dbeafe",
    marginTop: "12px",
    fontSize: "17px",
    fontWeight: "600",
    maxWidth: "720px",
  },

  statusBox: {
    background: "rgba(2,6,23,0.45)",
    border: "1px solid rgba(125,211,252,0.25)",
    borderRadius: "22px",
    padding: "18px",
    minWidth: "180px",
  },

  statusLabel: {
    color: "#cbd5e1",
    fontWeight: "800",
    marginBottom: "10px",
  },

  statusBadge: {
    color: "white",
    padding: "8px 14px",
    borderRadius: "999px",
    fontWeight: "900",
    display: "inline-block",
  },

  card: {
    background: "rgba(15,23,42,0.92)",
    borderRadius: "clamp(20px, 4vw, 30px)",
    padding: "clamp(18px, 3vw, 30px)",
    marginBottom: "26px",
    border: "1px solid rgba(125,211,252,0.18)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.35)",
  },

  sectionTitle: {
    color: "#67e8f9",
    fontSize: "28px",
    fontWeight: "900",
    marginBottom: "22px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
    gap: "18px",
  },

  label: {
    color: "#7dd3fc",
    fontWeight: "900",
  },

  input: {
    width: "100%",
    background: "#0f172a",
    color: "white",
    border: "1px solid rgba(125,211,252,0.18)",
    borderRadius: "18px",
    padding: "16px",
    marginTop: "10px",
    outline: "none",
    fontSize: "15px",
    fontWeight: "700",
  },

  textarea: {
    width: "100%",
    background: "#0f172a",
    color: "white",
    border: "1px solid rgba(125,211,252,0.18)",
    borderRadius: "18px",
    padding: "16px",
    marginTop: "10px",
    outline: "none",
    fontSize: "15px",
    minHeight: "120px",
    resize: "vertical",
  },

  actionsCard: {
    background: "rgba(15,23,42,0.92)",
    borderRadius: "26px",
    padding: "24px",
    border: "1px solid rgba(125,211,252,0.18)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "flex-end",
    gap: "14px",
    flexWrap: "wrap",
  },

  primaryButton: {
    background: "linear-gradient(90deg,#0b5cff,#06b6d4)",
    color: "white",
    padding: "16px 26px",
    borderRadius: "16px",
    border: "none",
    fontWeight: "900",
    fontSize: "16px",
    boxShadow: "0 10px 30px rgba(0,102,255,0.35)",
  },

  secondaryButton: {
    background: "rgba(255,255,255,0.10)",
    color: "white",
    padding: "16px 22px",
    borderRadius: "16px",
    border: "1px solid rgba(125,211,252,0.25)",
    textDecoration: "none",
    fontWeight: "900",
    fontSize: "15px",
  },
};