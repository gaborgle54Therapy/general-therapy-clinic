"use client";
import { useState } from "react";
import { supabase } from "../../../lib/lib/supabase";
export default function NuevoPaciente() {
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [sexo, setSexo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [guardando, setGuardando] = useState(false);
  async function guardarPaciente(redirigirHistoria: boolean = false) {
    if (guardando) return;
    if (!nombre.trim() || !edad || !sexo) {
      alert("Completa nombre, edad y sexo");
      return;
    }
    setGuardando(true);
    const { data, error } = await supabase
      .from("pacientes")
      .insert([
        {
          nombre: nombre.trim(),
          edad: Number(edad),
          sexo,
          telefono: telefono.trim(),
        },
      ])
      .select()
      .single();
    if (error) {
      setGuardando(false);
      console.log(error);
      alert("Error al guardar paciente: " + error.message);
      return;
    }
    alert("Paciente guardado correctamente");
    if (redirigirHistoria) {
      window.location.href = `/historias/nueva?nuevoPacienteId=${data.id}`;
      return;
    }
    window.location.href = "/pacientes";
  }
  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.backBox}>
          <a href="/pacientes" style={styles.backButton}>
            ← Regresar
          </a>
        </div>
        <section style={styles.hero}>
          <p style={styles.heroLabel}>REGISTRO CLÍNICO</p>
          <h1 style={styles.title}>Nuevo Paciente</h1>
          <p style={styles.subtitle}>
            Captura los datos principales del paciente para iniciar su expediente clínico.
          </p>
        </section>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Datos generales</h2>
          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del paciente"
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>Edad</label>
              <input
                type="number"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                placeholder="Edad"
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
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Teléfono o WhatsApp"
                style={styles.input}
              />
            </div>
          </div>
        </section>
        <section style={styles.actionsCard}>
          <button
            onClick={() => guardarPaciente(false)}
            disabled={guardando}
            style={{
              ...styles.primaryButton,
              opacity: guardando ? 0.7 : 1,
              cursor: guardando ? "not-allowed" : "pointer",
            }}
          >
            {guardando ? "Guardando..." : "Guardar Paciente"}
          </button>
          <button
            onClick={() => guardarPaciente(true)}
            disabled={guardando}
            style={{
              ...styles.secondaryButton,
              opacity: guardando ? 0.7 : 1,
              cursor: guardando ? "not-allowed" : "pointer",
            }}
          >
            Guardar y crear historia clínica
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
    maxWidth: "1000px",
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
    maxWidth: "720px",
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
    background: "#7c3aed",
    color: "white",
    padding: "16px 26px",
    borderRadius: "16px",
    border: "none",
    fontWeight: "900",
    fontSize: "16px",
    boxShadow: "0 10px 30px rgba(124,58,237,0.35)",
  },
};