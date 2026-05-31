"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "../../lib/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async () => {
    if (!email || !password) {
      alert("Escribe tu correo y contraseña");
      return;
    }

    setCargando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setCargando(false);
      alert("Correo o contraseña incorrectos");
      return;
    }

    const { data: usuario } = await supabase
      .from("usuario")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (!usuario) {
      setCargando(false);
      alert("Este usuario no tiene rol asignado. Contacta al administrador.");
      return;
    }

    if (usuario.activo === false) {
      setCargando(false);
      alert("Usuario desactivado. Contacta al administrador.");
      return;
    }

    localStorage.setItem("rol", usuario.rol);
    localStorage.setItem("nombre", usuario.nombre);
    localStorage.setItem("email", usuario.email);

    document.cookie = `rol=${usuario.rol}; path=/; max-age=86400`;

    window.location.href = "/";
  };

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <section style={styles.leftPanel}>
          <div style={styles.logoBox}>
            <Image
              src="/logo.png"
              alt="General Therapy Clinic"
              width={120}
              height={120}
              priority
            />
          </div>

          <p style={styles.label}>SISTEMA CLÍNICO INTEGRAL</p>

          <h1 style={styles.title}>General Therapy Clinic</h1>

          <p style={styles.subtitle}>
            Panel profesional para pacientes, citas, expedientes clínicos y
            seguimiento terapéutico.
          </p>

          <p style={styles.phrase}>
            “Tu esfuerzo de hoy es la recuperación de mañana.”
          </p>
        </section>

        <section style={styles.loginCard}>
          <div style={styles.mobileLogoBox}>
            <Image
              src="/logo.png"
              alt="General Therapy Clinic"
              width={90}
              height={90}
              priority
            />
          </div>

          <p style={styles.accessLabel}>ACCESO SEGURO</p>

          <h2 style={styles.loginTitle}>Iniciar sesión</h2>

          <p style={styles.loginSubtitle}>
            Ingresa al sistema clínico de General Therapy Clinic.
          </p>

          <label style={styles.inputLabel}>Correo electrónico</label>
          <input
            type="email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
          />

          <label style={styles.inputLabel}>Contraseña</label>
          <input
            type="password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            onKeyDown={(e) => {
              if (e.key === "Enter") iniciarSesion();
            }}
          />

          <button
            onClick={iniciarSesion}
            disabled={cargando}
            style={{
              ...styles.button,
              opacity: cargando ? 0.7 : 1,
              cursor: cargando ? "not-allowed" : "pointer",
            }}
          >
            {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

          <p style={styles.footerText}>
            Sistema privado para uso interno del consultorio.
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "28px",
    color: "white",
  },

  container: {
    width: "100%",
    maxWidth: "1180px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "34px",
    alignItems: "center",
  },

  leftPanel: {
    padding: "20px",
  },

  logoBox: {
    background: "white",
    borderRadius: "32px",
    padding: "18px",
    width: "158px",
    height: "158px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
    marginBottom: "30px",
  },

  label: {
    color: "#67e8f9",
    fontWeight: "900",
    letterSpacing: "3px",
    marginBottom: "14px",
  },

  title: {
    fontSize: "56px",
    lineHeight: "1.05",
    fontWeight: "900",
    margin: "0 0 18px 0",
  },

  subtitle: {
    fontSize: "19px",
    lineHeight: "1.6",
    color: "#dbeafe",
    fontWeight: "700",
    maxWidth: "590px",
  },

  phrase: {
    marginTop: "36px",
    color: "#a5f3fc",
    fontWeight: "900",
    fontSize: "18px",
  },

  loginCard: {
    background: "rgba(255,255,255,0.96)",
    borderRadius: "36px",
    padding: "38px",
    color: "#0f172a",
    boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
    border: "1px solid rgba(125,211,252,0.35)",
  },

  mobileLogoBox: {
    background: "white",
    borderRadius: "26px",
    padding: "14px",
    width: "122px",
    height: "122px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 15px 35px rgba(0,0,0,0.18)",
    margin: "0 auto 24px auto",
  },

  accessLabel: {
    color: "#0b5cff",
    fontWeight: "900",
    letterSpacing: "2px",
    fontSize: "14px",
    marginBottom: "8px",
    textAlign: "center",
  },

  loginTitle: {
    fontSize: "42px",
    fontWeight: "900",
    margin: "0 0 8px 0",
    textAlign: "center",
  },

  loginSubtitle: {
    color: "#64748b",
    fontWeight: "700",
    marginBottom: "28px",
    textAlign: "center",
  },

  inputLabel: {
    display: "block",
    fontWeight: "900",
    color: "#334155",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    padding: "16px",
    borderRadius: "18px",
    border: "1px solid #cbd5e1",
    marginBottom: "20px",
    outline: "none",
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    background: "#f8fafc",
  },

  button: {
    width: "100%",
    background: "linear-gradient(90deg,#0b5cff,#06b6d4)",
    color: "white",
    padding: "17px",
    borderRadius: "18px",
    border: "none",
    fontWeight: "900",
    fontSize: "16px",
    boxShadow: "0 15px 35px rgba(11,92,255,0.35)",
  },

  footerText: {
    textAlign: "center",
    color: "#94a3b8",
    fontWeight: "700",
    fontSize: "14px",
    marginTop: "24px",
  },
};