import { supabase } from "../../lib/lib/supabase";

export default async function CitasPage() {
  const { data: citas, error } = await supabase
    .from("citas")
    .select(`
      *,
      pacientes (
        nombre,
        telefono
      )
    `)
    .order("fecha", { ascending: true });

  if (error) {
    console.log(error);
  }

  function limpiarTelefono(telefono: string | undefined) {
    return telefono?.replace(/\D/g, "") || "";
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
      <h1 className="text-4xl font-bold text-blue-900 mb-2">
        Agenda de Citas
      </h1>

      <p className="text-gray-600 mb-10">
        Citas registradas en General Therapy Clinic
      </p>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th className="text-left p-4">Paciente</th>
              <th className="text-left p-4">Fecha</th>
              <th className="text-left p-4">Hora</th>
              <th className="text-left p-4">Motivo</th>
              <th className="text-left p-4">Estado</th>
              <th className="text-left p-4">WhatsApp</th>
            </tr>
          </thead>

          <tbody>
            {citas?.map((cita: any) => {
              const telefono = limpiarTelefono(cita.pacientes?.telefono);
              const telefonoConPais = telefono.startsWith("52")
                ? telefono
                : `52${telefono}`;

              const mensaje = `Hola ${cita.pacientes?.nombre}, le recordamos su cita en General Therapy Clinic el día ${cita.fecha} a las ${cita.hora}. Por favor confirme su asistencia.`;

              return (
                <tr key={cita.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{cita.pacientes?.nombre}</td>
                  <td className="p-4">{cita.fecha}</td>
                  <td className="p-4">{cita.hora}</td>
                  <td className="p-4">{cita.motivo}</td>
                  <td className="p-4">{cita.estado}</td>

                  <td className="p-4">
                    {telefono ? (
                      <a
  href={`https://wa.me/${telefonoConPais}?text=${encodeURIComponent(mensaje)}`}
  target="_blank"
  rel="noopener noreferrer"
  style={{
    backgroundColor: "#22c55e",
    color: "white",
    padding: "10px 14px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "bold",
    display: "inline-block",
  }}
>
  WhatsApp
</a>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>
                        Sin teléfono
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}