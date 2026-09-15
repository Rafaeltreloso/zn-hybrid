"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function entrar() {
    setErro("");

    if (!email.trim() || !senha.trim()) {
      setErro("Preencha seu e-mail e sua senha.");
      return;
    }

    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    setCarregando(false);

    if (error) {
      console.error("Erro no login:", error);
      setErro("E-mail ou senha incorretos.");
      return;
    }

    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
      <div className="w-full max-w-md">

        <div className="mb-10 text-center">
          <p className="text-sm font-black tracking-[0.35em] text-lime-400">
            ZN HYBRID
          </p>

          <h1 className="mt-4 text-4xl font-black">
            ENTRAR
          </h1>

          <p className="mt-3 text-zinc-500">
            Acesse sua conta para continuar.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

          <label className="text-sm font-bold text-zinc-400">
            E-MAIL
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@email.com"
            className="mt-2 w-full rounded-2xl border border-zinc-700 bg-black p-4 outline-none focus:border-lime-400"
          />

          <label className="mt-5 block text-sm font-bold text-zinc-400">
            SENHA
          </label>

          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                entrar();
              }
            }}
            placeholder="Sua senha"
            className="mt-2 w-full rounded-2xl border border-zinc-700 bg-black p-4 outline-none focus:border-lime-400"
          />

          {erro && (
            <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
              {erro}
            </p>
          )}

          <button
            onClick={entrar}
            disabled={carregando}
            className="mt-6 w-full rounded-2xl bg-lime-400 p-4 font-black text-black disabled:opacity-50"
          >
            {carregando ? "ENTRANDO..." : "ENTRAR"}
          </button>

        </div>

        <p className="mt-8 text-center text-xs text-zinc-700">
          ZN HYBRID • TRAINING
        </p>

      </div>
    </main>
  );
}