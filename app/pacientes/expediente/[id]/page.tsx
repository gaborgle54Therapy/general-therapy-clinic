"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/lib/supabase";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExpedientePaciente() {

  const params = useParams();
  const id = params.id as string;

  const [paciente, setPaciente] = useState<any>(null);
  const [citas, setCitas] = useState<any[]>([]);
  const [evoluciones, setEvoluciones] = useState<any[]>([]);
  const [estudios, setEstudios] = useState<any[]>([]);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [historiaClinica, setHistoriaClinica] = useState<any>(null);
  const [rol, setRol] = useState ("");

  
    useEffect(() => {
  const rolGuardado = localStorage.getItem("rol") || "";
  setRol(rolGuardado);
  
    cargarExpediente();
  }, []);

  async function cargarExpediente() {

    const { data: pacienteData } = await supabase
      .from("pacientes")
      .select("*")
      .eq("id", Number(id))
      .single();

    const { data: citasData } = await supabase
      .from("citas")
      .select("*")
      .eq("paciente_id", Number(id))
      .order("fecha", { ascending: false });

    const { data: evolucionesData } = await supabase
      .from("evolucion")
      .select("*")
      .eq("paciente_id", Number(id))
      .order("fecha", { ascending: false });

    const { data: estudiosData } = await supabase
      .from("estudios")
      .select("*")
      .eq("paciente_id", Number(id))
      .order("fecha", { ascending: false });

    const { data: historiaData } = await supabase
      .from("historia_clinica")
      .select("*")
      .eq("paciente_id", Number(id))
      .order("id", { ascending: false });

    setPaciente(pacienteData);
    setCitas(citasData || []);
    setEvoluciones(evolucionesData || []);
    setEstudios(estudiosData || []);
    setHistoriaClinica(historiaData?.[0] || null);
  }

  async function subirArchivo() {

    if (!archivo) {
      alert("Selecciona un archivo");
      return;
    }

    const nombreArchivo = `${id}/${Date.now()}-${archivo.name}`;

    const { error: errorSubida } = await supabase.storage
      .from("estudios")
      .upload(nombreArchivo, archivo);

    if (errorSubida) {
      alert("Error al subir archivo: " + errorSubida.message);
      return;
    }

    const { data } = supabase.storage
      .from("estudios")
      .getPublicUrl(nombreArchivo);

    const { error } = await supabase
      .from("estudios")
      .insert([
        {
          paciente_id: Number(id),
          nombre_archivo: archivo.name,
          url: data.publicUrl,
          fecha: new Date().toISOString().split("T")[0],
        },
      ]);

    if (error) {
      alert("Error al guardar archivo: " + error.message);
      return;
    }

    alert("Archivo subido correctamente");

    setArchivo(null);

    cargarExpediente();
  }

  async function eliminarEstudio(estudioId: number) {

    const confirmar = confirm(
      "¿Seguro que deseas eliminar este archivo?"
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("estudios")
      .delete()
      .eq("id", estudioId);

    if (error) {
      alert("Error al eliminar");
      return;
    }

    cargarExpediente();
  }

  function generarPDF(action: "ver" | "descargar") {
  const doc = new jsPDF();
  const fechaActual = new Date().toLocaleDateString("es-MX");
  const nombrePaciente = paciente?.nombre || "Paciente";

  function encabezado(titulo = "Expediente clínico fisioterapéutico") {
    doc.setFillColor(11, 92, 255);
    doc.rect(0, 0, 220, 32, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("GENERAL THERAPY CLINIC", 14, 14);

    doc.setFontSize(9);
    doc.text(titulo, 14, 23);
    doc.text(`Fecha de impresión: ${fechaActual}`, 145, 23);
  }

  function piePagina() {
    const pageCount = doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("General Therapy Clinic - Expediente clínico confidencial", 14, 287);
      doc.text(`Página ${i} de ${pageCount}`, 175, 287);
    }
  }

  function yActual() {
    return (doc as any).lastAutoTable?.finalY
      ? (doc as any).lastAutoTable.finalY + 10
      : 52;
  }

  encabezado();

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.text("Expediente Clínico Completo", 14, 45);

  autoTable(doc, {
    startY: 52,
    head: [["Datos del paciente", "Información"]],
    body: [
      ["Paciente", nombrePaciente],
      ["Edad", paciente?.edad || "Sin información"],
      ["Sexo", paciente?.sexo || "Sin información"],
      ["Teléfono", paciente?.telefono || "Sin información"],
      ["Total de citas", String(citas.length)],
      ["Total de evoluciones", String(evoluciones.length)],
      ["Estudios cargados", String(estudios.length)],
    ],
    headStyles: { fillColor: [11, 92, 255], textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: "bold" },
      1: { cellWidth: 125 },
    },
  });

  if (historiaClinica) {
    autoTable(doc, {
      startY: yActual(),
      head: [["Historia Clínica", "Información"]],
      body: [
        ["Motivo de consulta", historiaClinica.motivo_consulta || ""],
        ["Dolor actual", historiaClinica.dolor_actual || ""],
        ["Escala EVA", historiaClinica.escala_eva || ""],
        ["Antecedentes", historiaClinica.antecedentes || ""],
        ["Medicamentos", historiaClinica.medicamentos || ""],
        ["Cirugías", historiaClinica.cirugias || ""],
        ["Evaluación física", historiaClinica.evaluacion_fisica || ""],
        [
          "Diagnóstico fisioterapéutico",
          historiaClinica.diagnostico ||
            historiaClinica.diagnostico_fisioterapeutico ||
            "",
        ],
        ["Objetivos", historiaClinica.objetivos_tratamiento || ""],
        ["Plan de tratamiento", historiaClinica.plan_tratamiento || ""],
        ["Pronóstico", historiaClinica.pronostico || ""],
      ],
      headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: "bold" },
        1: { cellWidth: 125 },
      },
    });
  }

  if (evoluciones.length > 0) {
    autoTable(doc, {
      startY: yActual(),
      head: [["Fecha", "EVA", "Dolor", "Tratamiento", "Ejercicios", "Progreso"]],
      body: evoluciones.map((evo) => [
        evo.fecha || "",
        evo.eva !== null && evo.eva !== undefined ? String(evo.eva) : "Sin EVA",
        evo.dolor_actual || "",
        evo.tratamiento_realizado || "",
        evo.ejercicios || "",
        evo.progreso || "",
      ]),
      headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255] },
      styles: { fontSize: 7, cellPadding: 2.5, overflow: "linebreak" },
    });
  }

  if (citas.length > 0) {
    autoTable(doc, {
      startY: yActual(),
      head: [["Fecha", "Hora", "Motivo", "Estado", "Notas"]],
      body: citas.map((cita) => [
        cita.fecha || "",
        cita.hora?.slice(0, 5) || "",
        cita.motivo || "",
        cita.estado || "",
        cita.notas || "",
      ]),
      headStyles: { fillColor: [14, 116, 144], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
    });
  }

  if (estudios.length > 0) {
    autoTable(doc, {
      startY: yActual(),
      head: [["Estudios / Archivos cargados", "Fecha"]],
      body: estudios.map((estudio) => [
        estudio.nombre_archivo || "Archivo",
        estudio.fecha || "",
      ]),
      headStyles: { fillColor: [124, 58, 237], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 3 },
    });
  }

  const finalY = yActual();

  if (finalY > 235) {
    doc.addPage();
    encabezado();
  }

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text("__________________________________", 14, 245);
  doc.text("L.R.T.F. Gabriel González Ramírez", 14, 253);
  doc.text("General Therapy Clinic", 14, 260);

  piePagina();


  const nombreArchivo = `expediente_${nombrePaciente}.pdf`;

if (action === "ver") {
  const pdfUrl = doc.output("bloburl");
  window.open(pdfUrl, "_blank");
} else {
  doc.save(nombreArchivo);
}
}
  return (
    <main style={styles.main}>

      <div style={styles.container}>

        <div style={{ marginBottom: "22px" }}>
          <a
            href="/pacientes"
            style={styles.backButton}
          >
            ← Regresar
          </a>
        </div>

        {/* HEADER */}

        <section style={styles.hero}>

          <div>

            <p style={styles.heroLabel}>
              EXPEDIENTE CLÍNICO
            </p>

            <h1 style={styles.title}>
              {paciente?.nombre || "Paciente"}
            </h1>

            <div style={styles.patientInfo}>
              <span>Edad: {paciente?.edad || "—"}</span>
              <span>Sexo: {paciente?.sexo || "—"}</span>
              <span>Teléfono: {paciente?.telefono || "—"}</span>
            </div>

          </div>

          <div style={styles.heroActions}>

            <a
              href={
                historiaClinica
                  ? `/historias/editar/${historiaClinica.id}`
                  : `/historias/nueva?nuevoPacienteId=${id}`
              }
              style={button("#7c3aed")}
            >
              {historiaClinica
                ? "Editar historia clínica"
                : "Crear historia clínica"}
            </a>

            <a
              href={`/evolucion/nueva?nuevoPacienteId=${id}`}
              style={button("#0f766e")}
            >
              Nueva evolución
            </a>

            <a
              href={`/citas/nueva?pacienteId=${id}`}
              style={button("#0b5cff")}
            >
              Nueva cita
            </a>

            <button
  onClick={() => generarPDF("ver")}
  style={{
    ...button("#0ea5e9"),
    border: "none",
  }}
>
  Vista previa PDF
</button>

<button
  onClick={() => generarPDF("descargar")}
  style={{
    ...button("#16a34a"),
    border: "none",
  }}
>
  Descargar PDF
</button>

          </div>

        </section>

        {/* RESUMEN */}

        <section style={styles.summaryGrid}>

          <Resumen
            titulo="Citas"
            valor={citas.length}
            color="#38bdf8"
          />

          <Resumen
            titulo="Evoluciones"
            valor={evoluciones.length}
            color="#22c55e"
          />

          <Resumen
            titulo="Estudios"
            valor={estudios.length}
            color="#facc15"
          />

          <Resumen
            titulo="Historia clínica"
            valor={historiaClinica ? "Sí" : "No"}
            color="#a78bfa"
          />

        </section>

        {/* HISTORIA */}

        <section style={styles.card}>

          <h2 style={styles.sectionTitle}>
            Historia Clínica
          </h2>

          {historiaClinica ? (

            <div style={styles.infoGrid}>

              <InfoCard
                titulo="Motivo consulta"
                valor={historiaClinica.motivo_consulta}
              />

              <InfoCard
                titulo="Dolor actual"
                valor={historiaClinica.dolor_actual}
              />

              <InfoCard
                titulo="Escala EVA"
                valor={historiaClinica.escala_eva}
              />

              <InfoCard
                titulo="Antecedentes"
                valor={historiaClinica.antecedentes}
              />

              <InfoCard
                titulo="Medicamentos"
                valor={historiaClinica.medicamentos}
              />

              <InfoCard
                titulo="Cirugías"
                valor={historiaClinica.cirugias}
              />

              <InfoCard
                titulo="Evaluación física"
                valor={historiaClinica.evaluacion_fisica}
              />

              <InfoCard
                titulo="Diagnóstico"
                valor={
                  historiaClinica.diagnostico ||
                  historiaClinica.diagnostico_fisioterapeutico
                }
              />

              <InfoCard
                titulo="Objetivos"
                valor={historiaClinica.objetivos_tratamiento}
              />

              <InfoCard
                titulo="Plan tratamiento"
                valor={historiaClinica.plan_tratamiento}
              />

              <InfoCard
                titulo="Pronóstico"
                valor={historiaClinica.pronostico}
              />

            </div>

          ) : (

            <p style={styles.emptyText}>
              Este paciente aún no tiene historia clínica registrada.
            </p>

          )}

        </section>

        {/* EVOLUCIONES */}

        <section style={styles.card}>

          <h2 style={styles.sectionTitle}>
            Evoluciones
          </h2>

          {evoluciones.length === 0 ? (

            <p style={styles.emptyText}>
              Sin evoluciones registradas.
            </p>

          ) : (

            <div style={styles.timelineList}>

              {evoluciones.map((evo) => (

                <div
                  key={evo.id}
                  style={styles.timelineItem}
                >

                  <div style={styles.dotGreen} />

                  <div>

                    <h3 style={styles.timelineTitle}>
                      {evo.fecha}
                    </h3>

                    <div style={styles.infoGridSmall}>

                      <MiniCard
                        titulo="EVA"
                        valor={
                          evo.eva !== null && evo.eva !== undefined
                          ? `EVA ${evo.eva}`
                          : "Sin EVA"
                        }
                                              />

                      <MiniCard
                        titulo="Dolor actual"
                        valor={evo.dolor_actual}
                      />

                      <MiniCard
                        titulo="Tratamiento"
                        valor={evo.tratamiento_realizado}
                      />

                      <MiniCard
                        titulo="Ejercicios"
                        valor={evo.ejercicios}
                      />

                      <MiniCard
                        titulo="Observaciones"
                        valor={evo.observaciones}
                      />

                      <MiniCard
                        titulo="Progreso"
                        valor={evo.progreso}
                      />

                      <MiniCard
                        titulo="Próxima cita"
                        valor={evo.proxima_cita}
                      />

                    </div>

                    <div
                      style={{
                        marginTop: "18px",
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >

                      <a
                        href={`/evolucion/editar/${evo.id}`}
                        style={button("#f59e0b")}
                      >
                        Editar evolución
                      </a>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>

    </main>

  );
}

function Resumen({ titulo, valor, color }: any) {
  return (
    <div style={styles.summaryCard}>
      <p style={styles.summaryLabel}>
        {titulo}
      </p>

      <h3
        style={{
          ...styles.summaryValue,
          color,
        }}
      >
        {valor}
      </h3>
    </div>
  );
}

function InfoCard({ titulo, valor }: any) {
  return (
    <div style={styles.infoCard}>
      <p style={styles.infoTitle}>
        {titulo}
      </p>

      <p style={styles.infoValue}>
        {valor || "Sin información"}
      </p>
    </div>
  );
}

function MiniCard({ titulo, valor }: any) {
  return (
    <div style={styles.miniCard}>
      <p style={styles.miniTitle}>
        {titulo}
      </p>

      <p style={styles.miniValue}>
        {valor || "Sin información"}
      </p>
    </div>
  );
}

function button(color: string) {
  return {
    background: color,
    color: "white",
    padding: "12px 18px",
    borderRadius: "14px",
    textDecoration: "none",
    fontWeight: "900",
    fontSize: "14px",
    display: "inline-block",
    cursor: "pointer",
  };
}

const styles: any = {
  
  main: {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left,#0b5cff 0%,#020617 35%,#111827 100%)",
  padding: "clamp(14px, 3vw, 35px)",
},
  container: {
    maxWidth: "1500px",
    margin: "0 auto",
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
    padding: "clamp(22px, 4vw, 38px)",
    marginBottom: "28px",
    boxShadow: "0 0 55px rgba(0,102,255,0.35)",
    border: "1px solid rgba(125,211,252,0.25)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "22px",
    flexWrap: "wrap",
  },

  heroLabel: {
    color: "#7dd3fc",
    fontWeight: "900",
    letterSpacing: "2px",
    marginBottom: "8px",
  },

  title: {
    fontSize: "clap(32px, 6vw, 52px)",
    fontWeight: "900",
    color: "white",
    margin: 0,
  },

  patientInfo: {
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
    marginTop: "18px",
    color: "#dbeafe",
    fontWeight: "700",
  },

  heroActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
    gap: "16px",
    marginBottom: "28px",
  },

  summaryCard: {
    background: "rgba(15,23,42,0.92)",
    borderRadius: "22px",
    padding: "18px",
    border: "1px solid rgba(125,211,252,0.18)",
    boxShadow: "0 15px 35px rgba(0,0,0,0.30)",
  },

  summaryLabel: {
    color: "#cbd5e1",
    fontWeight: "800",
    marginBottom: "8px",
  },

  summaryValue: {
    fontSize: "34px",
    fontWeight: "900",
    margin: 0,
  },

  card: {
    background: "rgba(15,23,42,0.92)",
    borderRadius: "clamp(20px, 4vw, 30px)",
    padding: "(clamp(18px, 3vw, 30px)",
    marginBottom: "28px",
    border: "1px solid rgba(125,211,252,0.18)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.35)",
  },

  sectionTitle: {
    fontSize: "30px",
    fontWeight: "900",
    color: "#7dd3fc",
    marginBottom: "25px",
  },

  infoGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(min(100%, 280px),1fr))",
    gap: "18px",
  },

  infoGridSmall: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
    gap: "14px",
    marginTop: "14px",
  },

  infoCard: {
    background: "#0f172a",
    borderRadius: "22px",
    padding: "18px",
    border: "1px solid rgba(125,211,252,0.12)",
  },

  infoTitle: {
    color: "#67e8f9",
    fontWeight: "900",
    marginBottom: "10px",
  },

  infoValue: {
    color: "white",
    lineHeight: 1.5,
  },

  miniCard: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: "18px",
    padding: "15px",
  },

  miniTitle: {
    color: "#7dd3fc",
    fontWeight: "900",
    marginBottom: "8px",
  },

  miniValue: {
    color: "white",
  },

  timelineList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  timelineItem: {
    position: "relative",
    background: "#0f172a",
    borderRadius: "24px",
    padding: "22px 22px 22px 55px",
    border: "1px solid rgba(125,211,252,0.12)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },

  dotGreen: {
    position: "absolute",
    left: "24px",
    top: "28px",
    width: "13px",
    height: "13px",
    borderRadius: "999px",
    background: "#22c55e",
    boxShadow: "0 0 15px #22c55e",
  },

  timelineTitle: {
    color: "#67e8f9",
    fontWeight: "900",
    marginBottom: "12px",
    fontSize: "18px",
  },

  emptyText: {
    color: "#cbd5e1",
    fontWeight: "700",
  },
};