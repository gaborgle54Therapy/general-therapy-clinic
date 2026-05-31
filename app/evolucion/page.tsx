import { supabase } from "../../lib/lib/supabase";

export default async function EvolucionesPage() {

  const { data: evoluciones, error } = await supabase
    .from("evolucion")
    .select(`
      *,
      pacientes (
        nombre
      )
    `)
    .order("fecha", { ascending: false });

  if (error) {
    console.log(error);
  }

  const totalEvoluciones = evoluciones?.length || 0;

  const evolucionesHoy =
    evoluciones?.filter((evo: any) => {
      const hoy = new Date()
        .toISOString()
        .split("T")[0];

      return evo.fecha === hoy;
    }).length || 0;

  return (

    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left,#0b5cff 0%,#020617 35%,#111827 100%)",
        padding: "35px",
      }}
    >

      <div style={{ maxWidth: "1600px", margin: "0 auto" }}>

        {/* REGRESAR */}

        <div style={{ marginBottom: "22px" }}>

          <a
            href="/"
            style={{
              background: "rgba(255,255,255,0.10)",
              color: "white",
              padding: "12px 18px",
              borderRadius: "14px",
              fontWeight: "900",
              fontSize: "14px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            ← Regresar
          </a>

        </div>

        {/* HEADER */}

        <div
          style={{
            background:
              "linear-gradient(90deg,#020617,#0f2f68,#0088ff)",
            borderRadius: "35px",
            padding: "38px",
            marginBottom: "30px",
            boxShadow:
              "0 0 55px rgba(0,102,255,0.35)",
            border:
              "1px solid rgba(125,211,252,0.25)",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >

            <div>

              <p
                style={{
                  color: "#7dd3fc",
                  fontWeight: "900",
                  letterSpacing: "2px",
                  marginBottom: "8px",
                }}
              >
                EVOLUCIONES CLÍNICAS
              </p>

              <h1
                style={{
                  fontSize: "52px",
                  fontWeight: "900",
                  color: "white",
                  margin: 0,
                }}
              >
                General Therapy Clinic
              </h1>

              <p
                style={{
                  color: "#dbeafe",
                  marginTop: "14px",
                  fontWeight: "600",
                }}
              >
                Registro de avances terapéuticos y seguimiento clínico.
              </p>

            </div>

            <a
              href="/evolucion/nueva"
              style={{
                background:
                  "linear-gradient(90deg,#0b5cff,#06b6d4)",
                color: "white",
                padding: "18px 28px",
                borderRadius: "18px",
                textDecoration: "none",
                fontWeight: "900",
                fontSize: "15px",
                boxShadow:
                  "0 10px 30px rgba(0,102,255,0.35)",
              }}
            >
              + Nueva Evolución
            </a>

          </div>

        </div>

        {/* RESUMEN */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(240px,1fr))",
            gap: "18px",
            marginBottom: "30px",
          }}
        >

          <ResumenCard
            titulo="Total evoluciones"
            valor={totalEvoluciones}
            color="#0ea5e9"
          />

          <ResumenCard
            titulo="Evoluciones hoy"
            valor={evolucionesHoy}
            color="#22c55e"
          />

          <ResumenCard
            titulo="Pacientes atendidos"
            valor={
              new Set(
                evoluciones?.map(
                  (evo: any) =>
                    evo.pacientes?.nombre
                )
              ).size
            }
            color="#f59e0b"
          />

        </div>

        {/* TABLA */}

        <div
          style={{
            background: "rgba(15,23,42,0.92)",
            borderRadius: "30px",
            padding: "25px",
            border:
              "1px solid rgba(125,211,252,0.18)",
            boxShadow:
              "0 20px 45px rgba(0,0,0,0.35)",
            overflowX: "auto",
          }}
        >

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1200px",
            }}
          >

            <thead>

              <tr
                style={{
                  background:
                    "linear-gradient(90deg,#0b5cff,#0284c7)",
                }}
              >

                <Th>Paciente</Th>

                <Th>Fecha</Th>

                <Th>EVA</Th>

                <Th>Dolor actual</Th>

                <Th>Tratamiento</Th>

                <Th>Progreso</Th>

                <Th>Próxima cita</Th>

                <Th>Expediente</Th>

              </tr>

            </thead>

            <tbody>

              {evoluciones?.map(
                (evolucion: any) => (

                  <tr
                    key={evolucion.id}
                    style={{
                      borderBottom:
                        "1px solid rgba(255,255,255,0.08)",
                      transition: "0.2s",
                    }}
                  >

                    <Td
                      bold
                      color="#67e8f9"
                    >
                      {
                        evolucion.pacientes?.nombre
                      }
                    </Td>

                    <Td>
                      {evolucion.fecha}
                    </Td>

                    <Td>

                     <span
  style={{
    background:
      evolucion.eva === null ||
      evolucion.eva === undefined
        ? "#6b7280"
        : Number(evolucion.eva) >= 7
        ? "#dc2626"
        : Number(evolucion.eva) >= 4
        ? "#f59e0b"
        : "#16a34a",

    color: "white",

    padding: "8px 14px",

    borderRadius: "999px",

    fontWeight: "900",

    fontSize: "13px",
  }}
>
  {evolucion.eva !== null &&
  evolucion.eva !== undefined
    ? `EVA ${evolucion.eva}`
    : "Sin EVA"}
</span>

                    </Td>

                    <Td>
                      {evolucion.dolor_actual}
                    </Td>

                    <Td>
                      {
                        evolucion.tratamiento_realizado
                      }
                    </Td>

                    <Td>
                      {evolucion.progreso}
                    </Td>

                    <Td>
                      {evolucion.proxima_cita}
                    </Td>

                    <Td>

                      <a
                        href={`/pacientes/expediente/${evolucion.paciente_id}`}
                        style={{
                          background:
                            "#0b5cff",

                          color: "white",

                          padding:
                            "10px 14px",

                          borderRadius:
                            "12px",

                          textDecoration:
                            "none",

                          fontWeight:
                            "900",

                          fontSize:
                            "13px",
                        }}
                      >
                        Ver expediente
                      </a>

                    </Td>

                  </tr>

                )
              )}

            </tbody>

          </table>

          {evoluciones?.length === 0 && (

            <div
              style={{
                textAlign: "center",
                padding: "50px",
                color: "#cbd5e1",
              }}
            >
              No hay evoluciones registradas.
            </div>

          )}

        </div>

      </div>

    </main>

  );
}

function ResumenCard({
  titulo,
  valor,
  color,
}: any) {

  return (

    <div
      style={{
        background:
          "rgba(15,23,42,0.92)",

        borderRadius: "25px",

        padding: "25px",

        border:
          "1px solid rgba(125,211,252,0.18)",

        boxShadow:
          "0 20px 45px rgba(0,0,0,0.35)",
      }}
    >

      <p
        style={{
          color: "#cbd5e1",
          fontWeight: "700",
          marginBottom: "10px",
        }}
      >
        {titulo}
      </p>

      <h2
        style={{
          color,
          fontSize: "42px",
          fontWeight: "900",
          margin: 0,
        }}
      >
        {valor}
      </h2>

    </div>

  );
}

function Th({
  children,
}: any) {

  return (

    <th
      style={{
        color: "white",
        textAlign: "left",
        padding: "18px",
        fontWeight: "900",
        fontSize: "15px",
      }}
    >
      {children}
    </th>

  );
}

function Td({
  children,
  bold = false,
  color = "#e2e8f0",
}: any) {

  return (

    <td
      style={{
        padding: "18px",
        color,
        fontWeight: bold ? "800" : "500",
        lineHeight: "1.5",
      }}
    >
      {children}
    </td>

  );
}