"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/lib/supabase";
export default function EditarCita() {
  const params = useParams();
  const id = params.id as string;
  const [paciente, setPaciente] = useState("");
  const [pacienteId, setPacienteId] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [motivo, setMotivo] = useState("");
  const [estado, setEstado] = useState("Pendiente");
  const [notas, setNotas] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  useEffect(() => {
    if (id) {
      cargarCita();
    }
  }, [id]);
  async function cargarCita() {
    const { data, error } = await supabase
      .from("citas")
      .select("*")
      .eq("id", Number(id))
      .single();
    if (error) {
      alert("Error al cargar cita: " + error.message);
      setCargando(false);
      return;
    }
    setPacienteId(String(data.paciente_id || ""));
    setFecha(data.fecha || "");
    setHora(data.hora?.slice(0, 5) || "");
    setMotivo(data.motivo || "");
    setEstado(data.estado || "Pendiente");
    setNotas(data.notas || "");
    const { data: pacienteData } = await supabase
      .from("pacientes")
      .select("nombre")
      .eq("id", Number(data.paciente_id))
      .single();
    setPaciente(pacienteData?.nombre || "Paciente sin nombre");
    setCargando(false);
  }
  async function guardarCambios() {
    if (guardando) return;
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
    const { error } = await supabase
      .from("citas")
      .update({
        fecha,
        hora: horaNormalizada,
        motivo,
        estado,
        notas,
      })
      .eq("id", Number(id));
    if (error) {
      setGuardando(false);
      alert("Error al actualizar cita: " + error.message);
      return;
    }
    alert("Cita actualizada correctamente");
    window.location.href = `/citas/calendario?fecha=${fecha}`;
  }
  async function eliminarCita() {
    const confirmar = confirm("¿Seguro que deseas eliminar esta cita?");
    if (!confirmar) return;
    const { error } = await supabase
      .from("citas")
      .delete()
      .eq("id", Number(id));
    if (error) {
      alert("Error al eliminar cita: " + error.message);
      return;
    }
    alert("Cita eliminada correctamente");
    window.location.href = `/citas/calendario?fecha=${fecha}`;
  }
  if (cargando) {
    return (
      <main style={styles.main}>
        <div style={styles.loading}>Cargando cita...</div>
      </main>
    );
  }
  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.backBox}>
          <a href={`/citas/calendario?fecha=${fecha}`} style={styles.backButton}>
            ← Regresar al calendario
          </a>
        </div>
        <section style={styles.hero}>
          <div>
            <p style={styles.heroLabel}>AGENDA CLÍNICA</p>
            <h1 style={styles.title}>Editar Cita</h1>
            <p style={styles.subtitle}>
              Paciente: <strong>{paciente}</strong>
            </p>
          </div>
          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Estado actual</p>
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
              <input value={paciente} disabled style={{ ...styles.input, opacity: 0.65 }} />
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
            <label style={styles.label}>Motivo</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              style={styles.textarea}
            />
          </div>
          <div>
            <label style={styles.label}>Notas</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              style={styles.textarea}
            />
          </div>
        </section>
        <section style={styles.actionsCard}>
          <button
            onClick={eliminarCita}
            style={styles.deleteButton}
          >
            Eliminar cita
          </button>
          <button
            onClick={guardarCambios}
            disabled={guardando}
            style={{
              ...styles.primaryButton,
              opacity: guardando ? 0.7 : 1,
              cursor: guardando ? "not-allowed" : "pointer",
            }}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
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
    padding: "35px",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  loading: {
    color: "white",
    fontSize: "24px",
    fontWeight: "900",
    textAlign: "center",
    paddingTop: "100px",
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
    borderRadius: "35px",
    padding: "38px",
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
    fontSize: "52px",
    fontWeight: "900",
    color: "white",
    margin: 0,
  },
  subtitle: {
    color: "#dbeafe",
    marginTop: "12px",
    fontSize: "17px",
    fontWeight: "600",
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
    borderRadius: "30px",
    padding: "30px",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
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
  deleteButton: {
    background: "#dc2626",
    color: "white",
    padding: "16px 26px",
    borderRadius: "16px",
    border: "none",
    fontWeight: "900",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(220,38,38,0.30)",
  },
};