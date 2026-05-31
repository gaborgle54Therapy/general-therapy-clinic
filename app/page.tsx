"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/lib/supabase";

export default function Home() {
  const [cargando, setCargando] = useState(true);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [citasHoy, setCitasHoy] = useState(0);
  const [citasManana, setCitasManana] = useState(0);
  const [totalHistorias, setTotalHistorias] = useState(0);
  const [totalEvoluciones, setTotalEvoluciones] = useState(0);
  const [totalEstudios, setTotalEstudios] = useState(0);
  const [proximasCitas, setProximasCitas] = useState<any[]>([]);
  const [rol, setRol] = useState("");

  useEffect(() => {
    const rolGuardado = (localStorage.getItem("rol") || ""). toLowerCase();
    setRol(rolGuardado);

    verificarSesionYCargarDatos();
  }, []);

  async function verificarSesionYCargarDatos() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      window.location.href = "/login";
      return;
    }

    await cargarDashboard();
    setCargando(false);
  }

  function obtenerFechaManana() {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    return manana.toISOString().split("T")[0];
  }

  async function cargarDashboard() {
    const hoy = new Date().toISOString().split("T")[0];
    const manana = obtenerFechaManana();

    const { count: pacientesCount } = await supabase
      .from("pacientes")
      .select("*", { count: "exact", head: true });

    const { count: citasHoyCount } = await supabase
      .from("citas")
      .select("*", { count: "exact", head: true })
      .eq("fecha", hoy);

    const { count: citasMananaCount } = await supabase
      .from("citas")
      .select("*", { count: "exact", head: true })
      .eq("fecha", manana);

    const { count: historiasCount } = await supabase
      .from("historia_clinica")
      .select("*", { count: "exact", head: true });

    const { count: evolucionesCount } = await supabase
      .from("evolucion")
      .select("*", { count: "exact", head: true });

    const { count: estudiosCount } = await supabase
      .from("estudios")
      .select("*", { count: "exact", head: true });

    const { data: citasData } = await supabase
      .from("citas")
      .select(`
        *,
        pacientes (
          nombre
        )
      `)
      .gte("fecha", hoy)
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true })
      .limit(8);

    setTotalPacientes(pacientesCount || 0);
    setCitasHoy(citasHoyCount || 0);
    setCitasManana(citasMananaCount || 0);
    setTotalHistorias(historiasCount || 0);
    setTotalEvoluciones(evolucionesCount || 0);
    setTotalEstudios(estudiosCount || 0);
    setProximasCitas(citasData || []);
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  }

  function colorEstado(estado: string) {
    if (estado === "Confirmada") return "#2563eb";
    if (estado === "Asistió") return "#16a34a";
    if (estado === "No asistió") return "#6b7280";
    if (estado === "Cancelada") return "#dc2626";
    return "#eab308";
  }

  if (cargando) {
    return (
      <main style={styles.loadingMain}>
        <div style={styles.loadingBox}>Cargando sistema...</div>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.heroLeft}>
            <div style={styles.logoBox}>
              <Image src="/logo.png" alt="logo" width={115} height={115} priority />
            </div>

            <div>
              <p style={styles.heroLabel}>SISTEMA CLÍNICO INTEGRAL</p>
              <h1 style={styles.title}>General Therapy Clinic</h1>
              <p style={styles.subtitle}>
                Panel premium para pacientes, citas, expedientes clínicos y seguimiento terapéutico.
              </p>

              <div style={styles.heroButtons}>
                <a
                  href={`/citas/calendario?fecha=${new Date().toISOString().split("T")[0]}`}
                  style={styles.heroButton}
                >
                  Ver agenda de hoy
                </a>

                <a href="/pacientes" style={styles.heroButtonDark}>
                  Buscar paciente
                </a>
              </div>
            </div>
          </div>

          <button onClick={cerrarSesion} style={styles.logoutButton}>
            Cerrar sesión
          </button>
        </section>

        <section style={styles.statsGrid}>
          <StatCard titulo="Pacientes" valor={totalPacientes} color="#38bdf8" />
          <StatCard titulo="Citas hoy" valor={citasHoy} color="#22c55e" />
          <StatCard titulo="Citas mañana" valor={citasManana} color="#facc15" />
          <StatCard titulo="Historias clínicas" valor={totalHistorias} color="#a78bfa" />
          <StatCard titulo="Evoluciones" valor={totalEvoluciones} color="#06b6d4" />
          <StatCard titulo="Estudios cargados" valor={totalEstudios} color="#fb7185" />
          {rol === "admin" && (
  <StatCard
    titulo="Ingresos estimados hoy"
    valor={`$${citasHoy * 400}`}
    color="#4ade80"
  />
)}
        </section>

        <h2 style={styles.sectionTitle}>Accesos rápidos</h2>

        <section style={styles.menuGrid}>
          <MenuCard emoji="👥" titulo="Pacientes" texto="Gestionar pacientes registrados." href="/pacientes" />
          <MenuCard emoji="➕" titulo="Nuevo paciente" texto="Registrar nuevo paciente." href="/pacientes/nuevo" />
          <MenuCard emoji="📅" titulo="Calendario" texto="Visualizar agenda diaria." href="/citas/calendario" />
          <MenuCard emoji="🗓️" titulo="Nueva cita" texto="Agendar nueva sesión." href="/citas/nueva" />
          <MenuCard emoji="📋" titulo="Historia clínica" texto="Crear expediente clínico." href="/historias/nueva" />
          <MenuCard emoji="📈" titulo="Evoluciones" texto="Consultar avances clínicos." href="/evolucion" />

          {rol === "admin" && (
            <MenuCard
              emoji="👤"
              titulo="Usuarios"
              texto="Gestionar usuarios y permisos."
              href="/usuarios"
            />
          )}
        </section>

        <section style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h2 style={styles.tableTitle}>Próximas citas</h2>

            <a href="/citas/calendario" style={styles.smallButton}>
              Abrir calendario
            </a>
          </div>

          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>Paciente</th>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Hora</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {proximasCitas.map((cita) => (
                  <tr key={cita.id} style={styles.row}>
                    <td style={styles.td}>{cita.pacientes?.nombre || "Sin nombre"}</td>
                    <td style={styles.td}>{cita.fecha}</td>
                    <td style={styles.td}>{cita.hora?.slice(0, 5)}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          background: colorEstado(cita.estado),
                        }}
                      >
                        {cita.estado || "Pendiente"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <a href={`/citas/editar/${cita.id}`} style={styles.editButton}>
                        Editar
                      </a>
                    </td>
                  </tr>
                ))}

                {proximasCitas.length === 0 && (
                  <tr>
                    <td colSpan={5} style={styles.empty}>
                      No hay próximas citas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ titulo, valor, color }: any) {
  return (
    <div style={styles.statCard}>
      <p style={styles.statTitle}>{titulo}</p>
      <h2 style={{ ...styles.statValue, color }}>{valor}</h2>
    </div>
  );
}

