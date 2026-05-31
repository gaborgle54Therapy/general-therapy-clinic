"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/lib/supabase";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function NuevaEvolucionPage() {
  return (
    <Suspense fallback={<div style={{ color: "white", padding: "40px" }}>Cargando...</div>}>
      <NuevaEvolucion />
    </Suspense>
  );
}

function NuevaEvolucion() {

  const searchParams = useSearchParams();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [nombrePaciente, setNombrePaciente] = useState("");

  const [pacienteId, setPacienteId] = useState("");
  const [fecha, setFecha] = useState("");

  const [eva, setEva] = useState<number | null>(null);

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

    obtenerPacientes();

    const idUrl = searchParams.get("nuevoPacienteId");

    if (idUrl) {
      setPacienteId(idUrl);
      cargarNombrePaciente(idUrl);
    }

    const hoy = new Date().toISOString().split("T")[0];

    setFecha(hoy);

  }, [searchParams]);

  async function obtenerPacientes() {

    const { data, error } = await supabase
      .from("pacientes")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      alert("Error al cargar pacientes");
      return;
    }

    setPacientes(data || []);
  }

  async function cargarNombrePaciente(id: string) {

    const { data, error } = await supabase
      .from("pacientes")
      .select("nombre")
      .eq("id", Number(id))
      .single();

    if (error) return;

    setNombrePaciente(data?.nombre || "");
  }

  async function guardarEvolucion() {

    if (!pacienteId) {
      alert("Selecciona un paciente");
      return;
    }
console.log("EVA A GUARDAR:" + eva);
    const { error } = await supabase
      .from("evolucion")
      
      .insert([
        {
          paciente_id: Number(pacienteId),
          fecha,
          eva: eva === null ? null :  Number(eva),
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
          
        },
      ]);

    if (error) {
      console.log("ERROR EVOLUCION", error);
            alert("ERROR al guardar evolucion" + error.message);
      return;
    }

    alert("Evolución guardada correctamente");

    window.location.href =
      `/pacientes/expediente/${pacienteId}`;
  }

  function generarPDF() {

    const paciente =
      pacientes.find(
        (p) => p.id == Number(pacienteId)
      ) || {
        nombre: nombrePaciente,
      };

    const doc = new jsPDF();

    doc.setFillColor(11, 92, 255);

    doc.rect(0, 0, 220, 30, "F");

    doc.setTextColor(255, 255, 255);

    doc.setFontSize(22);

    doc.text("GENERAL THERAPY CLINIC", 14, 18);

    doc.setTextColor(0, 0, 0);

    doc.setFontSize(18);

    doc.text("Evolución Clínica", 14, 45);

    autoTable(doc, {
      startY: 55,

      head: [["Campo", "Información"]],

      body: [
        ["Paciente", paciente?.nombre || ""],
        ["Fecha", fecha],
        ["Escala EVA", eva !== null ? eva.toString() : "SIN EVA"],
        ["Dolor actual", dolorActual],
        ["Tratamiento realizado", tratamientoRealizado],
        ["Ejercicios", ejercicios],
        ["Observaciones", observaciones],
        ["Frecuencia cardiaca", frecuenciaCardiaca],
        ["Presión arterial", presionArterial],
        ["Temperatura", temperatura],
        ["Saturación oxígeno", saturacionOxigeno],
        ["Progreso", progreso],
        ["Próxima cita", proximaCita],
      ],

      styles: {
        fontSize: 11,
      },

      headStyles: {
        fillColor: [11, 92, 255],
      },
    });

    doc.save("evolucion_clinica.pdf");
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

        {/* REGRESAR */}

        <div style={{ marginBottom: "22px" }}>

          <a
            href={
              pacienteId
                ? `/pacientes/expediente/${pacienteId}`
                : "/evolucion"
            }
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
            background:
              "linear-gradient(90deg,#020617,#0f2f68,#0088ff)",
            borderRadius: "35px",
            padding: "38px",
            marginBottom: "30px",
            boxShadow:
              "0 0 55px rgba(0,102,255,0.35)",
            border:
              "1px solid rgba(125,211,252,0.25)",
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
            EVOLUCIÓN CLÍNICA
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
              : "Registro de evolución fisioterapéutica"}
          </p>

        </div>

        {/* DATOS */}

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

              <label style={labelStyle()}>
                Paciente
              </label>

              <select
                value={pacienteId}
                onChange={(e) => {
                  setPacienteId(e.target.value);
                  cargarNombrePaciente(e.target.value);
                }}
                style={inputStyle}
              >

                <option value="">
                  Seleccionar paciente
                </option>

                {pacientes.map((paciente) => (

                  <option
                    key={paciente.id}
                    value={paciente.id}
                  >
                    {paciente.nombre}
                  </option>

                ))}

              </select>

            </div>

            <div>

              <label style={labelStyle()}>
                Fecha evolución
              </label>

              <input
                type="date"
                value={fecha}
                onChange={(e) =>
                  setFecha(e.target.value)
                }
                style={inputStyle}
              />

            </div>

          </div>

        </div>

        {/* EVA */}

        <div style={cardStyle}>

          <h2
            style={{
              color: "#67e8f9",
              fontSize: "28px",
              fontWeight: "900",
              marginBottom: "25px",
            }}
          >
            Escala EVA
          </h2>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >

            {[0,1,2,3,4,5,6,7,8,9,10].map((numero) => (
  <button
    type="button"
    key={numero}
    onClick={() => setEva(numero)}
    style={{
      width: "55px",
      height: "55px",
      borderRadius: "12px",
      border: "none",
      cursor: "pointer",
      background:
        eva === numero ? "#06b6d4" : "#0f172a",
      color: "white",
      fontWeight: "bold",
      boxShadow:
        eva === numero
          ? "0 0 20px rgba(6,182,212,0.6)"
          : "none",
    }}
  >
    {numero}
  </button>
))}
<p style={{ color: "white", marginTop: "15px", fontWeight: "bold" }}>
  EVA seleccionada: {eva !== null ? eva : "Sin seleccionar"}
