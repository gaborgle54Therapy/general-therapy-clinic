"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/lib/supabase";

export default function NuevaHistoriaClinica() {

  const [pacientes, setPacientes] = useState<any[]>([]);

  const [pacienteId, setPacienteId] = useState("");
  const [motivoConsulta, setMotivoConsulta] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [antecedentes, setAntecedentes] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [eva, setEva] = useState("");

  useEffect(() => {
    obtenerPacientes();
  }, []);

  async function obtenerPacientes() {

    const { data } = await supabase
      .from("pacientes")
      .select("*")
      .order("nombre");

    if (data) {
      setPacientes(data);
    }
  }

  async function guardarHistoria() {

    const { error } = await supabase
      .from("historia_clinica")
      .insert([
        {
          paciente_id: Number(pacienteId),
          motivo_consulta: motivoConsulta,
          diagnostico,
          antecedentes,
          observaciones,
          eva: Number(eva),
        },
      ]);

    if (error) {
      alert("Error al guardar historia");
      console.log(error);
    } else {
      alert("Historia clínica guardada");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div style={{ marginBottom: "20px" }}>
  <a
    href="/"
    style={{
      backgroundColor: "#e5e7eb",
      color: "#111827",
      padding: "10px 16px",
      borderRadius: "10px",
      fontWeight: "bold",
      fontSize: "14px",
      textDecoration: "none",
      display: "inline-block",
    }}
  >
    ← Regresar
  </a>
</div>

      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg p-10">

        <h1 className="text-5xl font-bold text-blue-900 mb-3">
          Historia Clínica
        </h1>

        <p className="text-gray-500 mb-10">
          Registro clínico profesional
        </p>

        <div className="grid grid-cols-2 gap-6">

          <div>
            <label className="font-semibold text-gray-700">
              Paciente
            </label>

            <select
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              className="w-full border p-4 rounded-xl mt-2"
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
            <label className="font-semibold text-gray-700">
              EVA
            </label>

            <input
              type="number"
              value={eva}
              onChange={(e) => setEva(e.target.value)}
              className="w-full border p-4 rounded-xl mt-2"
            />
          </div>

          <div className="col-span-2">
            <label className="font-semibold text-gray-700">
              Motivo de consulta
            </label>

            <textarea
              value={motivoConsulta}
              onChange={(e) => setMotivoConsulta(e.target.value)}
              className="w-full border p-4 rounded-xl mt-2"
            />
          </div>

          <div className="col-span-2">
            <label className="font-semibold text-gray-700">
              Diagnóstico
            </label>

            <textarea
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              className="w-full border p-4 rounded-xl mt-2"
            />
          </div>

          <div className="col-span-2">
            <label className="font-semibold text-gray-700">
              Antecedentes
            </label>

            <textarea
              value={antecedentes}
              onChange={(e) => setAntecedentes(e.target.value)}
              className="w-full border p-4 rounded-xl mt-2"
            />
          </div>

          <div className="col-span-2">
            <label className="font-semibold text-gray-700">
              Observaciones
            </label>

            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full border p-4 rounded-xl mt-2"
            />
          </div>

        </div>

        <button
          onClick={guardarHistoria}
          className="mt-10 bg-blue-700 hover:bg-blue-800 text-white px-10 py-4 rounded-xl"
        >
          Guardar Historia Clínica
        </button>

      </div>

    </main>
  );
}