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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#0b5cff_0%,#020617_38%,#111827_100%)] flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <section className="text-white hidden lg:block">
          <div className="bg-white rounded-[32px] p-5 w-[150px] h-[150px] flex items-center justify-center shadow-2xl mb-8">
            <Image src="/logo.png" alt="General Therapy Clinic" width={120} height={120} priority />
          </div>

          <p className="text-cyan-300 font-black tracking-[3px] mb-4">
            SISTEMA CLÍNICO INTEGRAL
          </p>

          <h1 className="text-6xl font-black leading-tight mb-5">
            General Therapy Clinic
          </h1>

          <p className="text-xl text-blue-100 max-w-xl font-semibold">
            Panel profesional para pacientes, citas, expedientes clínicos y seguimiento terapéutico.
          </p>

          <p className="mt-10 text-cyan-200 font-bold text-lg">
            “Tu esfuerzo de hoy es la recuperación de mañana.”
          </p>
        </section>

        <section className="bg-white/95 backdrop-blur-xl rounded-[34px] shadow-2xl p-8 md:p-10 border border-cyan-200/30">
          <div className="lg:hidden flex justify-center mb-6">
            <div className="bg-white rounded-[26px] p-4 w-[120px] h-[120px] flex items-center justify-center shadow-xl">
              <Image src="/logo.png" alt="General Therapy Clinic" width={95} height={95} priority />
            </div>
          </div>

          <p className="text-blue-600 font-black tracking-[2px] text-sm mb-2 text-center lg:text-left">
            ACCESO SEGURO
          </p>

          <h2 className="text-4xl font-black text-slate-900 mb-2 text-center lg:text-left">
            Iniciar sesión
          </h2>

          <p className="text-slate-500 font-semibold mb-8 text-center lg:text-left">
            Ingresa al sistema clínico de General Therapy Clinic.
          </p>

          <label className="font-black text-slate-700">Correo electrónico</label>
          <input
            type="email"
            className="w-full border border-slate-200 rounded-2xl p-4 mt-2 mb-5 outline-none focus:ring-4 focus:ring-blue-200 font-semibold text-slate-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
          />

          <label className="font-black text-slate-700">Contraseña</label>
          <input
            type="password"
            className="w-full border border-slate-200 rounded-2xl p-4 mt-2 mb-8 outline-none focus:ring-4 focus:ring-blue-200 font-semibold text-slate-900"
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
            className="w-full bg-gradient-to-r from-blue-700 to-cyan-500 hover:from-blue-800 hover:to-cyan-600 text-white py-4 rounded-2xl font-black shadow-xl disabled:opacity-70"
          >
            {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

          <p className="text-center text-slate-400 font-semibold text-sm mt-8">
            Sistema privado para uso interno del consultorio.
          </p>
        </section>
      </div>
    </main>
  );
}