</p>

          </div>

        </div>
        <p
  style={{
    color: "white",
    marginTop: "15px",
    fontWeight: "bold",
  }}
>
  EVA seleccionada: {eva !== null ? eva : "Sin seleccionar"}
</p>
        {/* SIGNOS VITALES */}

        <div style={cardStyle}>

          <h2
            style={{
              color: "#67e8f9",
              fontSize: "28px",
              fontWeight: "900",
              marginBottom: "20px",
            }}
          >
            Signos Vitales
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(250px,1fr))",
              gap: "18px",
            }}
          >

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

        </div>

        {/* EVOLUCION */}

        <div style={cardStyle}>

          <h2
            style={{
              color: "#67e8f9",
              fontSize: "28px",
              fontWeight: "900",
              marginBottom: "20px",
            }}
          >
            Evolución Terapéutica
          </h2>

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

        </div>

        {/* PROXIMA CITA */}

        <div style={cardStyle}>

          <h2
            style={{
              color: "#67e8f9",
              fontSize: "28px",
              fontWeight: "900",
              marginBottom: "20px",
            }}
          >
            Próxima Cita
          </h2>

          <input
            type="date"
            value={proximaCita}
            onChange={(e) =>
              setProximaCita(e.target.value)
            }
            style={inputStyle}
          />

        </div>

        {/* BOTONES */}

        <div
          style={{
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >

          <button
            onClick={generarPDF}
            style={{
              background: "#16a34a",
              color: "white",
              padding: "18px 28px",
              borderRadius: "18px",
              border: "none",
              fontWeight: "900",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            Generar PDF
          </button>

          <button
            onClick={guardarEvolucion}
            style={{
              background:
                "linear-gradient(90deg,#0b5cff,#06b6d4)",
              color: "white",
              padding: "18px 28px",
              borderRadius: "18px",
              border: "none",
              fontWeight: "900",
              fontSize: "15px",
              cursor: "pointer",
              boxShadow:
                "0 10px 30px rgba(0,102,255,0.35)",
            }}
          >
            Guardar Evolución
          </button>

        </div>

      </div>

    </main>

  );
}

function labelStyle() {

  return {
    color: "#7dd3fc",
    fontWeight: "800",
  };
}

function Input({
  titulo,
  valor,
  setValor,
}: any) {

  return (

    <div>

      <label style={labelStyle()}>
        {titulo}
      </label>

      <input
        type="text"
        value={valor}
        onChange={(e) =>
          setValor(e.target.value)
        }
        style={{
          width: "100%",
          background: "#0f172a",
          color: "white",
          border:
            "1px solid rgba(125,211,252,0.18)",
          borderRadius: "18px",
          padding: "16px",
          marginTop: "10px",
          outline: "none",
          fontSize: "15px",
        }}
      />

    </div>

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

      <label style={labelStyle()}>
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
          border:
            "1px solid rgba(125,211,252,0.18)",
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