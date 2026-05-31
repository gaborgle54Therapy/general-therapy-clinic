"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/lib/supabase";
import { useParams } from "next/navigation";
export default function EditarPaciente() {
  const params = useParams();
  const id = params.id as string;
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [sexo, setSexo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
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
    setNombre(data.nombre || "");
    setEdad(String(data.edad || ""));
    setSexo(data.sexo || "");
    setTelefono(data.telefono || "");
    setCargando(false);
  }
  async function guardarCambios() {
    if (guardando) return;
    if (!nombre.trim()) {
      alert("Escribe el nombre del paciente");
      return;
    }
    if (!edad) {
      alert("Escribe la edad del paciente");
      return;
    }
    if (!sexo) {
      alert("Selecciona el sexo del paciente");
      return;
    }
    setGuardando(true);
    const { error } = await supabase
      .from("pacientes")
      .update({
        nombre: nombre.trim(),
        edad: Number(edad),
        sexo,
        telefono: telefono.trim(),
      })
      .eq("id", Number(id));
    if (error) {
      setGuardando(false);
      alert("Error al guardar cambios: " + error.message);
      return;
    }
    alert("Paciente actualizado correctamente");
    window.location.href = `/pacientes/expediente/${id}`;
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
      <div style={styles.container}>
        <div style={styles.backBox}>
          <a href={`/pacientes/expediente/${id}`} style={styles.backButton}>
            ← Regresar al expediente
          </a>
        </div>
        <section style={styles.hero}>
          <p style={styles.heroLabel}>EDITAR PACIENTE</p>
          <h1 style={styles.title}>{nombre || "Paciente"}</h1>
          <p style={styles.subtitle}>
            Modifica los datos generales del paciente.
          </p>
        </section>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Datos generales</h2>
          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Nombre completo</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>Edad</label>
              <input
                type="number"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>Sexo</label>
              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                style={styles.input}
              >
                <option value="">Seleccionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Teléfono</label>
              <input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>
        </section>
        <section style={styles.actionsCard}>
          <a href={`/pacientes/expediente/${id}`} style={styles.cancelButton}>
            Cancelar
          </a>
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
  cancelButton: {
    background: "rgba(255,255,255,0.10)",
    color: "white",
    padding: "16px 24px",
    borderRadius: "16px",
    border: "1px solid rgba(125,211,252,0.25)",
    textDecoration: "none",
    fontWeight: "900",
    fontSize: "15px",
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
};