"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/lib/supabase";
export default function EditarEvolucion() {
  const params = useParams();
  const id = params.id as string;
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [pacienteId, setPacienteId] = useState("");
  const [nombrePaciente, setNombrePaciente] = useState("");
  const [fecha, setFecha] = useState("");
  const [eva, setEva] = useState(0);
  const [dolorActual, setDolorActual] = useState("");
  const [tratamientoRealizado, setTratamientoRealizado] = useState("");
  const [ejercicios, setEjercicios] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [frecuenciaCardiaca, setFrecuenciaCardiaca] = useState("");
  const [presionArterial, setPresionArterial] = useState("");
  const [temperatura, setTemperatura] = useState("");
  const [saturacionOxigeno, setSaturacionOxigeno] = useState("");
  const [progreso, setProgreso] = useState("");
  const [proximaCita, setProximaCita] = useState("");
  useEffect(() => {
    cargarEvolucion();
  }, []);
  async function cargarEvolucion() {
    const { data, error } = await supabase
      .from("evolucion")
      .select("*")
      .eq("id", Number(id))
      .single();
    if (error) {
      alert("Error al cargar evolución: " + error.message);
      setCargando(false);
      return;
    }
    setPacienteId(String(data.paciente_id || ""));
    setFecha(data.fecha || "");
    setEva(data.eva ?? 0);
    setDolorActual(data.dolor_actual || "");
    setTratamientoRealizado(data.tratamiento_realizado || "");
    setEjercicios(data.ejercicios || "");
    setObservaciones(data.observaciones || "");
    setFrecuenciaCardiaca(data.frecuencia_cardiaca || "");
    setPresionArterial(data.presion_arterial || "");
    setTemperatura(data.temperatura || "");
    setSaturacionOxigeno(data.saturacion_oxigeno || "");
    setProgreso(data.progreso || "");
    setProximaCita(data.proxima_cita || "");
    const { data: pacienteData } = await supabase
      .from("pacientes")
      .select("nombre")
      .eq("id", Number(data.paciente_id))
      .single();
    setNombrePaciente(pacienteData?.nombre || "");
    setCargando(false);
  }
  async function guardarCambios() {
    if (guardando) return;
    if (!pacienteId) {
      alert("No se encontró el paciente de esta evolución");
      return;
    }
    if (!fecha) {
      alert("Selecciona la fecha");
      return;
    }
    setGuardando(true);
    const { error } = await supabase
      .from("evolucion")
      .update({
        paciente_id: Number(pacienteId),
        fecha,
        dolor_actual: dolorActual,
        tratamiento_realizado: tratamientoRealizado,
        ejercicios,
        observaciones,
        frecuencia_cardiaca: frecuenciaCardiaca,
        presion_arterial: presionArterial,
        temperatura,
        saturacion_oxigeno: saturacionOxigeno,
        progreso,
        proxima_cita: proximaCita,
      })
      .eq("id", Number(id));
    if (error) {
      setGuardando(false);
      alert("Error al guardar cambios: " + error.message);
      return;
    }
    alert("Evolución actualizada correctamente");
    window.location.href = `/pacientes/expediente/${pacienteId}`;
  }
  if (cargando) {
    return (
      <main style={styles.main}>
        <div style={styles.loading}>Cargando evolución...</div>
      </main>
    );
  }
  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.backBox}>
          <a
            href={pacienteId ? `/pacientes/expediente/${pacienteId}` : "/evolucion"}
            style={styles.backButton}
          >
            ← Regresar al expediente
          </a>
        </div>
        <section style={styles.hero}>
          <p style={styles.heroLabel}>EDITAR EVOLUCIÓN CLÍNICA</p>
          <h1 style={styles.title}>Evolución Clínica</h1>
          <p style={styles.subtitle}>
            {nombrePaciente
              ? `Paciente: ${nombrePaciente}`
              : "Actualización del seguimiento fisioterapéutico"}
          </p>
        </section>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Datos generales</h2>
          <div style={styles.grid}>
            <div>
              <label style={styles.label}>ID del paciente</label>
              <input
                type="number"
                value={pacienteId}
                disabled
                style={{ ...styles.input, opacity: 0.65 }}
              />
            </div>
            <div>
              <label style={styles.label}>Fecha evolución</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>
        </section>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Escala EVA</h2>
          <div style={styles.evaBox}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((numero) => (
              <button
                key={numero}
                onClick={() => setEva(numero)}
                style={{
                  ...styles.evaButton,
                  background:
                    eva === numero
                      ? "linear-gradient(90deg,#0b5cff,#06b6d4)"
                      : "#0f172a",
                  boxShadow:
                    eva === numero
                      ? "0 0 20px rgba(6,182,212,0.55)"
                      : "none",
                }}
              >
                {numero}
              </button>
            ))}
          </div>
        </section>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Signos vitales</h2>
          <div style={styles.grid}>
            <Input
              titulo="Frecuencia cardiaca"
              valor={frecuenciaCardiaca}
              setValor={setFrecuenciaCardiaca}
            />
            <Input
              titulo="Presión arterial"
              valor={presionArterial}
              setValor={setPresionArterial}
            />
            <Input
              titulo="Temperatura"
              valor={temperatura}
              setValor={setTemperatura}
            />
            <Input
              titulo="Saturación oxígeno"
              valor={saturacionOxigeno}
              setValor={setSaturacionOxigeno}
            />
          </div>
        </section>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Evolución terapéutica</h2>
          <CampoGrande
            titulo="Dolor actual"
            valor={dolorActual}
            setValor={setDolorActual}
          />
          <CampoGrande
            titulo="Tratamiento realizado"
            valor={tratamientoRealizado}
            setValor={setTratamientoRealizado}
            alto="180px"
          />
          <CampoGrande
            titulo="Ejercicios realizados"
            valor={ejercicios}
            setValor={setEjercicios}
          />
          <CampoGrande
            titulo="Observaciones"
            valor={observaciones}
            setValor={setObservaciones}
          />
          <CampoGrande
            titulo="Progreso del paciente"
            valor={progreso}
            setValor={setProgreso}
          />
        </section>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Próxima cita</h2>
          <input
            type="date"
            value={proximaCita}
            onChange={(e) => setProximaCita(e.target.value)}
            style={styles.input}
          />
        </section>
        <section style={styles.actionsCard}>
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
function Input({ titulo, valor, setValor }: any) {
  return (
    <div>
      <label style={styles.label}>{titulo}</label>
      <input
        type="text"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        style={styles.input}
      />
    </div>
  );
}
function CampoGrande({ titulo, valor, setValor, alto = "130px" }: any) {
  return (
    <div style={{ marginBottom: "22px" }}>
      <label style={styles.label}>{titulo}</label>
      <textarea
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        style={{
          ...styles.textarea,
          height: alto,
        }}
      />
    </div>
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
    maxWidth: "1400px",
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
    resize: "vertical",
  },
  evaBox: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  evaButton: {
    width: "55px",
    height: "55px",
    borderRadius: "16px",
    border: "1px solid rgba(125,211,252,0.18)",
    color: "white",
    fontWeight: "900",
    fontSize: "18px",
    cursor: "pointer",
  },
  actionsCard: {
    background: "rgba(15,23,42,0.92)",
    borderRadius: "26px",
    padding: "24px",
    border: "1px solid rgba(125,211,252,0.18)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "flex-end",
  },
  primaryButton: {
    background: "linear-gradient(90deg,#0b5cff,#06b6d4)",
    color: "white",
    padding: "16px 28px",
    borderRadius: "16px",
    border: "none",
    fontWeight: "900",
    fontSize: "16px",
    boxShadow: "0 10px 30px rgba(0,102,255,0.35)",
  },
};