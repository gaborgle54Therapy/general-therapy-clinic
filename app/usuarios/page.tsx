"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/lib/supabase";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("fisio");
  const [password, setPassword] = useState("");

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function cargarUsuarios() {
    const { data, error } = await supabase
      .from("usuario")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      alert("Error al cargar usuarios: " + error.message);
      return;
    }

    setUsuarios(data || []);
  }

  async function crearUsuario() {
    if (!nombre || !email || !password || !rol) {
      alert("Completa nombre, email, contraseña y rol");
      return;
    }

    const respuesta = await fetch("/api/crear-usuario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password,
        rol,
      }),
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      alert("Error al crear usuario: " + resultado.error);
      return;
    }

    alert("Usuario creado correctamente");

    setNombre("");
    setEmail("");
    setPassword("");
    setRol("fisio");

    cargarUsuarios();
  }

  async function cambiarEstado(id: string, activoActual: boolean) {
    const correoActual = localStorage.getItem("email");

    const usuarioSeleccionado = usuarios.find((u) => u.id === id);

    if (usuarioSeleccionado?.email === correoActual) {
      alert("No puedes desactivar tu propia cuenta.");
      return;
    }

    const { error } = await supabase
      .from("usuario")
      .update({
        activo: !activoActual,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    cargarUsuarios();
  }

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <a href="/" style={styles.backButton}>
          ← Regresar
        </a>

        <section style={styles.hero}>
          <p style={styles.heroLabel}>ADMINISTRACIÓN</p>
          <h1 style={styles.title}>Usuarios</h1>
          <p style={styles.subtitle}>
            Gestiona fisioterapeutas, administradores y accesos del sistema.
          </p>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Crear nuevo usuario</h2>

          <div style={styles.formGrid}>
            <input
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={styles.input}
            />

            <input
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />

            <input
              placeholder="Contraseña temporal"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />

            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              style={styles.input}
            >
              <option value="fisio">Fisioterapeuta</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button onClick={crearUsuario} style={styles.primaryButton}>
            Crear usuario
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Usuarios registrados</h2>

          {usuarios.length === 0 ? (
            <p style={styles.emptyText}>No hay usuarios registrados.</p>
          ) : (
            <div style={styles.usersGrid}>
              {usuarios.map((u) => (
                <div key={u.id} style={styles.userCard}>
                  <h3 style={styles.userName}>{u.nombre}</h3>
                  <p style={styles.userEmail}>{u.email}</p>

                  <div style={styles.badges}>
                    <span
                      style={{
                        ...styles.badge,
                        background: u.rol === "admin" ? "#7c3aed" : "#0f766e",
                      }}
                    >
                      {u.rol === "admin" ? "Admin" : "Fisio"}
                    </span>

                    <span
                      style={{
                        ...styles.badge,
                        background: u.activo ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <button
                    onClick={() => cambiarEstado(u.id, u.activo)}
                    style={{
                      ...styles.statusButton,
                      background: u.activo ? "#dc2626" : "#16a34a",
                    }}
                  >
                    {u.activo ? "Desactivar" : "Activar"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const styles: any = {
  main: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left,#0b5cff 0%,#020617 35%,#111827 100%)",
    padding: "35px",
    color: "white",
  },

  container: {
    maxWidth: "1300px",
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
    marginBottom: "22px",
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
    margin: 0,
  },

  subtitle: {
    color: "#dbeafe",
    fontWeight: "700",
    marginTop: "14px",
  },

  card: {
    background: "rgba(15,23,42,0.92)",
    borderRadius: "30px",
    padding: "30px",
    marginBottom: "28px",
    border: "1px solid rgba(125,211,252,0.18)",
    boxShadow: "0 20px 45px rgba(0,0,0,0.35)",
  },

  sectionTitle: {
    fontSize: "28px",
    fontWeight: "900",
    color: "#7dd3fc",
    marginBottom: "22px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: "14px",
    marginBottom: "18px",
  },

  input: {
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid rgba(125,211,252,0.25)",
    background: "#f8fafc",
    color: "#020617",
    fontWeight: "700",
    outline: "none",
  },

  primaryButton: {
    background: "#0b5cff",
    color: "white",
    padding: "14px 22px",
    borderRadius: "14px",
    border: "none",
    fontWeight: "900",
    cursor: "pointer",
    width: "100%",
  },

  usersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: "16px",
  },

  userCard: {
    background: "#0f172a",
    borderRadius: "22px",
    padding: "20px",
    border: "1px solid rgba(125,211,252,0.14)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },

  userName: {
    fontSize: "20px",
    fontWeight: "900",
    marginBottom: "6px",
  },

  userEmail: {
    color: "#cbd5e1",
    fontWeight: "700",
    marginBottom: "14px",
  },

  badges: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "14px",
  },

  badge: {
    color: "white",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "900",
  },

  statusButton: {
    color: "white",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    fontWeight: "900",
    cursor: "pointer",
    width: "100%",
  },

  emptyText: {
    color: "#cbd5e1",
    fontWeight: "700",
  },
};