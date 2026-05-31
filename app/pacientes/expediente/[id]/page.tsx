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


async function cargarLogo(url: string) {
  const respuesta = await fetch(url);
  const blob = await respuesta.blob();

  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

async function generarPDF(action: "ver" | "descargar") {
  const doc = new jsPDF();
  const fechaActual = new Date().toLocaleDateString("es-MX");
  const nombrePaciente = paciente?.nombre || "Paciente";
  const logoBase64 = await cargarLogo("/logo.png");

  const azulOscuro: [number, number, number] = [0, 45, 100];
  const azul: [number, number, number] = [0, 80, 190];
  const dorado: [number, number, number] = [184, 128, 30];
  const gris: [number, number, number] = [55, 65, 81];

  function marcaAgua(x = 118, y = 72, w = 70, h = 70) {
    doc.setGState(new (doc as any).GState({ opacity: 0.055 }));
    doc.addImage(logoBase64, "PNG", x, y, w, h);
    doc.setGState(new (doc as any).GState({ opacity: 1 }));
  }

  function footer(pagina: number, total: number) {
    doc.setFillColor(...azulOscuro);
    doc.rect(0, 265, 220, 35, "F");

    doc.setDrawColor(...dorado);
    doc.setLineWidth(0.7);
    doc.line(10, 267, 200, 267);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);

    doc.text("gaborgle54@gmail.com", 16, 277);
    doc.text("Whats: 449 387 7868", 16, 286);

    doc.text("16 de septiembre norte #34", 112, 277);
    doc.text("Pabellón de Arteaga, Aguascalientes", 112, 286);

    doc.setFillColor(...azul);
    doc.roundedRect(178, 281, 24, 7, 3, 3, "F");
    doc.setFontSize(7);
    doc.text(`Página ${pagina} de ${total}`, 181, 286);
  }

  function encabezado() {
    doc.setFillColor(...azulOscuro);
    doc.rect(0, 0, 220, 32, "F");

    doc.addImage(logoBase64, "PNG", 14, 5, 22, 22);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.text("GENERAL", 41, 12);

    doc.setFontSize(10);
    doc.text("THERAPY CLINIC", 41, 20);

    doc.setFontSize(6.8);
    doc.text("EXPEDIENTE CLÍNICO FISIOTERAPÉUTICO", 41, 26);

    doc.setFontSize(7);
    doc.text("Fecha de impresión:", 168, 13);
    doc.setFontSize(8.5);
    doc.text(fechaActual, 168, 20);

    doc.setDrawColor(...dorado);
    doc.setLineWidth(0.8);
    doc.line(0, 32, 220, 32);
  }

  function portada() {
    doc.setFillColor(...azulOscuro);
    doc.rect(0, 0, 220, 26, "F");

    doc.setDrawColor(...dorado);
    doc.setLineWidth(1.2);
    doc.line(0, 26, 220, 18);

    doc.setGState(new (doc as any).GState({ opacity: 0.06 }));
    doc.addImage(logoBase64, "PNG", 50, 150, 110, 110);
    doc.setGState(new (doc as any).GState({ opacity: 1 }));

    doc.addImage(logoBase64, "PNG", 78, 42, 54, 54);

    doc.setTextColor(...azulOscuro);
    doc.setFontSize(22);
    doc.text("GENERAL", 105, 112, { align: "center" });

    doc.setTextColor(...azul);
    doc.setFontSize(17);
    doc.text("THERAPY CLINIC", 105, 123, { align: "center" });

    doc.setTextColor(...azulOscuro);
    doc.setFontSize(7.5);
    doc.text("FISIOTERAPIA AVANZADA · RECUPERACIÓN · BIENESTAR", 105, 132, {
      align: "center",
    });

    doc.setTextColor(...azulOscuro);
    doc.setFontSize(31);
    doc.text("EXPEDIENTE", 105, 162, { align: "center" });

    doc.setTextColor(...azul);
    doc.setFontSize(42);
    doc.text("CLÍNICO", 105, 184, { align: "center" });

    doc.setTextColor(...azulOscuro);
    doc.setFontSize(13);
    doc.text("F I S I O T E R A P É U T I C O", 105, 200, {
      align: "center",
    });

    doc.setDrawColor(...dorado);
    doc.setLineWidth(0.6);
    doc.line(63, 208, 96, 208);
    doc.line(114, 208, 147, 208);

    doc.setFillColor(...dorado);
    doc.circle(105, 208, 1.3, "F");

    doc.setTextColor(...azulOscuro);
    doc.setFontSize(8);
    doc.text("PACIENTE", 105, 229, { align: "center" });

    doc.setFontSize(12);
    doc.text(nombrePaciente, 105, 238, { align: "center" });

    doc.setFontSize(8);
    doc.text("FECHA DE GENERACIÓN", 105, 254, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(...azul);
    doc.text(fechaActual, 105, 263, { align: "center" });

    footer(1, 1);
  }

  function tituloSeccion(titulo: string, y: number) {
    doc.setTextColor(...azulOscuro);
    doc.setFontSize(11);
    doc.text(titulo, 14, y);

    doc.setDrawColor(...azul);
    doc.setLineWidth(0.5);
    doc.line(14, y + 3, 196, y + 3);
  }

  function yActual() {
    return (doc as any).lastAutoTable?.finalY
      ? (doc as any).lastAutoTable.finalY + 12
      : 45;
  }

  portada();

  doc.addPage();
  encabezado();
  marcaAgua();

  tituloSeccion("DATOS DEL PACIENTE", 44);

  autoTable(doc, {
    startY: 51,
    head: [["Campo", "Información"]],
    body: [
      ["Paciente", nombrePaciente],
      ["Edad", paciente?.edad || "Sin información"],
      ["Sexo", paciente?.sexo || "Sin información"],
      ["Teléfono", paciente?.telefono || "Sin información"],
      ["Total de citas", String(citas.length)],
      ["Total de evoluciones", String(evoluciones.length)],
      ["Estudios cargados", String(estudios.length)],
    ],
    headStyles: {
      fillColor: azulOscuro,
      textColor: [255, 255, 255] as [number, number, number],
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: gris,
      lineColor: [220, 226, 235] as [number, number, number],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: "bold", textColor: azulOscuro },
      1: { cellWidth: 130 },
    },
  });

  if (historiaClinica) {
    const yHistoria = yActual();
    tituloSeccion("HISTORIA CLÍNICA", yHistoria);

    autoTable(doc, {
      startY: yHistoria + 7,
      head: [["Campo", "Información"]],
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
      headStyles: {
        fillColor: azulOscuro,
        textColor: [255, 255, 255] as [number, number, number],
      },
      styles: {
        fontSize: 7.4,
        cellPadding: 2.5,
        overflow: "linebreak",
        textColor: gris,
        lineColor: [220, 226, 235] as [number, number, number],
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: "bold", textColor: azulOscuro },
        1: { cellWidth: 130 },
      },
    });
  }

  doc.addPage();
  encabezado();
  marcaAgua(120, 70, 65, 65);

  let y = 44;

  if (evoluciones.length > 0) {
    tituloSeccion("EVOLUCIONES", y);

    autoTable(doc, {
      startY: y + 7,
      head: [["Fecha", "EVA", "Dolor", "Tratamiento", "Ejercicios", "Progreso"]],
      body: evoluciones.map((evo) => [
        evo.fecha || "",
        evo.eva !== null && evo.eva !== undefined ? String(evo.eva) : "Sin EVA",
        evo.dolor_actual || "",
        evo.tratamiento_realizado || "",
        evo.ejercicios || "",
        evo.progreso || "",
      ]),
      headStyles: {
        fillColor: azulOscuro,
        textColor: [255, 255, 255] as [number, number, number],
      },
      styles: {
        fontSize: 6.8,
        cellPadding: 2.2,
        overflow: "linebreak",
        textColor: gris,
        lineColor: [220, 226, 235] as [number, number, number],
        lineWidth: 0.2,
      },
    });

    y = yActual();
  }

  tituloSeccion("CITAS", y);

  autoTable(doc, {
    startY: y + 7,
    head: [["Fecha", "Hora", "Motivo", "Estado", "Notas"]],
    body:
      citas.length > 0
        ? citas.map((cita) => [
            cita.fecha || "",
            cita.hora?.slice(0, 5) || "",
            cita.motivo || "",
            cita.estado || "",
            cita.notas || "",
          ])
        : [["Sin citas registradas", "—", "—", "—", "—"]],
    headStyles: {
      fillColor: azulOscuro,
      textColor: [255, 255, 255] as [number, number, number],
    },
    styles: {
      fontSize: 6.8,
      cellPadding: 2.2,
      overflow: "linebreak",
      textColor: gris,
      lineColor: [220, 226, 235] as [number, number, number],
      lineWidth: 0.2,
    },
  });

  y = yActual();

  tituloSeccion("ESTUDIOS / ARCHIVOS CARGADOS", y);

  autoTable(doc, {
    startY: y + 7,
    head: [["Archivo", "Fecha"]],
    body:
      estudios.length > 0
        ? estudios.map((estudio) => [
            estudio.nombre_archivo || "Archivo",
            estudio.fecha || "",
          ])
        : [["No se han cargado estudios", "—"]],
    headStyles: {
      fillColor: azulOscuro,
      textColor: [255, 255, 255] as [number, number, number],
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 3,
      textColor: gris,
      lineColor: [220, 226, 235] as [number, number, number],
      lineWidth: 0.2,
    },
  });

  doc.setTextColor(...azulOscuro);
  doc.setFontSize(10);
  doc.text("__________________________________", 105, 238, { align: "center" });
  doc.text("Firma L.R.T.F Gabriel González Ramírez.", 105, 246, { align: "center" });
  doc.text("CED. PROF:12445673", 105, 263, { align: "center" });
  doc.text("General Therapy Clinic", 105, 253, { align: "center" });

  const totalPaginas = doc.getNumberOfPages();

  for (let i = 2; i <= totalPaginas; i++) {
    doc.setPage(i);
    footer(i - 1, totalPaginas - 1);
  }

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
  padding: "clamp(18px, 3vw, 30px)",
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