function MenuCard({ emoji, titulo, texto, href }: any) {
  return (
    <a href={href} style={styles.menuCard}>
      <div style={styles.menuEmoji}>{emoji}</div>
      <h3 style={styles.menuTitle}>{titulo}</h3>
      <p style={styles.menuText}>{texto}</p>
    </a>
  );
}

const styles: any = {
  loadingMain: {
    minHeight: "100vh",
    background: "#020617",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    background: "#0f172a",
    padding: "40px",
    borderRadius: "30px",
    color: "white",
    fontSize: "24px",
    fontWeight: "900",
    boxShadow: "0 0 40px rgba(0,0,0,0.5)",
  },
  main: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left,#0b5cff 0%,#020617 35%,#111827 100%)",
    padding: "30px",
  },
  container: {
    maxWidth: "1500px",
    margin: "0 auto",
  },
  hero: {
    background: "linear-gradient(90deg,#020617,#0f2f68,#0088ff)",
    borderRadius: "40px",
    padding: "40px",
    marginBottom: "30px",
    boxShadow: "0 0 55px rgba(0,102,255,0.35)",
    border: "1px solid rgba(125,211,252,0.25)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "24px",
  },
  heroLeft: {
    display: "flex",
    alignItems: "center",
    gap: "25px",
    flexWrap: "wrap",
  },
  logoBox: {
    background: "white",
    borderRadius: "30px",
    padding: "15px",
    boxShadow: "0 0 25px rgba(255,255,255,0.15)",
  },
  heroLabel: {
    color: "#7dd3fc",
    fontSize: "18px",
    fontWeight: "900",
    marginBottom: "5px",
    letterSpacing: "2px",
  },
  title: {
    color: "white",
    fontSize: "58px",
    fontWeight: "900",
    margin: 0,
  },
  subtitle: {
    color: "#cbd5e1",
    marginTop: "10px",
    fontSize: "18px",
    maxWidth: "760px",
  },
  heroButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "20px",
  },
  heroButton: {
    background: "white",
    color: "#0b5cff",
    padding: "12px 18px",
    borderRadius: "14px",
    textDecoration: "none",
    fontWeight: "900",
  },
  heroButtonDark: {
    background: "rgba(255,255,255,0.12)",
    color: "white",
    padding: "12px 18px",
    borderRadius: "14px",
    textDecoration: "none",
    fontWeight: "900",
    border: "1px solid rgba(125,211,252,0.25)",
  },
  logoutButton: {
    background: "white",
    color: "#dc2626",
    border: "none",
    padding: "16px 30px",
    borderRadius: "18px",
    fontWeight: "900",
    fontSize: "16px",
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
    gap: "18px",
    marginBottom: "34px",
  },
  statCard: {
    background: "rgba(15,23,42,0.92)",
    borderRadius: "26px",
    padding: "26px",
    color: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    border: "1px solid rgba(125,211,252,0.18)",
  },
  statTitle: {
    color: "#94a3b8",
    marginBottom: "15px",
    fontWeight: "800",
  },
  statValue: {
    fontSize: "46px",
    margin: 0,
    fontWeight: "900",
  },
  sectionTitle: {
    color: "white",
    fontSize: "38px",
    marginBottom: "20px",
    fontWeight: "900",
  },
  menuGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
    gap: "20px",
    marginBottom: "35px",
  },
  menuCard: {
    background: "linear-gradient(145deg,#0f172a,#0b5cff)",
    borderRadius: "28px",
    padding: "30px",
    color: "white",
    textDecoration: "none",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  menuEmoji: {
    fontSize: "45px",
  },
  menuTitle: {
    fontSize: "22px",
    marginBottom: "8px",
  },
  menuText: {
    color: "#dbeafe",
    margin: 0,
  },
  tableCard: {
    background: "#0f172a",
    borderRadius: "35px",
    overflow: "hidden",
    boxShadow: "0 0 40px rgba(0,0,0,0.35)",
    border: "1px solid rgba(125,211,252,0.18)",
  },
  tableHeader: {
    background: "linear-gradient(90deg,#020617,#0f2f68,#0088ff)",
    padding: "25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "14px",
  },
  tableTitle: {
    color: "white",
    margin: 0,
    fontSize: "30px",
    fontWeight: "900",
  },
  smallButton: {
    background: "white",
    color: "#0b5cff",
    padding: "10px 16px",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "900",
  },
  tableScroll: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    minWidth: "900px",
    borderCollapse: "collapse",
    color: "white",
  },
  thead: {
    background: "#111827",
    color: "#7dd3fc",
  },
  th: {
    padding: "20px",
    textAlign: "left",
    fontWeight: "900",
  },
  row: {
    borderBottom: "1px solid #1e293b",
  },
  td: {
    padding: "20px",
    color: "#e2e8f0",
  },
  statusBadge: {
    color: "white",
    padding: "9px 14px",
    borderRadius: "999px",
    fontWeight: "900",
    display: "inline-block",
  },
  editButton: {
    background: "#facc15",
    color: "#111827",
    padding: "10px 14px",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: "900",
  },
  empty: {
    padding: "30px",
    color: "#94a3b8",
    fontWeight: "800",
  },
};