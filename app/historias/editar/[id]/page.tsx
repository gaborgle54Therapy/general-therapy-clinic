"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/lib/supabase";
export default function EditarHistoriaClinica() {
  const params = useParams();
  const id = params.id as string;
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [pacienteId, setPacienteId] = useState("");
  const [nombrePaciente, setNombrePaciente] = useState("");
  const [motivoConsulta, setMotivoConsulta] = useState("");
  const [dolorActual, setDolorActual] = useState("");
  const [escalaEva, setEscalaEva] = useState("");
  const [antecedentes, setAntecedentes] = useState("");
  const [medicamentos, setMedicamentos] = useState("");
  const [cirugias, setCirugias] = useState("");
  const [evaluacionFisica, setEvaluacionFisica] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [objetivos, setObjetivos] = useState("");
  const [planTratamiento, setPlanTratamiento] = useState("");
  const [pronostico, setPronostico] = useState("");
  useEffect(() => {
    cargarHistoria();
  }, []);
  async function cargarHistoria() {
    const { data, error } = await supabase
  .from("historia_clinica")
  .select("*")
  .eq("id", Number(id))
  .single();
    if (error) {
      alert("Error al cargar historia clínica: " + error.message);
      setCargando(false);
      return;
    }
    setPacienteId(String(data.paciente_id || ""));

const { data: pacienteData } = await supabase
  .from("pacientes")
  .select("nombre")
  .eq("id", Number(data.paciente_id))
  .single();

setNombrePaciente(pacienteData?.nombre || "");
    setMotivoConsulta(data.motivo_consulta || "");
    setDolorActual(data.dolor_actual || "");
    setEscalaEva(data.escala_eva !== null && data.escala_eva !== undefined ? String(data.escala_eva) : "");
    setAntecedentes(data.antecedentes || "");
    setMedicamentos(data.medicamentos || "");
    setCirugias(data.cirugias || "");
    setEvaluacionFisica(data.evaluacion_fisica || "");
    setDiagnostico(data.diagnostico || data.diagnostico_fisioterapeutico || "");
    setObjetivos(data.objetivos_tratamiento || "");
    setPlanTratamiento(data.plan_tratamiento || "");
    setPronostico(data.pronostico || "");
    setCargando(false);
  }
  async function guardarCambios() {
    if (guardando) return;
    if (!pacienteId) {
      alert("No se encontró el paciente de esta historia clínica");
      return;
    }
    setGuardando(true);
    const { error } = await supabase
      .from("historia_clinica")
      .update({
        motivo_consulta: motivoConsulta,
        dolor_actual: dolorActual,
        escala_eva: escalaEva ? Number(escalaEva) : null,
        antecedentes,
        medicamentos,
        cirugias,
        evaluacion_fisica: evaluacionFisica,
        diagnostico_fisioterapeutico: diagnostico,
        objetivos_tratamiento: objetivos,
        plan_tratamiento: planTratamiento,
        pronostico,
      })
      .eq("id", Number(id));
    if (error) {
      setGuardando(false);
      alert("Error al guardar cambios: " + error.message);
      return;
    }
    alert("Historia clínica actualizada correctamente");
    window.location.href = `/pacientes/expediente/${pacienteId}`;
  }
  if (cargando) {
    return (
      <main style={styles.main}>
        <div style={styles.loading}>Cargando historia clínica...</div>
      </main>
    );
  }
  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.backBox}>
          <a
            href={pacienteId ? `/pacientes/expediente/${pacienteId}` : "/pacientes"}
            style={styles.backButton}
          >
            ← Regresar al expediente
          </a>
        </div>
        <section style={styles.hero}>
          <p style={styles.heroLabel}>EDITAR HISTORIA CLÍNICA</p>
          <h1 style={styles.title}>Historia Clínica</h1>
          <p style={styles.subtitle}>
            {nombrePaciente
              ? `Paciente: ${nombrePaciente}`
              : "Actualización del registro clínico fisioterapéutico"}
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
              <label style={styles.label}>Escala EVA</label>
              <input
                type="number"
                min="0"
                max="10"
                value={escalaEva}
                onChange={(e) => setEscalaEva(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>
        </section>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Evaluación inicial</h2>
          <CampoGrande titulo="Motivo de consulta" valor={motivoConsulta} setValor={setMotivoConsulta} />
          <CampoGrande titulo="Dolor actual" valor={dolorActual} setValor={setDolorActual} />
          <CampoGrande titulo="Antecedentes" valor={antecedentes} setValor={setAntecedentes} />
          <CampoGrande titulo="Medicamentos" valor={medicamentos} setValor={setMedicamentos} />
          <CampoGrande titulo="Cirugías" valor={cirugias} setValor={setCirugias} />
        </section>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Valoración fisioterapéutica</h2>
          <CampoGrande titulo="Evaluación física" valor={evaluacionFisica} setValor={setEvaluacionFisica} alto="180px" />
          <CampoGrande titulo="Diagnóstico fisioterapéutico" valor={diagnostico} setValor={setDiagnostico} />
          <CampoGrande titulo="Objetivos de tratamiento" valor={objetivos} setValor={setObjetivos} />
          <CampoGrande titulo="Plan de tratamiento" valor={planTratamiento} setValor={setPlanTratamiento} alto="180px" />
          <CampoGrande titulo="Pronóstico" valor={pronostico} setValor={setPronostico} />
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