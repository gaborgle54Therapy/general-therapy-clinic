"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/lib/supabase";
export default function EliminarPaciente() {
  const params = useParams();
  const id = params.id as string;
  const [paciente, setPaciente] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [eliminando, setEliminando] = useState(false);
  useEffect(() => {
    cargarPaciente();
  }, []);
  async function cargarPaciente() {
    const { data, error } = await supabase
      .from("pacientes")
      .select("*")
      .eq("id", Number(id))
      .single();
    if (error) {
      alert("Error al cargar paciente: " + error.message);
      setCargando(false);
      return;
    }
    setPaciente(data);
    setCargando(false);
  }
  async function eliminarPaciente() {
    if (eliminando) return;
    const confirmar1 = confirm(
      "¿Seguro que deseas eliminar este paciente? Esta acción no se puede deshacer."
    );
    if (!confirmar1) return;
    const confirmar2 = confirm(
      "Confirmación final: también se eliminarán sus citas, historia clínica, evoluciones y estudios relacionados."
    );
    if (!confirmar2) return;
    setEliminando(true);
    await supabase.from("citas").delete().eq("paciente_id", Number(id));
    await supabase.from("historia_clinica").delete().eq("paciente_id", Number(id));
    await supabase.from("evolucion").delete().eq("paciente_id", Number(id));
    await supabase.from("estudios").delete().eq("paciente_id", Number(id));
    const { error } = await supabase
      .from("pacientes")
      .delete()
      .eq("id", Number(id));
    if (error) {
      setEliminando(false);
      alert("Error al eliminar paciente: " + error.message);
      return;
    }
    alert("Paciente eliminado correctamente");
    window.location.href = "/pacientes";
  }
  if (cargando) {
    return (
      <main style={styles.main}>
        <div style={styles.loading}>Cargando paciente...</div>
      </main>
    );
  }
  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <p style={styles.label}>ELIMINAR PACIENTE</p>
        <h1 style={styles.title}>
          {paciente?.nombre || "Paciente"}
        </h1>
        <p style={styles.warning}>
          Esta acción eliminará permanentemente el paciente y sus registros clínicos relacionados.
        </p>
        <div style={styles.details}>
          <p><strong>Edad:</strong> {paciente?.edad || "—"}</p>
          <p><strong>Sexo:</strong> {paciente?.sexo || "—"}</p>
          <p><strong>Teléfono:</strong> {paciente?.telefono || "—"}</p>
        </div>
        <div style={styles.actions}>
          <a href="/pacientes" style={styles.cancelButton}>
            Cancelar
          </a>
          <button
            onClick={eliminarPaciente}
            disabled={eliminando}
            style={{
              ...styles.deleteButton,
              opacity: eliminando ? 0.7 : 1,
              cursor: eliminando ? "not-allowed" : "pointer",
            }}
          >
            {eliminando ? "Eliminando..." : "Sí, eliminar paciente"}
          </button>
        </div>
      </div>
    </main>
  );
}
const styles: any = {
  main: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left,#dc2626 0%,#020617 35%,#111827 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "35px",
  },
  loading: {
    color: "white",
    fontSize: "24px",
    fontWeight: "900",
  },
  card: {
    maxWidth: "760px",
    width: "100%",
    background: "rgba(15,23,42,0.94)",
    borderRadius: "34px",
    padding: "42px",
    border: "1px solid rgba(248,113,113,0.35)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
    textAlign: "center",
  },
  label: {
    color: "#fca5a5",
    fontWeight: "900",
    letterSpacing: "2px",
    marginBottom: "12px",
  },
  title: {
    color: "white",
    fontSize: "46px",
    fontWeight: "900",
    margin: 0,
  },
  warning: {
    color: "#fecaca",
    fontSize: "17px",
    fontWeight: "700",
    marginTop: "18px",
    lineHeight: 1.6,
  },
  details: {
    background: "#0f172a",
    color: "#e2e8f0",
    borderRadius: "22px",
    padding: "22px",
    marginTop: "28px",
    textAlign: "left",
    border: "1px solid rgba(248,113,113,0.20)",
  },
  actions: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "center",
    gap: "14px",
    flexWrap: "wrap",
  },
  cancelButton: {
    background: "rgba(255,255,255,0.10)",
    color: "white",
    padding: "15px 22px",
    borderRadius: "16px",
    textDecoration: "none",
    fontWeight: "900",
    border: "1px solid rgba(255,255,255,0.18)",
  },
  deleteButton: {
    background: "#dc2626",
    color: "white",
    padding: "15px 24px",
    borderRadius: "16px",
    border: "none",
    fontWeight: "900",
    fontSize: "15px",
    boxShadow: "0 10px 30px rgba(220,38,38,0.35)",
  },
};