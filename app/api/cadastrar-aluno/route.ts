import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
  nome,
  email,
  senha,
  telefone,
  data_nascimento,
  plano_id,
  proximo_vencimento,
  observacoes,
} = body;

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: "Nome, e-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: {
          nome,
        },
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Erro ao criar usuário." },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    const { error: perfilError } = await supabaseAdmin
      .from("perfis")
      .upsert({
        id: userId,
        nome,
        tipo: "aluno",
        ativo: true,
        telefone: telefone || null,
        data_nascimento: data_nascimento || null,
        plano_id: plano_id ?? null,
proximo_vencimento: proximo_vencimento || null,
        observacoes: observacoes || null,
        status_financeiro: "em_dia",
      });

    if (perfilError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);

      return NextResponse.json(
        { error: perfilError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      aluno: {
        id: userId,
        nome,
        email,
      },
    });
  } catch (error) {
    console.error("Erro ao cadastrar aluno:", error);

    return NextResponse.json(
      { error: "Erro interno ao cadastrar aluno." },
      { status: 500 }
    );
  }
}