"use client";

import { useState } from "react";
import { supabase } from "../../lib/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const iniciarSesion = async () => {

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    alert("Correo o contraseña incorrectos");
    return;
  }

  const { data: usuario } = await supabase
    .from("usuario")
    .select("*")
    .eq("email", email)
    .single();
    console.log ("USARIO:", usuario);
    if (usuario){
      localStorage.setItem("rol", usuario.rol);
      localStorage.setItem("nombre", usuario.nombre);
      document.cookie = 'rol=${usuario.rol}; path=/; max-age=86400';
    }

  if (!usuario) {
  alert("Este usuario no tiene rol asignado. Contacta al administrador.");
  return;
}

console.log("USUARIO LOGIN:", usuario);

if (usuario?.activo === false) {
  alert("Usuario desactivado. Contacta al administrador.");
  return;

}

localStorage.setItem("rol", usuario.rol);
localStorage.setItem("nombre", usuario.nombre);

document.cookie = `rol=${usuario.rol}; path=/; max-age=86400`;

alert("Inicio de sesión correcto");

window.location.href = "/";
};

  return (
    <main className="min-h-screen bg-blue-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">
          General Therapy Clinic
        </h1>

        <p className="text-gray-500 mb-8">
          Acceso al sistema clínico
        </p>

        <label className="font-semibold">Correo electrónico</label>
        <input
          type="email"
          className="w-full border rounded-xl p-4 mt-2 mb-5"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="font-semibold">Contraseña</label>
        <input
          type="password"
          className="w-full border rounded-xl p-4 mt-2 mb-8"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={iniciarSesion}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-xl font-bold"
        >
          Iniciar sesión
        </button>
      </div>
    </main>
  );
}