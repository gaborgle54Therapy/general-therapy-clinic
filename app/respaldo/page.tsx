"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/lib/supabase";

const tablas = [
  "pacientes",
  "citas",
  "historia_clinica",
  "evolucion",
  "estudios",
  "usuario",
];

export default function RespaldoPage() {
  const [rol, setRol] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const rolGuardado = (localStorage.getItem("rol") || "").toLowerCase();

    if (rolGuardado !== "admin") {
      window.location.href = "/";
      return;
    }

    setRol(rolGuardado);
  }, []);

  function convertirCSV(datos: any[]) {
    if (!datos || datos.length === 0) return "";

    const columnas = Object.keys(datos[0]);

    const encabezados = columnas.join(",");

    const filas = datos.map((fila) =>
      columnas
        .map((columna) => {
          const valor = fila[columna] ?? "";
          return `"${String(valor).replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    return [encabezados, ...filas].join("\n");
  }

  function descargarArchivo(nombre: string, contenido: string) {
    const blob = new Blob([contenido], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = nombre;
    link.click();

    URL.revokeObjectURL(url);
  }

  async function descargarTabla(tabla: string) {
    setCargando(true);

    const { data, error } = await supabase.from(tabla).select("*");

    if (error) {
      alert(`Error al respaldar ${tabla}: ${error.message}`);
      setCargando(false);
      return;
    }

    const csv = convertirCSV(data || []);
    const fecha = new Date().toISOString().split("T")[0];

    descargarArchivo(`${tabla}_${fecha}.csv`, csv);

    setCargando(false);
  }

  async function descargarTodo() {
    setCargando(true);

    for (const tabla of tablas) {
      const { data, error } = await supabase.from(tabla).select("*");

      if (error) {
        alert(`Error al respaldar ${tabla}: ${error.message}`);
        continue;
      }

      const csv = convertirCSV(data || []);
      const fecha = new Date().toISOString().split("T")[0];

      descargarArchivo(`${tabla}_${fecha}.csv`, csv);

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setCargando(false);
    alert("Respaldo descargado correctamente");
  }

  if (rol !== "admin") {
    return (
      <main style={styles.main}>
        <div style={styles.card}>Validando permisos...</div>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <a href="/" style={styles.backButton}>
          ← Regresar al panel
        </a>

        <section style={styles.hero}>
          <p style={styles.label}>ADMINISTRACIÓN</p>
          <h1 style={styles.title}>Respaldo de Base de Datos</h1>
          <p style={styles.subtitle}>
            Descarga copias CSV de pacientes, citas, historias clínicas,
            evoluciones, estudios y usuarios.
          </p>
        </section>

        <section style={styles.card}>
          <button
            onClick={descargarTodo}
            disabled={cargando}
            style={styles.mainButton}
          >
            {cargando ? "Generando respaldo..." : "Descargar respaldo completo"}
          </button>

          <div style={styles.grid}>
            {tablas.map((tabla) => (
              <button
                key={tabla}
                onClick={() => descargarTabla(tabla)}
                disabled={cargando}
                style={styles.tableButton}
              >
                Descargar {tabla}
              </button>
            ))}
          </div>

          <p style={styles.note}>
            Guarda estos archivos en Google Drive o en una USB. Haz este respaldo
            mínimo una vez por semana.
          </p>
        </section>
      </div>
    </main>
  );
}

const styles: any = {
  main: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left,#0b5cff 0%,#020617 38%,#111827 100%)",
    padding: "35px",
    color: "white",
  },

  container: {
    maxWidth: "1000px",
    margin: "0 auto",
  },

  backButton: {
    background: "rgba(255,255,255,0.10)",
    color: "white",
    padding: "12px 18px",
    borderRadius: "14px",
    textDecoration: "none",
    fontWeight: "900",
    display: "inline-block",
    marginBottom: "24px",
  },

  hero: {
    background: "linear-gradient(90deg,#020617,#0f2f68,#0088ff)",
    borderRadius: "35px",
    padding: "38px",
    marginBottom: "28px",
    boxShadow: "0 0 55px rgba(0,102,255,0.35)",
  },

  label: {
    color: "#67e8f9",
    fontWeight: "900",
    letterSpacing: "2px",
  },

  title: {
    fontSize: "48px",
    fontWeight: "900",
    margin: "10px 0",
  },

  subtitle: {
    color: "#dbeafe",
    fontWeight: "700",
    fontSize: "17px",
  },

  card: {
    background: "rgba(15,23,42,0.92)",
    borderRadius: "30px",
    padding: "30px",
    border: "1px solid rgba(125,211,252,0.18)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.35)",
  },

  mainButton: {
    width: "100%",
    background: "linear-gradient(90deg,#16a34a,#22c55e)",
    color: "white",
    padding: "18px",
    borderRadius: "18px",
    border: "none",
    fontWeight: "900",
    fontSize: "17px",
    cursor: "pointer",
    marginBottom: "24px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "14px",
  },

  tableButton: {
    background: "rgba(255,255,255,0.10)",
    color: "white",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid rgba(125,211,252,0.25)",
    fontWeight: "900",
    cursor: "pointer",
  },

  note: {
    color: "#cbd5e1",
    marginTop: "24px",
    fontWeight: "700",
  },
};