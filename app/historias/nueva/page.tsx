"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/lib/supabase";

export default function NuevaHistoriaClinicaPage() {
  return (
    <Suspense
      fallback={
        <div style={{ color: "white", padding: "40px" }}>
          Cargando...
        </div>
      }
    >
      <NuevaHistoriaClinica />
    </Suspense>
  );
}

function NuevaHistoriaClinica() {

  const searchParams = useSearchParams();
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

    const idUrl = searchParams.get("nuevoPacienteId");

    if (idUrl) {
      setPacienteId(idUrl);
      cargarPaciente(idUrl);
    }

  }, [searchParams]);

  async function cargarPaciente(id: string) {

    const { data, error } = await supabase
      .from("pacientes")
      .select("nombre")
      .eq("id", Number(id))
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setNombrePaciente(data?.nombre || "");
  }

  async function guardarHistoria() {

    if (!pacienteId) {
      alert("Falta el ID del paciente");
      return;
    }

    const { error } = await supabase
      .from("historia_clinica")
      .insert([
        {
          paciente_id: Number(pacienteId),
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
          pronostico: pronostico,
        },
      ]);

    if (error) {
      console.log(error);
      alert("Error al guardar historia clínica: " + error.message);
      return;
    }

    alert("Historia clínica guardada correctamente");

    window.location.href = `/pacientes/expediente/${pacienteId}`;
  }

  const cardStyle = {
    background: "rgba(15,23,42,0.92)",
    borderRadius: "30px",
    padding: "30px",
    border: "1px solid rgba(125,211,252,0.18)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.35)",
    marginBottom: "28px",
  };

  const inputStyle = {
    width: "100%",
    background: "#0f172a",
    color: "white",
    border: "1px solid rgba(125,211,252,0.18)",
    borderRadius: "18px",
    padding: "16px",
    marginTop: "10px",
    outline: "none",
    fontSize: "15px",
  };

  return (

    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left,#0b5cff 0%,#020617 35%,#111827 100%)",
        padding: "35px",
      }}
    >

      <div style={{ maxWidth: "1500px", margin: "0 auto" }}>

        {/* BOTON REGRESAR */}

        <div style={{ marginBottom: "22px" }}>
          <a
            href="/pacientes"
            style={{
              background: "rgba(255,255,255,0.10)",
              color: "white",
              padding: "12px 18px",
              borderRadius: "14px",
              fontWeight: "900",
              fontSize: "14px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            ← Regresar
          </a>
        </div>

        {/* HEADER */}

        <div
          style={{
            background: "linear-gradient(90deg,#020617,#0f2f68,#0088ff)",
            borderRadius: "35px",
            padding: "38px",
            marginBottom: "30px",
            boxShadow: "0 0 55px rgba(0,102,255,0.35)",
            border: "1px solid rgba(125,211,252,0.25)",
          }}
        >

          <p
            style={{
              color: "#7dd3fc",
              fontWeight: "900",
              letterSpacing: "2px",
              marginBottom: "8px",
            }}
          >
            HISTORIA CLÍNICA
          </p>

          <h1
            style={{
              fontSize: "52px",
              fontWeight: "900",
              color: "white",
              margin: 0,
            }}
          >
            General Therapy Clinic
          </h1>

          <p
            style={{
              color: "#dbeafe",
              marginTop: "14px",
              fontWeight: "600",
            }}
          >
            {nombrePaciente
              ? `Paciente: ${nombrePaciente}`
              : "Registro fisioterapéutico profesional"}
          </p>

        </div>

        {/* DATOS GENERALES */}

        <div style={cardStyle}>

          <h2
            style={{
              color: "#67e8f9",
              fontSize: "28px",
              fontWeight: "900",
              marginBottom: "20px",
            }}
          >
            Datos Generales
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(250px,1fr))",
              gap: "18px",
            }}
          >

            <div>

              <label
                style={{
                  color: "#7dd3fc",
                  fontWeight: "800",
                }}
              >
                ID del paciente
              </label>

              <input
                type="number"
                value={pacienteId}
                onChange={(e) =>
                  setPacienteId(e.target.value)
                }
                style={inputStyle}
              />

            </div>

            <div>

              <label
                style={{
                  color: "#7dd3fc",
                  fontWeight: "800",
                }}
              >
                Escala EVA
              </label>

              <input
                type="number"
                min="0"
                max="10"
                value={escalaEva}
                onChange={(e) =>
                  setEscalaEva(e.target.value)
                }
                style={inputStyle}
              />

            </div>

          </div>

        </div>

        {/* MOTIVO CONSULTA */}

        <div style={cardStyle}>

          <h2
            style={{
              color: "#67e8f9",
              fontSize: "28px",
              fontWeight: "900",
              marginBottom: "20px",
            }}
          >
            Evaluación Inicial
          </h2>

          <CampoGrande
            titulo="Motivo de consulta"
            valor={motivoConsulta}
            setValor={setMotivoConsulta}
          />

          <CampoGrande
            titulo="Dolor actual"
            valor={dolorActual}
            setValor={setDolorActual}
          />

          <CampoGrande
            titulo="Antecedentes"
            valor={antecedentes}
            setValor={setAntecedentes}
          />

          <CampoGrande
            titulo="Medicamentos"
            valor={medicamentos}
            setValor={setMedicamentos}
          />

          <CampoGrande
            titulo="Cirugías"
            valor={cirugias}
            setValor={setCirugias}
          />

        </div>

        {/* VALORACION */}

        <div style={cardStyle}>

          <h2
            style={{
              color: "#67e8f9",
              fontSize: "28px",
              fontWeight: "900",
              marginBottom: "20px",
            }}
          >
            Valoración Fisioterapéutica
          </h2>

          <CampoGrande
            titulo="Evaluación física"
            valor={evaluacionFisica}
            setValor={setEvaluacionFisica}
            alto="180px"
          />

          <CampoGrande
            titulo="Diagnóstico fisioterapéutico"
            valor={diagnostico}
            setValor={setDiagnostico}
          />

          <CampoGrande
            titulo="Objetivos de tratamiento"
            valor={objetivos}
            setValor={setObjetivos}
          />

          <CampoGrande
            titulo="Plan de tratamiento"
            valor={planTratamiento}
            setValor={setPlanTratamiento}
            alto="180px"
          />

          <CampoGrande
            titulo="Pronóstico"
            valor={pronostico}
            setValor={setPronostico}
          />

        </div>

        {/* BOTON */}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >

          <button
            onClick={guardarHistoria}
            style={{
              background:
                "linear-gradient(90deg,#0b5cff,#06b6d4)",
              color: "white",
              padding: "18px 30px",
              borderRadius: "18px",
              border: "none",
              fontWeight: "900",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow:
                "0 10px 30px rgba(0,102,255,0.35)",
            }}
          >
            Guardar Historia Clínica
          </button>

        </div>

      </div>

    </main>

  );
}

function CampoGrande({
  titulo,
  valor,
  setValor,
  alto = "130px",
}: any) {

  return (

    <div style={{ marginBottom: "22px" }}>

      <label
        style={{
          color: "#7dd3fc",
          fontWeight: "800",
        }}
      >
        {titulo}
      </label>

      <textarea
        value={valor}
        onChange={(e) =>
          setValor(e.target.value)
        }
        style={{
          width: "100%",
          background: "#0f172a",
          color: "white",
          border: "1px solid rgba(125,211,252,0.18)",
          borderRadius: "18px",
          padding: "16px",
          marginTop: "10px",
          outline: "none",
          fontSize: "15px",
          height: alto,
          resize: "vertical",
        }}
      />

    </div>

  );
}