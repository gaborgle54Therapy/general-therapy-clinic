"use client";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaUserPlus,
  FaSearch,
  FaFolderOpen,
  FaFileMedical,
  FaChartLine,
  FaEdit,
  FaTrash,
  FaUsers,
  FaPhoneAlt,
} from "react-icons/fa";
import { supabase } from "../../lib/lib/supabase";
import { LoadableContext } from "next/dist/shared/lib/loadable-context.shared-runtime";
export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [rol, setRol] = useState ("");
  useEffect(() => {
    const rolGuardado = localStorage.getItem("rol") || "";
    setRol(rolGuardado);
    obtenerPacientes();
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      obtenerPacientes();
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);
  async function obtenerPacientes() {
    setCargando(true);
    let query = supabase
      .from("pacientes")
      .select("*")
      .order("nombre", { ascending: true });
    if (busqueda.trim()) {
      const texto = busqueda.trim();
      query = query.or(
        `nombre.ilike.%${texto}%,telefono.ilike.%${texto}%`
      );
    }
    const { data, error } = await query;
    if (error) {
      console.log(error);
      alert("Error al cargar pacientes: " + error.message);
    } else {
      setPacientes(data || []);
    }
    setCargando(false);
  }
  function limpiarBusqueda() {
    setBusqueda("");
  }
  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.backBox}>
          <a href="/" style={styles.backButton}>
            <FaArrowLeft />
            Regresar al dashboard
          </a>
        </div>
        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <div style={styles.heroIcon}>
              <FaUsers />
            </div>
            <div>
              <p style={styles.heroLabel}>GENERAL THERAPY CLINIC</p>
              <h1 style={styles.title}>Pacientes</h1>
              <p style={styles.subtitle}>
                Gestión premium de pacientes, expedientes clínicos y seguimiento fisioterapéutico.
              </p>
            </div>
          </div>
          <a href="/pacientes/nuevo" style={styles.newButton}>
            <FaUserPlus />
            Nuevo Paciente
          </a>
        </section>
        <section style={styles.searchCard}>
          <div style={styles.searchIcon}>
            <FaSearch />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.input}
          />
          {busqueda && (
            <button onClick={limpiarBusqueda} style={styles.clearButton}>
              Limpiar
            </button>
          )}
        </section>
        <section style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <div>
              <h2 style={styles.tableTitle}>Lista de pacientes</h2>
              <p style={styles.tableSubtitle}>
                {busqueda
                  ? `Resultados encontrados: ${pacientes.length}`
                  : `Total registrados: ${pacientes.length}`}
              </p>
            </div>
          </div>
          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Paciente</th>
                  <th style={styles.th}>Edad</th>
                  <th style={styles.th}>Sexo</th>
                  <th style={styles.th}>Teléfono</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan={5} style={styles.empty}>
                      Cargando pacientes...
                    </td>
                  </tr>
                ) : pacientes.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={styles.empty}>
                      No se encontraron pacientes.
                    </td>
                  </tr>
                ) : (
                  pacientes.map((paciente: any) => (
                    <tr key={paciente.id} style={styles.row}>
                      <td style={styles.td}>
                        <div style={styles.patientCell}>
                          <div style={styles.avatar}>
                            {paciente.nombre?.charAt(0) || "P"}
                          </div>
                          <div>
                            <p style={styles.patientName}>
                              {paciente.nombre || "Sin nombre"}
                            </p>
                            <p style={styles.patientId}>
                              ID: {paciente.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={styles.tdText}>
                        {paciente.edad || "-"}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.badge}>
                          {paciente.sexo || "-"}
                        </span>
                      </td>
                      <td style={styles.tdText}>
                        <span style={styles.phone}>
                          <FaPhoneAlt />
                          {paciente.telefono || "Sin teléfono"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <a
                            href={`/pacientes/expediente/${paciente.id}`}
                            style={styles.actionBlue}
                          >
                            <FaFolderOpen />
                            Expediente
                          </a>
                          <a
                            href={`/historias/nueva?nuevoPacienteId=${paciente.id}`}
                            style={styles.actionPurple}
                          >
                            <FaFileMedical />
                            Historia
                          </a>
                          <a
                            href={`/evolucion/nueva?nuevoPacienteId=${paciente.id}`}
                            style={styles.actionCyan}
                          >
                            <FaChartLine />
                            Evolución
                          </a>
                          <a
                            href={`/pacientes/editar/${paciente.id}`}
                            style={styles.actionYellow}
                          >
                            <FaEdit />
                            Editar
                          </a>
                          {rol === "admin" && (
                          <a
                            href={`/pacientes/eliminar/${paciente.id}`}
                            style={styles.actionRed}
                          >
                            <FaTrash />
                            Eliminar
                          </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
const baseAction = {
  color: "white",
  padding: "11px 14px",
  borderRadius: "12px",
  textDecoration: "none",
  fontWeight: "900",
  fontSize: "13px",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  border: "none",
};
const styles: any = {
  main: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left,#0b5cff 0%,#020617 35%,#111827 100%)",
    padding: "35px",
  },
  container: {
    maxWidth: "1500px",
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
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid rgba(125,211,252,0.25)",
  },
  hero: {
    background: "linear-gradient(90deg,#020617,#0f2f68,#0088ff)",
    borderRadius: "35px",
    padding: "38px",
    marginBottom: "30px",
    boxShadow: "0 0 55px rgba(0,102,255,0.35)",
    border: "1px solid rgba(125,211,252,0.25)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },
  heroContent: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  heroIcon: {
    width: "75px",
    height: "75px",
    background: "rgba(103,232,249,0.16)",
    border: "1px solid rgba(103,232,249,0.25)",
    borderRadius: "24px",
    color: "#67e8f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    boxShadow: "0 0 25px rgba(103,232,249,0.25)",
  },
  heroLabel: {
    color: "#7dd3fc",
    fontWeight: "900",
    letterSpacing: "3px",
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
  newButton: {
    background: "linear-gradient(90deg,#06b6d4,#67e8f9)",
    color: "#020617",
    padding: "17px 26px",
    borderRadius: "18px",
    textDecoration: "none",
    fontWeight: "900",
    fontSize: "15px",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 10px 30px rgba(6,182,212,0.35)",
  },
  searchCard: {
    background: "rgba(15,23,42,0.92)",
    padding: "22px",
    borderRadius: "26px",
    marginBottom: "30px",
    border: "1px solid rgba(125,211,252,0.20)",
    boxShadow: "0 15px 35px rgba(0,0,0,0.30)",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
  },
  searchIcon: {
    background: "rgba(11,92,255,0.22)",
    color: "#67e8f9",
    width: "50px",
    height: "50px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    minWidth: "260px",
    background: "#020617",
    color: "white",
    border: "1px solid rgba(125,211,252,0.35)",
    borderRadius: "16px",
    padding: "16px",
    outline: "none",
    fontSize: "16px",
    fontWeight: "700",
  },
  clearButton: {
    background: "#64748b",
    color: "white",
    padding: "14px 18px",
    borderRadius: "14px",
    border: "none",
    fontWeight: "900",
    cursor: "pointer",
  },
  tableCard: {
    background: "rgba(15,23,42,0.92)",
    borderRadius: "30px",
    border: "1px solid rgba(125,211,252,0.18)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.35)",
    overflow: "hidden",
  },
  tableHeader: {
    padding: "25px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  tableTitle: {
    color: "white",
    fontSize: "30px",
    fontWeight: "900",
    margin: 0,
  },
  tableSubtitle: {
    color: "#94a3b8",
    marginTop: "8px",
    fontWeight: "700",
  },
  tableScroll: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    minWidth: "1200px",
    borderCollapse: "collapse",
  },
  thead: {
    background: "linear-gradient(90deg,#0b5cff,#06b6d4)",
  },
  th: {
    color: "white",
    textAlign: "left",
    padding: "18px",
    fontWeight: "900",
    fontSize: "15px",
  },
  row: {
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  td: {
    padding: "18px",
    color: "#e2e8f0",
    verticalAlign: "middle",
  },
  tdText: {
    padding: "18px",
    color: "#e2e8f0",
    fontWeight: "700",
    verticalAlign: "middle",
  },
  patientCell: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "18px",
    background: "linear-gradient(145deg,#0b5cff,#06b6d4)",
    color: "white",
    fontWeight: "900",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 20px rgba(6,182,212,0.35)",
  },
  patientName: {
    color: "#67e8f9",
    fontWeight: "900",
    fontSize: "17px",
    margin: 0,
  },
  patientId: {
    color: "#64748b",
    fontSize: "13px",
    marginTop: "4px",
  },
  badge: {
    background: "rgba(11,92,255,0.22)",
    color: "#67e8f9",
    padding: "8px 14px",
    borderRadius: "999px",
    fontWeight: "900",
    fontSize: "13px",
    border: "1px solid rgba(103,232,249,0.12)",
  },
  phone: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "#cbd5e1",
  },
  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  actionBlue: {
    ...baseAction,
    background: "#0b5cff",
  },
  actionPurple: {
    ...baseAction,
    background: "#7c3aed",
  },
  actionCyan: {
    ...baseAction,
    background: "#06b6d4",
    color: "#020617",
  },
  actionYellow: {
    ...baseAction,
    background: "#facc15",
    color: "#111827",
  },
  actionRed: {
    ...baseAction,
    background: "#dc2626",
  },
  empty: {
    padding: "45px",
    textAlign: "center",
    color: "#94a3b8",
    fontWeight: "800",
    fontSize: "18px",
  },
};