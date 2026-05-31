import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { nombre, email, password, rol } = await req.json();

    if (!nombre || !email || !password || !rol) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SERVICE:", process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20));
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    const { error: dbError } = await supabaseAdmin
      .from("usuario")
      .insert([
        {
          id: authData.user.id,
          nombre,
          email,
          rol,
          activo: true,
        },
      ]);

    if (dbError) {
      return NextResponse.json(
        { error: dbError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Usuario creado correctamente",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}