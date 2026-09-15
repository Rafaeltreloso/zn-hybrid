"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type Exercicio = {
  id: number;
  nome: string;
  ordem: number;
};

type CronometroAula = {
  id: number;
  aula_id: number;

  duracao_segundos: number;
  intervalo_segundos: number | null;
  tempo_pausado_segundos: number | null;

trabalho_segundos: number | null;
descanso_segundos: number | null;
total_rounds: number | null;

  inicio_em: string | null;
  fim_em: string | null;

  status: "aguardando" | "rodando" | "pausado" | "finalizado";
  tipo: "regressivo" | "progressivo" | "emom" | "intervalado";
  
};

type Checkin = {
  id: number;
  aula_id: number;
  aluno_id: string;
  status: string;
};

type ContagemCheckin = {
  aula_id: number;
  total: number;
};

type Aula = {
  id: number;
  data: string;
  horario: string;
  local: string | null;
  vagas: number;
  ativa: boolean;
  treino_id: number | null;
  tipo_treino: string | null;
};

type AlunoInscrito = {
  id: string;
  nome: string | null;
  status: string;
};

type Perfil = {
  id: string;
  nome: string | null;
  tipo: string;
  ativo: boolean;
  telefone: string | null;
  status_financeiro: string;
  data_nascimento: string | null;
  plano_id: number | null;
proximo_vencimento: string | null;
  observacoes: string | null;
};

type Recorde = {
  id: number;
  modalidade: string;
  valor: number;
  unidade: string;
  criterio: "maior" | "menor";
  data: string;
};

type Treino = {
  id: number;
  titulo: string;
  data: string;
  tipo_treino: string | null;
};

export default function Home() {
  const router = useRouter();

  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [exerciciosInicio, setExerciciosInicio] = useState<Exercicio[]>([]);
  const [filtroTreino, setFiltroTreino] = useState<
  "todos" | "passados" | "hoje" | "futuros" | null
>(null);
const [filtroAlunos, setFiltroAlunos] = useState<
  "todos" | "ativos" | "inativos" | "em_dia" | "em_atraso"
>("todos");
const [paginaAlunos, setPaginaAlunos] = useState(1);

const alunosPorPagina = 10;
const [alunoPagamento, setAlunoPagamento] = useState<Perfil | null>(null);
const [valorPagamento, setValorPagamento] = useState("");
const [dataPagamento, setDataPagamento] = useState(
  new Date().toISOString().split("T")[0]
);
const [novoTreinoTipo, setNovoTreinoTipo] = useState("");
const [novoAlunoPlanoId, setNovoAlunoPlanoId] = useState<number | null>(null);
const [novoAlunoVencimento, setNovoAlunoVencimento] = useState("");
const [intervaloEmom, setIntervaloEmom] = useState(1);
  const [novoExercicio, setNovoExercicio] = useState("");
  const [treinoId, setTreinoId] = useState<number | null>(null);
  const [tituloTreinoAtual, setTituloTreinoAtual] = useState("");
  const [tipoTreinoAluno, setTipoTreinoAluno] = useState("");
  const [concluidos, setConcluidos] = useState<number[]>([]);
  const [carregando, setCarregando] = useState(true);
const [aulas, setAulas] = useState<Aula[]>([]);
const [trabalhoIntervalado, setTrabalhoIntervalado] = useState(40);
const [descansoIntervalado, setDescansoIntervalado] = useState(20);
const [roundsIntervalado, setRoundsIntervalado] = useState(8);
const [resumoFrequencia, setResumoFrequencia] = useState({
  presentes: 0,
  faltas: 0,
  ultimos30Dias: 0,
});
const [planos, setPlanos] = useState<any[]>([]);
const [novoPlanoNome, setNovoPlanoNome] = useState("");
const [novoPlanoValor, setNovoPlanoValor] = useState("");
const [novoPlanoMeses, setNovoPlanoMeses] = useState(1);
const [planoEditando, setPlanoEditando] = useState<any | null>(null);
const [pagamentos, setPagamentos] = useState<any[]>([]);
const [tipoCronometro, setTipoCronometro] = useState<
  "regressivo" | "progressivo" | "emom" | "intervalado"
>("regressivo");
const [mostrarNovoTreino, setMostrarNovoTreino] = useState(false);
const [dataTreinoAtual, setDataTreinoAtual] = useState("");
const [tipoTreinoAtual, setTipoTreinoAtual] = useState("");
const [cronometroAula, setCronometroAula] =
  useState<CronometroAula | null>(null);
const [temposRestantesAulas, setTemposRestantesAulas] = useState<
  Record<number, number>
>({});
  const [cronometrosAulas, setCronometrosAulas] = useState<
  Record<number, CronometroAula>
>({});

const [tempoRestante, setTempoRestante] = useState(0);

const [duracaoCronometro, setDuracaoCronometro] = useState(20);
const [alunoEditando, setAlunoEditando] = useState<Perfil | null>(null);
const [buscaAluno, setBuscaAluno] = useState("");
const [mostrarCadastroAluno, setMostrarCadastroAluno] = useState(false);
const [alunoDetalhes, setAlunoDetalhes] = useState<Perfil | null>(null);
const [aulasCanceladas, setAulasCanceladas] = useState<Aula[]>([]);
const [checkins, setCheckins] = useState<Checkin[]>([]);
const [alunosInscritos, setAlunosInscritos] = useState<AlunoInscrito[]>([]);
const [aulaSelecionada, setAulaSelecionada] = useState<number | null>(null);
const [novoAlunoEmail, setNovoAlunoEmail] = useState("");
const [novoAlunoSenha, setNovoAlunoSenha] = useState("");
const [contagemCheckins, setContagemCheckins] = useState<ContagemCheckin[]>([]);
const [horasRecorde, setHorasRecorde] = useState("");
const [nomeRecordePersonalizado, setNomeRecordePersonalizado] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [novoAlunoNome, setNovoAlunoNome] = useState("");
const [novoAlunoTelefone, setNovoAlunoTelefone] = useState("");
const [novoAlunoNascimento, setNovoAlunoNascimento] = useState("");
const [novoAlunoPlano, setNovoAlunoPlano] = useState("");
const [novoAlunoObservacoes, setNovoAlunoObservacoes] = useState("");
  const [statusFinanceiro, setStatusFinanceiro] = useState("em_dia");
  const [modoGestao, setModoGestao] = useState(false);
  const [abaGestao, setAbaGestao] = useState<
  "treino" | "alunos" | "checkins" | "financeiro"
>("treino");
  const [alunos, setAlunos] = useState<Perfil[]>([]);
  const [dataAula, setDataAula] = useState("");
  const [modalidadeSelecionada, setModalidadeSelecionada] = useState<string | null>(null);
  const [treinoAula, setTreinoAula] = useState<number | null>(null);
  const [buscaTreinoAula, setBuscaTreinoAula] = useState("");
  const [filtroTreinoAula, setFiltroTreinoAula] = useState<
  "futuros" | "hoje" | "passados" | "todos"
>("futuros");
const [mostrarSeletorTreinoAula, setMostrarSeletorTreinoAula] = useState(true);
  const [abaAluno, setAbaAluno] = useState<
  "treino" | "aulas" | "recordes"
>("treino");
const [criterioRecorde, setCriterioRecorde] = useState<
  "menor" | "maior"
>("maior");
const [buscaTreino, setBuscaTreino] = useState("");
const [recordes, setRecordes] = useState<Recorde[]>([]);
const [minutosRecorde, setMinutosRecorde] = useState("");
const [segundosRecorde, setSegundosRecorde] = useState("");
const [horarioAula, setHorarioAula] = useState("");
const [localAula, setLocalAula] = useState("");
const [vagasAula, setVagasAula] = useState(20);
const [aulaEditando, setAulaEditando] = useState<Aula | null>(null);
const [treinosDisponiveis, setTreinosDisponiveis] = useState<Treino[]>([]);
const [modalidadeRecorde, setModalidadeRecorde] = useState("");
const [novoTreinoNome, setNovoTreinoNome] = useState("");
const [novoTreinoData, setNovoTreinoData] = useState(
  new Date().toISOString().split("T")[0]
);
const [aulaListaAberta, setAulaListaAberta] = useState<number | null>(null);
const [valorRecorde, setValorRecorde] = useState("");
const [unidadeRecorde, setUnidadeRecorde] = useState("");
const [dataRecorde, setDataRecorde] = useState(
  new Date().toISOString().split("T")[0]
);
  type Perfil = {
  id: string;
  nome: string | null;
  tipo: string;
  ativo: boolean;
  telefone: string | null;
  status_financeiro: string;
};

useEffect(() => {
  iniciarApp();
}, []);

useEffect(() => {
  async function carregarExerciciosInicio() {
    const proximaAula = aulas[0];

    if (!proximaAula?.treino_id) {
      setExerciciosInicio([]);
      return;
    }

    const { data, error } = await supabase
      .from("exercicios")
      .select("*")
      .eq("treino_id", proximaAula.treino_id)
      .order("ordem", { ascending: true });

    if (error) {
      console.error("Erro ao carregar exercícios da página inicial:", error);
      setExerciciosInicio([]);
      return;
    }

    setExerciciosInicio(data || []);
  }

  carregarExerciciosInicio();
}, [aulas]);

useEffect(() => {
  setPaginaAlunos(1);
}, [buscaAluno, filtroAlunos]);

useEffect(() => {
  const atualizarTemposDasAulas = () => {
    const agora = Date.now();

    const novosTempos: Record<number, number> = {};

    Object.entries(cronometrosAulas).forEach(
      ([aulaIdTexto, cronometro]) => {
        const aulaId = Number(aulaIdTexto);

       if (cronometro.status === "rodando") {
  if (
    cronometro.tipo === "progressivo" &&
    cronometro.inicio_em
  ) {
    const inicio = new Date(cronometro.inicio_em).getTime();

    novosTempos[aulaId] = Math.max(
      0,
      Math.floor((agora - inicio) / 1000)
    );
  } else if (cronometro.fim_em) {
    const fim = new Date(cronometro.fim_em).getTime();

    novosTempos[aulaId] = Math.max(
      0,
      Math.ceil((fim - agora) / 1000)
    );
  }
} else if (cronometro.status === "pausado") {
  novosTempos[aulaId] = cronometro.duracao_segundos;
} else {
  novosTempos[aulaId] = 0;
}
if (
  cronometro.status === "rodando" &&
  cronometro.tipo !== "progressivo" &&
  novosTempos[aulaId] === 0 &&
  tipoUsuario === "admin"
) {
  finalizarCronometroAula(aulaId);
}
      }
    );

    setTemposRestantesAulas(novosTempos);
    if (aulaSelecionada) {
  const tempoDaAulaSelecionada =
    novosTempos[aulaSelecionada] ?? 0;

  setTempoRestante(tempoDaAulaSelecionada);
}
  };

  atualizarTemposDasAulas();

  const intervalo = setInterval(
    atualizarTemposDasAulas,
    1000
  );

  return () => clearInterval(intervalo);
}, [cronometrosAulas, aulaSelecionada]);

useEffect(() => {
  if (!aulaSelecionada) {
    return;
  }

  const canal = supabase
    .channel(`cronometro-aula-${aulaSelecionada}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "cronometros_aula",
        filter: `aula_id=eq.${aulaSelecionada}`,
      },
      (payload) => {
    
        const novoCronometro = payload.new as CronometroAula;

        if (!novoCronometro?.id) {
          return;
        }

        setCronometroAula(novoCronometro);

        setCronometrosAulas((atual) => ({
  ...atual,
  [novoCronometro.aula_id]: novoCronometro,
}));

        if (
          novoCronometro.status === "rodando" &&
          novoCronometro.fim_em
        ) {
          const fim = new Date(novoCronometro.fim_em).getTime();
          const agora = Date.now();

          const restante = Math.max(
  0,
  Math.ceil((fim - agora) / 1000)
);

setTempoRestante(restante);
        }
      }
    )
    .subscribe((status) => {
  console.log("Realtime cronômetro:", status);
});

  return () => {
    supabase.removeChannel(canal);
  };
}, [aulaSelecionada]);

const planosAtivos = planos.filter((plano) => plano.ativo);

const planosInativos = planos.filter((plano) => !plano.ativo);

const planosOrganizados = [
  ...planosAtivos,
  ...planosInativos,
];

const treinosFiltradosParaAula = treinosDisponiveis.filter((treino) => {
  const correspondeBusca = treino.titulo
    .toLowerCase()
    .includes(buscaTreinoAula.trim().toLowerCase());

  if (!correspondeBusca) return false;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataTreino = new Date(`${treino.data}T00:00:00`);

  if (filtroTreinoAula === "hoje") {
    return dataTreino.getTime() === hoje.getTime();
  }

  if (filtroTreinoAula === "futuros") {
    return dataTreino >= hoje;
  }

  if (filtroTreinoAula === "passados") {
    return dataTreino < hoje;
  }

  return true;
});

async function carregarPagamentos() {
  const { data, error } = await supabase
    .from("pagamentos")
    .select(`
      id,
      aluno_id,
      plano_id,
      valor,
      data_pagamento,
      vencimento_anterior,
      novo_vencimento,
      observacoes,
      perfis:aluno_id (
        nome
      ),
      planos:plano_id (
        nome
      )
    `)
    .order("data_pagamento", { ascending: false });

  if (error) {
    console.error("Erro ao carregar pagamentos:", error);
    return;
  }

  setPagamentos(data || []);
}

async function carregarPlanos() {
  const { data, error } = await supabase
    .from("planos")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao carregar planos:", error);
    return;
  }

  setPlanos(data || []);
}



async function registrarPagamento() {
  if (!alunoPagamento) {
    alert("Nenhum aluno selecionado.");
    return;
  }
await carregarPlanos();

  if (!alunoPagamento.plano_id) {
    alert("Este aluno não possui um plano definido.");
    return;
  }

  if (!alunoPagamento.proximo_vencimento) {
    alert("Este aluno não possui vencimento definido.");
    return;
  }

  const { data: plano, error: erroPlano } = await supabase
  .from("planos")
  .select("id, nome, valor, meses_ciclo")
  .eq("id", alunoPagamento.plano_id)
  .single();

if (erroPlano || !plano) {
  console.error("Erro ao localizar plano:", erroPlano);
  alert("Não foi possível localizar o plano do aluno.");
  return;
}

  const valor = Number(
    String(valorPagamento).replace(",", ".")
  );

  if (Number.isNaN(valor) || valor <= 0) {
    alert("Informe um valor válido.");
    return;
  }

  const vencimentoAtual = new Date(
    `${alunoPagamento.proximo_vencimento}T12:00:00`
  );

  vencimentoAtual.setMonth(
    vencimentoAtual.getMonth() + plano.meses_ciclo
  );

  const novoVencimento =
    vencimentoAtual.toISOString().split("T")[0];

  const { error: erroPagamento } = await supabase
    .from("pagamentos")
    .insert({
      aluno_id: alunoPagamento.id,
      plano_id: alunoPagamento.plano_id,
      valor,
      data_pagamento: dataPagamento,
      vencimento_anterior:
        alunoPagamento.proximo_vencimento,
      novo_vencimento: novoVencimento,
    });

  if (erroPagamento) {
  console.error("Erro ao registrar pagamento:", {
    message: erroPagamento.message,
    details: erroPagamento.details,
    hint: erroPagamento.hint,
    code: erroPagamento.code,
  });

  alert(
    `Erro ao registrar pagamento:\n${erroPagamento.message}\nCódigo: ${erroPagamento.code}`
  );

  return;
}

  const { error: erroAluno } = await supabase
    .from("perfis")
    .update({
      proximo_vencimento: novoVencimento,
      status_financeiro: "em_dia",
    })
    .eq("id", alunoPagamento.id);

  if (erroAluno) {
    console.error(
      "Erro ao atualizar aluno:",
      erroAluno
    );
    alert("Pagamento salvo, mas houve erro ao atualizar o aluno.");
    return;
  }

  setAlunoPagamento(null);
  setValorPagamento("");
  setDataPagamento(
    new Date().toISOString().split("T")[0]
  );

  await carregarAlunos();

  alert("Pagamento registrado com sucesso!");
}

async function atualizarInadimplenciaAutomatica() {
  const hoje = new Date().toISOString().split("T")[0];

  const { data: alunosFinanceiro, error } = await supabase
    .from("perfis")
    .select("id, proximo_vencimento, status_financeiro")
    .eq("tipo", "aluno");

  if (error) {
    console.error("Erro ao verificar inadimplência:", error);
    return;
  }

  for (const aluno of alunosFinanceiro || []) {
    if (!aluno.proximo_vencimento) {
      continue;
    }

    const novoStatus =
      aluno.proximo_vencimento < hoje
        ? "inadimplente"
        : "em_dia";

    if (aluno.status_financeiro !== novoStatus) {
      await supabase
        .from("perfis")
        .update({
          status_financeiro: novoStatus,
        })
        .eq("id", aluno.id);
    }
  }
}

async function alterarStatusPlano(plano: any) {
  const novoStatus = !plano.ativo;

  const { error } = await supabase
    .from("planos")
    .update({
      ativo: novoStatus,
    })
    .eq("id", plano.id);

  if (error) {
    console.error("Erro ao alterar status do plano:", error);
    alert("Não foi possível alterar o status do plano.");
    return;
  }

  await carregarPlanos();
}

async function atualizarPlano() {
  if (!planoEditando) return;

  if (!novoPlanoNome.trim()) {
    alert("Informe o nome do plano.");
    return;
  }

  const valor = Number(
    String(novoPlanoValor).replace(",", ".")
  );

  if (Number.isNaN(valor) || valor < 0) {
    alert("Informe um valor válido.");
    return;
  }

  if (!novoPlanoMeses || novoPlanoMeses < 1) {
    alert("Informe a duração do plano.");
    return;
  }

  const { error } = await supabase
    .from("planos")
    .update({
      nome: novoPlanoNome.trim(),
      valor,
      meses_ciclo: novoPlanoMeses,
    })
    .eq("id", planoEditando.id);

  if (error) {
    console.error("Erro ao atualizar plano:", error);
    alert("Não foi possível atualizar o plano.");
    return;
  }

  setPlanoEditando(null);
  setNovoPlanoNome("");
  setNovoPlanoValor("");
  setNovoPlanoMeses(1);

  await carregarPlanos();

  alert("Plano atualizado com sucesso!");
}

async function criarPlano() {
  if (!novoPlanoNome.trim()) {
    alert("Informe o nome do plano.");
    return;
  }

  const valor = Number(
    String(novoPlanoValor).replace(",", ".")
  );

  if (Number.isNaN(valor) || valor < 0) {
    alert("Informe um valor válido.");
    return;
  }

  if (!novoPlanoMeses || novoPlanoMeses < 1) {
    alert("Informe a duração do plano.");
    return;
  }

  const { error } = await supabase
    .from("planos")
    .insert({
      nome: novoPlanoNome.trim(),
      valor,
      meses_ciclo: novoPlanoMeses,
      ativo: true,
    });

  if (error) {
  console.error("Erro ao criar plano:", {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });

  alert(
    `Erro ao criar plano:\n${error.message}\nCódigo: ${error.code}`
  );

  return;
}

  setNovoPlanoNome("");
  setNovoPlanoValor("");
  setNovoPlanoMeses(1);

  await carregarPlanos();

  alert("Plano criado com sucesso!");
}

  async function iniciarApp() {
    setCarregando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: perfil, error: erroPerfil } = await supabase
      .from("perfis")
      .select("nome, tipo, status_financeiro")
      .eq("id", user.id)
      .single();

    if (erroPerfil || !perfil) {
      console.error("Erro ao carregar perfil:", erroPerfil);
      setCarregando(false);
      return;
    }

    setTipoUsuario(perfil.tipo);
    setNomeUsuario(perfil.nome || "Atleta");
    setStatusFinanceiro(perfil.status_financeiro || "em_dia");

    await carregarTreino();
    await carregarAulas();
    await carregarCheckins();
    await carregarContagemCheckins();
    await carregarTreinosDisponiveis();
    await carregarCronometrosDasAulas();
    
    setCarregando(false);
  }

  async function criarNovoTreino() {
  if (!novoTreinoNome.trim()) {
    alert("Informe o nome do treino.");
    return;
  }

  if (!novoTreinoData) {
    alert("Informe a data do treino.");
    return;
  }

  const { data: novoTreino, error } = await supabase
    .from("treinos")
    .insert({
      titulo: novoTreinoNome.trim(),
      tipo_treino: novoTreinoTipo.trim() || null,
      data: novoTreinoData,
      publicado: true,
      
    })
    .select()
    .single();

  if (error || !novoTreino) {
    console.error("Erro ao criar treino:", error);
    alert("Não foi possível criar o treino.");
    return;
  }

  setTreinoId(novoTreino.id);
  setTituloTreinoAtual(novoTreino.titulo);
  setDataTreinoAtual(novoTreino.data);
  setExercicios([]);
  setConcluidos([]);

  setNovoTreinoNome("");
  setNovoTreinoTipo("");
  setNovoTreinoData(new Date().toISOString().split("T")[0]);

  await carregarTreinosDisponiveis();

  alert("Treino criado com sucesso!");
  setMostrarNovoTreino(false);
}

  async function carregarFrequenciaAluno(alunoId: string) {
  const { data: checkinsAluno, error: erroCheckins } = await supabase
    .from("checkins")
    .select("aula_id, status")
    .eq("aluno_id", alunoId)
    .in("status", ["presente", "faltou"]);

  if (erroCheckins) {
    console.error("Erro ao carregar frequência:", erroCheckins);
    return;
  }

  const idsAulas = (checkinsAluno || []).map((item) => item.aula_id);

  if (idsAulas.length === 0) {
    setResumoFrequencia({
      presentes: 0,
      faltas: 0,
      ultimos30Dias: 0,
    });
    return;
  }

  const { data: aulasAluno, error: erroAulas } = await supabase
    .from("aulas")
    .select("id, data")
    .in("id", idsAulas);

  if (erroAulas) {
    console.error("Erro ao carregar aulas do aluno:", erroAulas);
    return;
  }

  const hoje = new Date();
  const limite30Dias = new Date();
  limite30Dias.setDate(hoje.getDate() - 30);

  const presentes = (checkinsAluno || []).filter(
    (item) => item.status === "presente"
  ).length;

  const faltas = (checkinsAluno || []).filter(
    (item) => item.status === "faltou"
  ).length;

  const idsUltimos30Dias = new Set(
    (aulasAluno || [])
      .filter((aula) => new Date(aula.data) >= limite30Dias)
      .map((aula) => aula.id)
  );

  const ultimos30Dias = (checkinsAluno || []).filter(
    (item) =>
      item.status === "presente" &&
      idsUltimos30Dias.has(item.aula_id)
  ).length;

  setResumoFrequencia({
    presentes,
    faltas,
    ultimos30Dias,
  });
}

async function carregarCronometrosDasAulas() {
  const { data, error } = await supabase
    .from("cronometros_aula")
    .select("*");

  if (error) {
    console.error("Erro ao carregar cronômetros das aulas:", error);
    return;
  }

  const mapaCronometros: Record<number, CronometroAula> = {};

  (data || []).forEach((cronometro) => {
    mapaCronometros[cronometro.aula_id] = cronometro;
  });

  setCronometrosAulas(mapaCronometros);
}

async function carregarCronometroAula(aulaId: number) {
  const { data, error } = await supabase
    .from("cronometros_aula")
    .select("*")
    .eq("aula_id", aulaId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao carregar cronômetro:", error);
    return;
  }

if (!data) {
  setCronometroAula(null);

  setCronometrosAulas((atual) => {
    const copia = { ...atual };
    delete copia[aulaId];
    return copia;
  });

  setTempoRestante(0);
  return;
}

  setCronometroAula(data);
setCronometrosAulas((atual) => ({
  ...atual,
  [aulaId]: data,
}));


  if (data.status === "rodando" && data.fim_em) {
    const fim = new Date(data.fim_em).getTime();
    const agora = Date.now();

    const segundosRestantes = Math.max(
      0,
      Math.ceil((fim - agora) / 1000)
    );

    setTempoRestante(segundosRestantes);
  } else {
    setTempoRestante(data.duracao_segundos || 0);
  }
}

async function retomarCronometroAula(aulaId: number) {
  if (
    !cronometroAula ||
    cronometroAula.aula_id !== aulaId ||
    cronometroAula.status !== "pausado"
  ) {
    return;
  }

const agora = new Date();

let novoInicio = agora;
let novoFim: Date | null = null;

if (
  cronometroAula.tipo === "emom" ||
  cronometroAula.tipo === "intervalado"
) {
  const tempoPausado =
    cronometroAula.tempo_pausado_segundos ?? 0;

  novoInicio = new Date(
    agora.getTime() - tempoPausado * 1000
  );

  const restanteTotal = Math.max(
    0,
    cronometroAula.duracao_segundos - tempoPausado
  );

  novoFim = new Date(
    agora.getTime() + restanteTotal * 1000
  );
} else if (cronometroAula.tipo === "progressivo") {
  const tempoSalvo = cronometroAula.duracao_segundos;

  novoInicio = new Date(
    agora.getTime() - tempoSalvo * 1000
  );
} else {
  const tempoSalvo = cronometroAula.duracao_segundos;

  novoFim = new Date(
    agora.getTime() + tempoSalvo * 1000
  );
}

  const { data, error } = await supabase
    .from("cronometros_aula")
    .update({
  status: "rodando",
  inicio_em: novoInicio.toISOString(),
  fim_em: novoFim ? novoFim.toISOString() : null,
  tempo_pausado_segundos: null,
  updated_at: agora.toISOString(),
})
    .eq("aula_id", aulaId)
    .eq("status", "pausado")
    .select()
    .single();

  if (error) {
    console.error("Erro ao retomar cronômetro:", error);
    alert("Não foi possível retomar o cronômetro.");
    return;
  }

  setCronometroAula(data);
  setCronometrosAulas((atual) => ({
  ...atual,
  [aulaId]: data,
}));
 if (
  cronometroAula.tipo === "emom" ||
  cronometroAula.tipo === "intervalado"
) {
  setTempoRestante(
    Math.max(
      0,
      cronometroAula.duracao_segundos -
        (cronometroAula.tempo_pausado_segundos ?? 0)
    )
  );
} else {
  setTempoRestante(cronometroAula.duracao_segundos);
}
}

async function pausarCronometroAula(aulaId: number) {
  if (
    !cronometroAula ||
    cronometroAula.aula_id !== aulaId ||
    cronometroAula.status !== "rodando"
  ) {
    return;
  }

  const tempoAtual = Math.max(
  0,
  temposRestantesAulas[aulaId] ?? 0
);

let dadosPausa: {
  duracao_segundos?: number;
  tempo_pausado_segundos?: number;
};

if (
  cronometroAula.tipo === "emom" ||
  cronometroAula.tipo === "intervalado"
) {
  const inicio = cronometroAula.inicio_em
    ? new Date(cronometroAula.inicio_em).getTime()
    : Date.now();

  const decorrido = Math.max(
    0,
    Math.floor((Date.now() - inicio) / 1000)
  );

  dadosPausa = {
    tempo_pausado_segundos: decorrido,
  };
} else {
  dadosPausa = {
    duracao_segundos: tempoAtual,
  };
}

  const { data, error } = await supabase
    .from("cronometros_aula")
   .update({
  status: "pausado",
  ...dadosPausa,
  fim_em: null,
  updated_at: new Date().toISOString(),
})
    .eq("aula_id", aulaId)
    .eq("status", "rodando")
    .select()
    .single();

  if (error) {
    console.error("Erro ao pausar cronômetro:", error);
    alert("Não foi possível pausar o cronômetro.");
    return;
  }

  setCronometroAula(data);
  setCronometrosAulas((atual) => ({
  ...atual,
  [aulaId]: data,
}));
 setTempoRestante(tempoAtual);
}

async function iniciarCronometroAula(aulaId: number) {
  if (!duracaoCronometro || duracaoCronometro <= 0) {
    alert("Informe uma duração válida.");
    return;
  }

  const duracaoSegundos =
  tipoCronometro === "intervalado"
    ? trabalhoIntervalado * roundsIntervalado +
      descansoIntervalado * Math.max(0, roundsIntervalado - 1)
    : duracaoCronometro * 60;

  const inicio = new Date();
  const fim = new Date(inicio.getTime() + duracaoSegundos * 1000);

  const { data, error } = await supabase
    .from("cronometros_aula")
    .upsert(
      {
        aula_id: aulaId,
        tipo: tipoCronometro,
        duracao_segundos: duracaoSegundos,
        intervalo_segundos:
  tipoCronometro === "emom"
    ? intervaloEmom * 60
    : null,
        inicio_em: inicio.toISOString(),
        fim_em: fim.toISOString(),
        status: "rodando",
        updated_at: new Date().toISOString(),
        trabalho_segundos:
  tipoCronometro === "intervalado"
    ? trabalhoIntervalado
    : null,

descanso_segundos:
  tipoCronometro === "intervalado"
    ? descansoIntervalado
    : null,

total_rounds:
  tipoCronometro === "intervalado"
    ? roundsIntervalado
    : null,

      },
      {
        onConflict: "aula_id",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Erro ao iniciar cronômetro:", error);
    alert("Não foi possível iniciar o cronômetro.");
    return;
  }

  setCronometroAula(data);
  setTempoRestante(duracaoSegundos);

  setCronometrosAulas((atual) => ({
  ...atual,
  [aulaId]: data,
}));

  alert("Cronômetro iniciado!");
}

  async function carregarTreinosDisponiveis() {
  const { data, error } = await supabase
    .from("treinos")
    .select("id, titulo, data, tipo_treino")
    .order("data", { ascending: false });

  if (error) {
    console.error("Erro ao carregar treinos:", error);
    return;
  }

  setTreinosDisponiveis(data || []);
}

async function cadastrarNovoAluno() {
  if (!novoAlunoNome.trim()) {
    alert("Informe o nome do aluno.");
    return;
  }

  if (!novoAlunoEmail.trim()) {
    alert("Informe o e-mail do aluno.");
    return;
  }

  if (novoAlunoSenha.length < 6) {
    alert("A senha deve ter pelo menos 6 caracteres.");
    return;
  }

  try {
    const resposta = await fetch("/api/cadastrar-aluno", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome: novoAlunoNome.trim(),
        email: novoAlunoEmail.trim(),
        senha: novoAlunoSenha,
        telefone: novoAlunoTelefone.trim(),
        data_nascimento: novoAlunoNascimento || null,
        plano_id: novoAlunoPlanoId,
proximo_vencimento: novoAlunoVencimento || null,
        observacoes: novoAlunoObservacoes.trim(),
      }),
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      alert(`Erro ao cadastrar aluno: ${resultado.error}`);
      return;
    }

    alert("Aluno cadastrado com sucesso!");

    setNovoAlunoNome("");
    setNovoAlunoEmail("");
    setNovoAlunoSenha("");
    setNovoAlunoTelefone("");
    setNovoAlunoNascimento("");
    setNovoAlunoPlanoId(null);
setNovoAlunoVencimento("");
    setNovoAlunoObservacoes("");

    await carregarAlunos();
  } catch (error) {
    console.error("Erro ao cadastrar aluno:", error);
    alert("Não foi possível cadastrar o aluno.");
  }
}

async function atualizarAluno() {
  if (!alunoEditando) return;

  if (!novoAlunoNome.trim()) {
    alert("Informe o nome do aluno.");
    return;
  }

  const { error } = await supabase
    .from("perfis")
    .update({
      nome: novoAlunoNome.trim(),
      telefone: novoAlunoTelefone.trim() || null,
      data_nascimento: novoAlunoNascimento || null,
      plano_id: novoAlunoPlanoId,
proximo_vencimento: novoAlunoVencimento || null,
      observacoes: novoAlunoObservacoes.trim() || null,
    })
    .eq("id", alunoEditando.id);

  if (error) {
    console.error(error);
    alert("Erro ao atualizar aluno.");
    return;
  }

  alert("Aluno atualizado com sucesso!");

  setAlunoEditando(null);
  setNovoAlunoNome("");
  setNovoAlunoEmail("");
  setNovoAlunoSenha("");
  setNovoAlunoTelefone("");
  setNovoAlunoNascimento("");
  setNovoAlunoPlanoId(null);
setNovoAlunoVencimento("");
  setNovoAlunoObservacoes("");

  await carregarAlunos();
}

function formatarRecorde(recorde: Recorde) {
  if (recorde.unidade === "segundos") {
    const totalSegundos = Number(recorde.valor);

    if (recorde.modalidade === "hyrox_completo") {
      const horas = Math.floor(totalSegundos / 3600);
      const minutos = Math.floor((totalSegundos % 3600) / 60);
      const segundos = totalSegundos % 60;

      return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(
        2,
        "0"
      )}:${String(segundos).padStart(2, "0")}`;
    }

    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;

    return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(
      2,
      "0"
    )}`;
  }

  if (recorde.unidade === "kg") {
    return `${recorde.valor} KG`;
  }

  if (recorde.unidade === "reps") {
    return `${recorde.valor} REPS`;
  }

  if (recorde.unidade === "metros") {
    return `${recorde.valor} M`;
  }

  if (recorde.unidade === "km") {
    return `${recorde.valor} KM`;
  }

  if (recorde.unidade === "calorias") {
    return `${recorde.valor} CAL`;
  }

  return `${recorde.valor} ${recorde.unidade.toUpperCase()}`;
}

function calcularIntervalado(cronometro: CronometroAula) {
  if (
    cronometro.tipo !== "intervalado" ||
    !cronometro.inicio_em ||
    !cronometro.trabalho_segundos ||
    cronometro.descanso_segundos === null ||
    !cronometro.total_rounds
  ) {
    return null;
  }

  const agora = Date.now();
  const inicio = new Date(cronometro.inicio_em).getTime();

  const decorrido = Math.max(
    0,
    Math.floor((agora - inicio) / 1000)
  );

  const trabalho = cronometro.trabalho_segundos;
  const descanso = cronometro.descanso_segundos;

  const duracaoRound = trabalho + descanso;
  const duracaoTotal =
  trabalho * cronometro.total_rounds +
  descanso * Math.max(0, cronometro.total_rounds - 1);

  const decorridoLimitado = Math.min(
    decorrido,
    Math.max(0, duracaoTotal - 1)
  );

  const roundAtual = Math.min(
    Math.floor(decorridoLimitado / duracaoRound) + 1,
    cronometro.total_rounds
  );

  const tempoDentroRound =
    decorridoLimitado % duracaoRound;

  const emTrabalho = tempoDentroRound < trabalho;

  const tempoNaFase = emTrabalho
    ? tempoDentroRound
    : tempoDentroRound - trabalho;

  const duracaoFase = emTrabalho
    ? trabalho
    : descanso;

  const tempoRestanteFase = Math.max(
    0,
    duracaoFase - tempoNaFase
  );

  return {
    roundAtual,
    totalRounds: cronometro.total_rounds,
    fase: emTrabalho ? "trabalho" : "descanso",
    tempoRestanteFase,
    decorrido,
    duracaoTotal,
  };
}

function calcularEmom(cronometro: CronometroAula) {
  if (
    cronometro.tipo !== "emom" ||
    !cronometro.inicio_em ||
    !cronometro.intervalo_segundos
  ) {
    return null;
  }

  const agora = Date.now();
  const inicio = new Date(cronometro.inicio_em).getTime();

  const decorrido = Math.max(
    0,
    Math.floor((agora - inicio) / 1000)
  );

  const intervalo = cronometro.intervalo_segundos;

  const totalRounds = Math.ceil(
    cronometro.duracao_segundos / intervalo
  );

  const roundAtual = Math.min(
    Math.floor(decorrido / intervalo) + 1,
    totalRounds
  );

  const tempoNoRound = decorrido % intervalo;

  const tempoRestanteRound =
    intervalo - tempoNoRound;

  return {
    roundAtual,
    totalRounds,
    tempoNoRound,
    tempoRestanteRound,
  };
}

function formatarTempoGrafico(valor: number) {
  const horas = Math.floor(valor / 3600);
  const minutos = Math.floor((valor % 3600) / 60);
  const segundos = Math.floor(valor % 60);

  if (horas > 0) {
    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(
      2,
      "0"
    )}:${String(segundos).padStart(2, "0")}`;
  }

  return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(
    2,
    "0"
  )}`;
}

function formatarValorGrafico(valor: number, unidade?: string) {
  if (unidade === "segundos") {
    return formatarTempoGrafico(valor);
  }

  if (unidade === "kg") {
    return `${valor} KG`;
  }

  if (unidade === "reps") {
    return `${valor} REPS`;
  }

  if (unidade === "metros") {
    return `${valor} M`;
  }

  if (unidade === "km") {
    return `${valor} KM`;
  }

  if (unidade === "calorias") {
    return `${valor} CAL`;
  }

  return String(valor);
}

function nomeModalidade(modalidade: string) {
  const nomes: Record<string, string> = {
    "1km_corrida": "🏃 1 KM CORRIDA",
    "5km_corrida": "🏃 5 KM CORRIDA",
    "1000m_remo": "🚣 1000 M REMO",
    "1000m_skierg": "🎿 1000 M SKIERG",
    "sled_push": "🛷 SLED PUSH",
    "sled_pull": "🪢 SLED PULL",
    "burpee_broad_jump": "🐸 BURPEE BROAD JUMP",
    "farmers_carry": "🧳 FARMERS CARRY",
    "sandbag_lunges": "🎒 SANDBAG LUNGES",
    "wall_balls": "⚫ WALL BALLS",
    "hyrox_completo": "🏆 HYROX COMPLETO",
  };

  return nomes[modalidade] || modalidade.replaceAll("_", " ").toUpperCase();
}

function obterMelhoresRecordes(recordes: Recorde[]) {
  const melhores: Record<string, Recorde> = {};

  recordes.forEach((recorde) => {
    const atual = melhores[recorde.modalidade];

    if (!atual) {
      melhores[recorde.modalidade] = recorde;
      return;
    }

    if (recorde.criterio === "menor") {
      if (Number(recorde.valor) < Number(atual.valor)) {
        melhores[recorde.modalidade] = recorde;
      }
    } else {
      if (Number(recorde.valor) > Number(atual.valor)) {
        melhores[recorde.modalidade] = recorde;
      }
    }
  });

  return Object.values(melhores);
}

async function finalizarCronometroAula(aulaId: number) {
  const { error } = await supabase
    .from("cronometros_aula")
    .update({
      status: "finalizado",
      updated_at: new Date().toISOString(),
    })
    .eq("aula_id", aulaId)
    .eq("status", "rodando");

  if (error) {
    console.error("Erro ao finalizar cronômetro:", error);
    return;
  }

  setCronometrosAulas((atual) => {
  const cronometroAtual = atual[aulaId];

  if (!cronometroAtual) {
    return atual;
  }

  return {
    ...atual,
    [aulaId]: {
      ...cronometroAtual,
      status: "finalizado",
    },
  };
});

  setCronometroAula((atual) =>
    atual
      ? {
          ...atual,
          status: "finalizado",
        }
      : null
  );

  setTempoRestante(0);
}

async function salvarRecorde() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Usuário não encontrado.");
    return;
  }

 if (!modalidadeRecorde) {
  alert("Selecione uma modalidade.");
  return;
}

const modalidadeTempo = [
  "1km_corrida",
  "5km_corrida",
  "1000m_skierg",
  "sled_push",
  "sled_pull",
  "burpee_broad_jump",
  "1000m_remo",
  "farmers_carry",
  "sandbag_lunges",
  "wall_balls",
  "hyrox_completo",
].includes(modalidadeRecorde);
const modalidadeFinal =
  modalidadeRecorde === "personalizado"
    ? nomeRecordePersonalizado.trim()
    : modalidadeRecorde;

    if (
  modalidadeRecorde === "personalizado" &&
  !nomeRecordePersonalizado.trim()
) {
  alert("Informe o nome do recorde personalizado.");
  return;
}

let valorFinal = 0;
let unidadeFinal = "";
let criterioFinal: "maior" | "menor" = "maior";

if (modalidadeTempo) {
  const horas =
  modalidadeRecorde === "hyrox_completo"
    ? Number(horasRecorde || 0)
    : 0;
  const minutos = Number(minutosRecorde || 0);
  const segundos = Number(segundosRecorde || 0);

  if (segundos < 0 || segundos > 59) {
    alert("Os segundos devem estar entre 0 e 59.");
    return;
  }

  valorFinal = horas * 3600 + minutos * 60 + segundos;
  unidadeFinal = "segundos";
  criterioFinal = "menor";

  if (valorFinal <= 0) {
    alert("Informe um tempo válido.");
    return;
  }
} else if (modalidadeRecorde === "personalizado") {
  if (!unidadeRecorde) {
    alert("Selecione a unidade.");
    return;
  }

  valorFinal = Number(valorRecorde);
  unidadeFinal = unidadeRecorde;
  criterioFinal = criterioRecorde;

  if (!valorRecorde || valorFinal <= 0) {
    alert("Informe um valor válido.");
    return;
  }
} else {
  valorFinal = Number(valorRecorde);
  unidadeFinal = "kg";
  criterioFinal = "maior";

  if (!valorRecorde || valorFinal <= 0) {
    alert("Informe uma carga válida.");
    return;
  }
}

  const { error } = await supabase
    .from("recordes")
.insert({
  aluno_id: user.id,
  modalidade: modalidadeFinal,
  valor: valorFinal,
  unidade: unidadeFinal,
  criterio: criterioFinal,
  data: dataRecorde,
});

  if (error) {
    console.error("Erro ao salvar recorde:", error);
    alert("Não foi possível salvar o recorde.");
    return;
  }
await carregarRecordes();

  alert("Recorde salvo com sucesso!");

  setModalidadeRecorde("");
setValorRecorde("");
setMinutosRecorde("");
setSegundosRecorde("");
setUnidadeRecorde("");
setNomeRecordePersonalizado("");
setCriterioRecorde("maior");
}

async function excluirRecorde(id: number) {
  const confirmar = window.confirm(
    "Tem certeza que deseja excluir este recorde?"
  );

  if (!confirmar) {
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Usuário não identificado.");
    return;
  }

  const { error } = await supabase
    .from("recordes")
    .delete()
    .eq("id", id)
    .eq("aluno_id", user.id);

  if (error) {
    console.error("Erro ao excluir recorde:", error);
    alert(`Erro ao excluir recorde: ${error.message}`);
    return;
  }

  await carregarRecordes();
}

async function carregarRecordes() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setRecordes([]);
    return;
  }

  const { data, error } = await supabase
    .from("recordes")
   .select("id, modalidade, valor, unidade, criterio, data")
    .eq("aluno_id", user.id)
    .order("data", { ascending: false });

  if (error) {
    console.error("Erro ao carregar recordes:", error);
    return;
  }

  setRecordes(data || []);
}

async function excluirPlano(plano: any) {
  if (plano.ativo) {
    alert("Desative o plano antes de excluí-lo.");
    return;
  }

  const confirmar = window.confirm(
    `Tem certeza que deseja excluir o plano "${plano.nome}"? Essa ação não pode ser desfeita.`
  );

  if (!confirmar) return;

  const { error } = await supabase
    .from("planos")
    .delete()
    .eq("id", plano.id);

  if (error) {
    console.error("Erro ao excluir plano:", error);
    alert("Não foi possível excluir o plano.");
    return;
  }

  setPlanos((atual: any[]) =>
    atual.filter((p) => p.id !== plano.id)
  );
}

async function carregarProgressoTreino(treinoId: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    setConcluidos([]);
    return;
  }

  const { data, error } = await supabase
    .from("progresso_exercicios")
    .select("exercicio_id")
    .eq("aluno_id", user.id)
    .eq("treino_id", treinoId)
    .eq("concluido", true);

  if (error) {
    console.error("Erro ao carregar progresso:", error);
    setConcluidos([]);
    return;
  }

  setConcluidos(
    (data || []).map((item) => item.exercicio_id)
  );
}

async function carregarTreinoDaAula(treinoId: number) {
  const { data: treino, error: erroTreino } = await supabase
    .from("treinos")
    .select("id, titulo, data, tipo_treino")
    .eq("id", treinoId)
    .single();

  if (erroTreino || !treino) {
    console.error("Erro ao carregar treino da aula:", erroTreino);
    alert("Não foi possível carregar o treino desta aula.");
    return;
  }

  const { data: exerciciosTreino, error: erroExercicios } = await supabase
    .from("exercicios")
    .select("id, nome, ordem")
    .eq("treino_id", treinoId)
    .order("ordem", { ascending: true });

  if (erroExercicios) {
    console.error("Erro ao carregar exercícios:", erroExercicios);
    alert("Não foi possível carregar os exercícios.");
    return;
  }

  setTreinoId(treinoId);
  setTituloTreinoAtual(treino.titulo);
  setDataTreinoAtual(treino.data);
  setTipoTreinoAtual(treino.tipo_treino || "");
  setTipoTreinoAluno(treino.tipo_treino || "");
  setExercicios(exerciciosTreino || []);
  await carregarProgressoTreino(treinoId);
  setAbaAluno("treino");
  setTimeout(() => {
  document
    .getElementById("workout")
    ?.scrollIntoView({ behavior: "smooth" });
}, 100);
}

  async function carregarTreino() {
    const hoje = new Date().toISOString().split("T")[0];

    const { data: treinosExistentes, error: erroTreino } = await supabase
      .from("treinos")
      .select("*")
      .eq("data", hoje)
      .order("id", { ascending: true })
      .limit(1);

    if (erroTreino) {
      console.error("Erro ao buscar treino:", erroTreino);
      return;
    }

   const treinoExistente = treinosExistentes?.[0];

if (!treinoExistente) {
  setTreinoId(null);
  setTituloTreinoAtual("");
  setDataTreinoAtual(hoje);
  setExercicios([]);
  setConcluidos([]);
  return;
}

const idTreino = treinoExistente.id;

setTreinoId(idTreino);
setTituloTreinoAtual(treinoExistente.titulo || "");
setDataTreinoAtual(treinoExistente.data || hoje);

    const { data: lista, error: erroExercicios } = await supabase
      .from("exercicios")
      .select("*")
      .eq("treino_id", idTreino)
      .order("ordem", { ascending: true });

    if (erroExercicios) {
      console.error("Erro ao carregar exercícios:", erroExercicios);
      return;
    }

    setExercicios(lista || []);
  }

async function excluirTreino(treinoIdExcluir: number) {
  const { data: aulasVinculadas, error: erroAulas } = await supabase
    .from("aulas")
    .select("id")
    .eq("treino_id", treinoIdExcluir);

  if (erroAulas) {
    console.error("Erro ao verificar aulas:", erroAulas);
    alert("Não foi possível verificar se o treino está sendo usado.");
    return;
  }

  if (aulasVinculadas && aulasVinculadas.length > 0) {
    alert(
      `Este treino está vinculado a ${aulasVinculadas.length} aula(s). ` +
      "Troque o treino dessas aulas antes de excluí-lo."
    );
    return;
  }

  const confirmar = window.confirm(
    "Tem certeza que deseja excluir este treino? Esta ação não poderá ser desfeita."
  );

  if (!confirmar) return;

  const { error } = await supabase
    .from("treinos")
    .delete()
    .eq("id", treinoIdExcluir);

  if (error) {
    console.error("Erro ao excluir treino:", error);
    alert("Não foi possível excluir o treino.");
    return;
  }

  if (treinoId === treinoIdExcluir) {
    setTreinoId(null);
    setTituloTreinoAtual("");
    setDataTreinoAtual("");
    setExercicios([]);
  }

  await carregarTreinosDisponiveis();

  alert("Treino excluído com sucesso!");
}

async function salvarDadosTreino() {
  if (!treinoId) {
    alert("Nenhum treino selecionado.");
    return;
  }

  if (!tituloTreinoAtual.trim()) {
    alert("Informe o nome do treino.");
    return;
  }

  if (!dataTreinoAtual) {
    alert("Informe a data do treino.");
    return;
  }

  const { error } = await supabase
    .from("treinos")
    .update({
      titulo: tituloTreinoAtual.trim(),
      tipo_treino: tipoTreinoAtual.trim() || null,
      data: dataTreinoAtual,
    })
    .eq("id", treinoId);

  if (error) {
    console.error("Erro ao salvar treino:", error);
    alert("Não foi possível salvar os dados do treino.");
    return;
  }

  alert("Treino atualizado com sucesso!");

  await carregarTreinosDisponiveis();
  await carregarTreino();
}
  
  async function adicionarExercicio() {
    if (!novoExercicio.trim() || !treinoId) return;

    const { data, error } = await supabase
      .from("exercicios")
      .insert({
        treino_id: treinoId,
        nome: novoExercicio.trim(),
        ordem: exercicios.length + 1,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao adicionar exercício:", error);
      alert("Não foi possível adicionar o exercício.");
      return;
    }

    setExercicios([...exercicios, data]);
    setNovoExercicio("");
  }

  async function excluirExercicio(id: number) {
    const { error } = await supabase
      .from("exercicios")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao excluir exercício:", error);
      alert("Não foi possível excluir.");
      return;
    }

    setExercicios(exercicios.filter((exercicio) => exercicio.id !== id));
    setConcluidos(concluidos.filter((item) => item !== id));
  }

async function marcarExercicio(id: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !treinoId) {
  alert("Não foi possível identificar o aluno ou o treino.");
  return;
}

  const jaConcluido = concluidos.includes(id);

  if (jaConcluido) {
    const { error } = await supabase
      .from("progresso_exercicios")
      .delete()
      .eq("aluno_id", user.id)
      .eq("treino_id", treinoId)
      .eq("exercicio_id", id);

    if (error) {
      console.error("Erro ao remover progresso:", error);
      alert("Não foi possível atualizar o exercício.");
      return;
    }

    setConcluidos(concluidos.filter((item) => item !== id));
  } else {
    const { error } = await supabase
      .from("progresso_exercicios")
      .upsert(
        {
          aluno_id: user.id,
          treino_id: treinoId,
          exercicio_id: id,
          concluido: true,
        },
        {
          onConflict: "aluno_id,treino_id,exercicio_id",
        }
      );

    if (error) {
  console.error("Erro completo:", {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  });

  alert(
    `Erro: ${error.code}\n${error.message}`
  );

  return;
}
    setConcluidos([...concluidos, id]);
  }
}

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login");
  }

async function carregarAlunos() {
  await atualizarInadimplenciaAutomatica();
  const { data, error } = await supabase
    .from("perfis")
    .select(
  "id, nome, tipo, ativo, telefone, status_financeiro, data_nascimento, plano_id, proximo_vencimento, observacoes"
)
    .eq("tipo", "aluno")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao carregar alunos:", error);
    alert("Não foi possível carregar os alunos.");
    return;
  }

  setAlunos(data || []);
  setAbaGestao("alunos");
}

async function alterarStatusFinanceiro(
  alunoId: string,
  novoStatus: "em_dia" | "inadimplente"
) {
  const { error } = await supabase
    .from("perfis")
    .update({ status_financeiro: novoStatus })
    .eq("id", alunoId);

  if (error) {
    console.error("Erro ao alterar status financeiro:", error);
    alert("Não foi possível alterar o status financeiro.");
    return;
  }

  setAlunos(
    alunos.map((aluno) =>
      aluno.id === alunoId
        ? { ...aluno, status_financeiro: novoStatus }
        : aluno
    )
  );
}
async function criarAula() {
  if (!dataAula || !horarioAula) {
    alert("Preencha a data e o horário da aula.");
    return;
  }

  const { error } = await supabase
    .from("aulas")
    .insert({
  data: dataAula,
  horario: horarioAula,
  local: localAula || null,
  vagas: vagasAula,
  ativa: true,
  treino_id: treinoAula,
    });

  if (error) {
    console.error("Erro ao criar aula:", error);
    alert("Não foi possível criar a aula.");
    return;
  }

  alert("Aula criada com sucesso!");

  setDataAula("");
  setHorarioAula("");
  setLocalAula("");
  setVagasAula(20);
  setTreinoAula(null);
}
async function salvarEdicaoAula() {
  if (!aulaEditando) return;

  const { error } = await supabase
    .from("aulas")
    .update({
      data: aulaEditando.data,
      horario: aulaEditando.horario,
      local: aulaEditando.local,
      vagas: aulaEditando.vagas,
      treino_id: aulaEditando.treino_id,
    })
    .eq("id", aulaEditando.id);

  if (error) {
    console.error("Erro ao editar aula:", error);
    alert("Não foi possível editar a aula.");
    return;
  }

  await carregarAulas();
  setAulaEditando(null);

  alert("Aula atualizada com sucesso!");
}
async function cancelarAula(aulaId: number) {
  const confirmar = window.confirm(
    "Tem certeza que deseja cancelar esta aula?"
  );

  if (!confirmar) return;

  const { error } = await supabase
    .from("aulas")
    .update({ ativa: false })
    .eq("id", aulaId);

  if (error) {
    console.error("Erro ao cancelar aula:", error);
    alert("Não foi possível cancelar a aula.");
    return;
  }

  await carregarAulas();
  await carregarContagemCheckins();

  alert("Aula cancelada com sucesso!");
}
async function reativarAula(aulaId: number) {
  const { error } = await supabase
    .from("aulas")
    .update({ ativa: true })
    .eq("id", aulaId);

  if (error) {
    console.error("Erro ao reativar aula:", error);
    alert("Não foi possível reativar a aula.");
    return;
  }

  await carregarAulas();
  await carregarAulasCanceladas();
  await carregarContagemCheckins();

  alert("Aula reativada com sucesso!");
}
async function excluirAulaPermanentemente(aulaId: number) {
  const confirmar = window.confirm(
    "ATENÇÃO: esta ação é permanente. A aula e todos os check-ins vinculados serão excluídos. Deseja continuar?"
  );

  if (!confirmar) return;

  const confirmarNovamente = window.confirm(
    "Tem certeza absoluta? Esta ação não poderá ser desfeita."
  );

  if (!confirmarNovamente) return;

  const { error } = await supabase
    .from("aulas")
    .delete()
    .eq("id", aulaId);

  if (error) {
    console.error("Erro ao excluir aula:", error);
    alert("Não foi possível excluir a aula.");
    return;
  }

  await carregarAulas();
  await carregarAulasCanceladas();
  await carregarContagemCheckins();

  alert("Aula excluída permanentemente.");
}
async function carregarAulas() {
  const hoje = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("aulas")
    .select("*")
    .gte("data", hoje)
    .eq("ativa", true)
    .order("data", { ascending: true })
    .order("horario", { ascending: true });

  if (error) {
    console.error("Erro ao carregar aulas:", error);
    return;
  }

 setAulas(data || []);
}

async function carregarAulasCanceladas() {
  const { data, error } = await supabase
    .from("aulas")
    .select("id, data, horario, local, vagas, ativa, treino_id")
    .eq("ativa", false)
    .order("data", { ascending: false })
    .order("horario", { ascending: false });

  if (error) {
    console.error("Erro ao carregar aulas canceladas:", error);
    return;
  }

  setAulasCanceladas(data || []);
}

  async function carregarCheckins() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("aluno_id", user.id)
    .neq("status", "cancelado");

  if (error) {
    console.error("Erro ao carregar check-ins:", error);
    return;
  }

 setCheckins(data || []);
}

async function carregarContagemCheckins() {
  const { data, error } = await supabase
    .from("checkins")
    .select("aula_id")
    .eq("status", "confirmado");

  if (error) {
    console.error("Erro ao contar check-ins:", error);
    return;
  }


  const contagem: Record<number, number> = {};

  (data || []).forEach((item) => {
    contagem[item.aula_id] = (contagem[item.aula_id] || 0) + 1;
  });

  const resultado = Object.entries(contagem).map(([aula_id, total]) => ({
    aula_id: Number(aula_id),
    total,
  }));

  setContagemCheckins(resultado);
}

async function atualizarGestaoCheckins() {
  await carregarAulas();
  await carregarAulasCanceladas();
  await carregarContagemCheckins();
  await carregarAulasCanceladas();
  setAbaGestao("checkins");
}

async function carregarAlunosDaAula(aulaId: number) {
 const { data: checkinsAula, error: erroCheckins } = await supabase
  .from("checkins")
  .select("aluno_id, status")
  .eq("aula_id", aulaId)
  .in("status", ["confirmado", "presente", "faltou"]);
  
  if (erroCheckins) {
    console.error("Erro ao buscar check-ins da aula:", erroCheckins);
    alert("Não foi possível carregar os alunos.");
    return;
  }

  const idsAlunos = (checkinsAula || []).map(
    (checkin) => checkin.aluno_id
  );

  if (idsAlunos.length === 0) {
    setAlunosInscritos([]);
    setAulaSelecionada(aulaId);
    return;
  }

  const { data: perfis, error: erroPerfis } = await supabase
    .from("perfis")
    .select("id, nome")
    .in("id", idsAlunos);

  if (erroPerfis) {
    console.error("Erro ao buscar alunos:", erroPerfis);
    alert("Não foi possível carregar os alunos.");
    return;
  }

const alunosComStatus = (perfis || []).map((perfil) => {
  const checkin = (checkinsAula || []).find(
    (item) => item.aluno_id === perfil.id
  );

  return {
    ...perfil,
    status: checkin?.status || "confirmado",
  };
});

setAlunosInscritos(alunosComStatus);
setAulaSelecionada(aulaId);
}

async function cancelarCheckin(aulaId: number, alunoId: string) {
  const confirmar = window.confirm(
    "Tem certeza que deseja cancelar o check-in deste aluno?"
  );

  if (!confirmar) {
    return;
  }

const { error } = await supabase
  .from("checkins")
  .update({
    status: "cancelado",
  })
  .eq("aula_id", aulaId)
  .eq("aluno_id", alunoId);

  if (error) {
    console.error("Erro ao cancelar check-in:", error);
    alert("Não foi possível cancelar o check-in.");
    return;
  }

setAlunosInscritos((listaAtual) =>
  listaAtual.filter((aluno) => aluno.id !== alunoId)
);

setAulaSelecionada(null);

  alert("Check-in cancelado com sucesso!");

  await carregarContagemCheckins();
}

async function marcarPresenca(
  aulaId: number,
  alunoId: string,
  novoStatus: "presente" | "faltou"
) {
  const { error } = await supabase
    .from("checkins")
    .update({ status: novoStatus })
    .eq("aula_id", aulaId)
    .eq("aluno_id", alunoId);

  if (error) {
    console.error("Erro ao marcar presença:", error);
    alert("Não foi possível atualizar a presença.");
    return;
  }

  await carregarAlunosDaAula(aulaId);

  alert(
    novoStatus === "presente"
      ? "Aluno marcado como presente."
      : "Aluno marcado como faltou."
  );
}

  async function fazerCheckin(aulaId: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Usuário não encontrado.");
    return;
  }

  if (statusFinanceiro === "inadimplente") {
    alert("Você possui uma pendência financeira e não pode realizar check-in.");
    return;
  }


 const { error } = await supabase
  .from("checkins")
  .upsert(
    {
      aula_id: aulaId,
      aluno_id: user.id,
      status: "confirmado",
    },
    {
      onConflict: "aula_id,aluno_id",
    }
  );

 if (error) {
  if (error.code === "23505") {
    alert("Você já fez check-in nesta aula.");
    await carregarCheckins();
    return;
  }

  console.error("Erro ao fazer check-in:", error);
  alert("Não foi possível realizar o check-in.");
  return;
}

await carregarCheckins();
await carregarContagemCheckins();

  alert("Check-in realizado com sucesso!");
}

async function cancelarCheckin(aulaId: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Usuário não encontrado.");
    return;
  }

  const { error } = await supabase
    .from("checkins")
    .update({ status: "cancelado" })
    .eq("aula_id", aulaId)
    .eq("aluno_id", user.id);

  if (error) {
    console.error("Erro ao cancelar check-in:", error);
    alert("Não foi possível cancelar o check-in.");
    return;
  }

  await carregarCheckins();
  await carregarContagemCheckins();

  alert("Check-in cancelado.");
}
const melhoresRecordes = obterMelhoresRecordes(recordes);
  const progresso =
    exercicios.length === 0
      ? 0
      : Math.round((concluidos.length / exercicios.length) * 100);

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="font-bold text-lime-400">
          ZN HYBRID
        </p>
      </main>
    );
  }

  const dadosGrafico = modalidadeSelecionada
  ? recordes
      .filter(
        (recorde) =>
          recorde.modalidade === modalidadeSelecionada
      )
      .sort(
        (a, b) =>
          new Date(a.data).getTime() -
          new Date(b.data).getTime()
      )
      .map((recorde) => ({
        data: recorde.data
          .split("-")
          .reverse()
          .join("/"),
        valor: Number(recorde.valor),
        id: recorde.id,
      }))
  : [];

  const recordeSelecionado = modalidadeSelecionada
  ? melhoresRecordes.find(
      (recorde) => recorde.modalidade === modalidadeSelecionada
    )
  : null;

const unidadeGrafico = recordeSelecionado?.unidade;

const primeiroResultado =
  dadosGrafico.length > 0 ? dadosGrafico[0].valor : null;

const valorPR =
  recordeSelecionado ? Number(recordeSelecionado.valor) : null;

const percentualEvolucao =
  primeiroResultado !== null &&
  valorPR !== null &&
  primeiroResultado > 0
    ? recordeSelecionado?.criterio === "menor"
      ? ((primeiroResultado - valorPR) / primeiroResultado) * 100
      : ((valorPR - primeiroResultado) / primeiroResultado) * 100
    : 0;

    const diferencaEvolucao =
  primeiroResultado !== null && valorPR !== null
    ? recordeSelecionado?.criterio === "menor"
      ? primeiroResultado - valorPR
      : valorPR - primeiroResultado
    : 0;

const hojeTreino = new Date().toISOString().split("T")[0];

const treinosFiltrados = treinosDisponiveis.filter((treino) => {
  const correspondeBusca = treino.titulo
    .toLowerCase()
    .includes(buscaTreino.toLowerCase());

  if (!correspondeBusca) {
    return false;
  }

  if (filtroTreino === "passados") {
    return treino.data < hojeTreino;
  }

  if (filtroTreino === "hoje") {
    return treino.data === hojeTreino;
  }

  if (filtroTreino === "futuros") {
    return treino.data > hojeTreino;
  }

  return true;
});

const minutosCronometro = Math.floor(tempoRestante / 60);
const segundosCronometro = tempoRestante % 60;

const tempoFormatado = `${String(minutosCronometro).padStart(
  2,
  "0"
)}:${String(segundosCronometro).padStart(2, "0")}`;
const dadosEmomAluno =
  cronometroAula?.tipo === "emom"
    ? calcularEmom(cronometroAula)
    : null;

    const dadosIntervaladoAluno =
  cronometroAula?.tipo === "intervalado"
    ? calcularIntervalado(cronometroAula)
    : null;

const alunosFiltrados = alunos.filter((aluno) => {
  const correspondeBusca = (aluno.nome || "")
    .toLowerCase()
    .includes(buscaAluno.trim().toLowerCase());

  if (!correspondeBusca) {
    return false;
  }

  if (filtroAlunos === "ativos") {
    return aluno.ativo === true;
  }

  if (filtroAlunos === "inativos") {
    return aluno.ativo === false;
  }

  if (filtroAlunos === "em_dia") {
    return aluno.status_financeiro === "em dia";
  }

  if (filtroAlunos === "em_atraso") {
    return aluno.status_financeiro === "em atraso";
  }

  return true;
});

const totalPaginasAlunos = Math.max(
  1,
  Math.ceil(alunosFiltrados.length / alunosPorPagina)
);

const alunosPaginados = alunosFiltrados.slice(
  (paginaAlunos - 1) * alunosPorPagina,
  paginaAlunos * alunosPorPagina
);

const aulasComCheckin = aulas.filter((aula) =>
  checkins.some((checkin) => checkin.aula_id === aula.id)
);

const outrasAulas = aulas.filter(
  (aula) =>
    !checkins.some((checkin) => checkin.aula_id === aula.id)
);

const aulasOrganizadas = [
  ...aulasComCheckin.map((aula) => ({
    ...aula,
    grupo: "minha" as const,
  })),
  ...outrasAulas.map((aula) => ({
    ...aula,
    grupo: "outras" as const,
  })),
];

const hojeFinanceiro = new Date();
const inicioMes = new Date(
  hojeFinanceiro.getFullYear(),
  hojeFinanceiro.getMonth(),
  1
);

const inicioMesIso = inicioMes.toISOString().split("T")[0];

const recebidoNoMes = pagamentos
  .filter(
    (pagamento) =>
      pagamento.data_pagamento &&
      pagamento.data_pagamento >= inicioMesIso
  )
  .reduce(
    (total, pagamento) =>
      total + Number(pagamento.valor || 0),
    0
  );

const alunosComPlano = alunos.filter(
  (aluno) => aluno.plano_id !== null
);

const receitaPrevista = alunosComPlano.reduce(
  (total, aluno) => {
    const plano = planos.find(
      (item) => item.id === aluno.plano_id
    );

    return total + Number(plano?.valor || 0);
  },
  0
);

const totalInadimplentes = alunos.filter(
  (aluno) =>
    aluno.status_financeiro === "inadimplente"
).length;

const totalEmDia = alunos.filter(
  (aluno) =>
    aluno.status_financeiro === "em_dia"
).length;

  return (
    
    <main className="min-h-screen bg-black pb-24 text-white">
      <div className="mx-auto max-w-md px-5 py-8">

        <header className="mb-8">
          
          <div className="flex items-start justify-between gap-4">

            <div>
              <p className="text-sm font-black tracking-[0.3em] text-lime-400">
                ZN HYBRID
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Olá, {nomeUsuario}
              </p>

              <h1 className="mt-2 text-3xl font-black">
  {modoGestao
    ? "GESTÃO DO TREINO"
    : abaAluno === "treino"
    ? aulaSelecionada
      ? "TREINO DA AULA"
      : "INÍCIO"
    : abaAluno === "aulas"
    ? "AULAS"
    : "RECORDES"}
</h1>
            </div>

            <button
              onClick={sair}
              className="rounded-xl border border-zinc-800 px-3 py-2 text-xs font-bold text-zinc-400"
            >
              SAIR
            </button>

          </div>

          {tipoUsuario === "admin" && (
            <button
              onClick={() => setModoGestao(!modoGestao)}
              className="mt-5 w-full rounded-2xl border border-lime-400 p-3 text-sm font-black text-lime-400"
            >
              {modoGestao ? "← VER COMO ALUNO" : "⚙ ABRIR GESTÃO"}
            </button>
          )}

        </header>
        {tipoUsuario === "aluno" && statusFinanceiro === "inadimplente" && (
  <div className="mb-6 rounded-3xl border border-red-500/40 bg-red-500/10 p-5">
    <p className="text-sm font-black text-red-400">
      ⚠ PAGAMENTO PENDENTE
    </p>

    <p className="mt-2 text-sm leading-relaxed text-zinc-300">
      Existe uma pendência no seu plano. Regularize sua mensalidade para
      liberar novos check-ins.
    </p>
  </div>
)}      

        {modoGestao && tipoUsuario === "admin" ? (
          <section>
          <div className="mb-6 grid grid-cols-3 gap-2">
  <button
    onClick={() => setAbaGestao("treino")}
    className={`rounded-2xl p-3 text-sm font-black ${
      abaGestao === "treino"
        ? "bg-lime-400 text-black"
        : "bg-zinc-900 text-zinc-400"
    }`}
  >
    TREINO
  </button>

  <button
    onClick={carregarAlunos}
    className={`rounded-2xl p-3 text-sm font-black ${
      abaGestao === "alunos"
        ? "bg-lime-400 text-black"
        : "bg-zinc-900 text-zinc-400"
    }`}
  >
    ALUNOS
  </button>
  <button
  onClick={atualizarGestaoCheckins}
  className={`rounded-2xl p-3 text-sm font-black ${
    abaGestao === "checkins"
      ? "bg-lime-400 text-black"
      : "bg-zinc-900 text-zinc-400"
  }`}
>
  CHECK-INS
</button>
<button
  onClick={() => {
  setAbaGestao("financeiro");
  carregarPlanos();
  carregarPagamentos();
}}
  className={`rounded-xl px-4 py-3 text-sm font-black ${
    abaGestao === "financeiro"
      ? "bg-lime-400 text-black"
      : "bg-zinc-900 text-zinc-400"
  }`}
>
  FINANCEIRO
</button>
</div>

{abaGestao === "treino" && (
  <>
  <button
  onClick={() => setMostrarNovoTreino(!mostrarNovoTreino)}
  className="mb-6 w-full rounded-2xl border border-lime-400 p-4 font-black text-lime-400"
>
  {mostrarNovoTreino ? "✕ CANCELAR" : "+ NOVO TREINO"}
</button>

{mostrarNovoTreino && (
  <div className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
  <p className="text-xs font-black tracking-widest text-lime-400">
    CRIAR NOVO TREINO
  </p>

  <label className="mt-4 block text-xs font-bold text-zinc-500">
    NOME DO TREINO
  </label>

  <input
    type="text"
    value={novoTreinoNome}
    onChange={(e) => setNovoTreinoNome(e.target.value)}
    placeholder="Ex: HYROX ENGINE"
    className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
  />
  <label className="mt-4 block text-xs font-bold text-zinc-500">
  TIPO DE TREINO
</label>

<input
  type="text"
  value={novoTreinoTipo}
  onChange={(e) => setNovoTreinoTipo(e.target.value)}
  placeholder="Ex: FOR TIME, AMRAP 20', CHIPPER..."
  className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
/>
  <label className="mt-4 block text-xs font-bold text-zinc-500">
    DATA
  </label>

  <input
    type="date"
    value={novoTreinoData}
    onChange={(e) => setNovoTreinoData(e.target.value)}
    className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
  />

  <button
    onClick={criarNovoTreino}
    className="mt-5 w-full rounded-xl bg-lime-400 p-3 font-black text-black"
  >
    + CRIAR TREINO
  </button>
</div>
)}
 <div className="mt-8">
  <p className="mb-4 text-sm font-black tracking-widest text-zinc-500">
    BIBLIOTECA DE TREINOS
  </p>

  <input
  type="text"
  value={buscaTreino}
  onChange={(e) => setBuscaTreino(e.target.value)}
  placeholder="🔎 Buscar treino pelo nome..."
  className="mb-4 w-full rounded-xl border border-zinc-700 bg-black p-3"
/>

<div className="mb-4 grid grid-cols-4 gap-2">
  {[
    ["todos", "TODOS"],
    ["passados", "PASSADOS"],
    ["hoje", "HOJE"],
    ["futuros", "FUTUROS"],
  ].map(([valor, texto]) => (
    <button
      key={valor}
      onClick={() =>
  setFiltroTreino((atual) =>
    atual === valor
      ? null
      : (valor as "todos" | "passados" | "hoje" | "futuros")
  )
}
      className={`rounded-xl p-2 text-xs font-black ${
        filtroTreino === valor
          ? "bg-lime-400 text-black"
          : "bg-zinc-900 text-zinc-400"
      }`}
    >
      {texto}
    </button>
  ))}
</div>

  {filtroTreino === null ? (
  <div className="rounded-2xl border border-zinc-800 p-5 text-center text-sm text-zinc-500">
    Selecione um filtro para visualizar os treinos.
  </div>
) : treinosDisponiveis.length === 0 ? (
    <div className="rounded-2xl border border-zinc-800 p-5 text-center text-zinc-500">
      Nenhum treino cadastrado.
    </div>
  ) : (
    <div className="space-y-3">
      {treinosFiltrados.map((treino) => (
        <div
          key={treino.id}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
        >
          <p className="font-black text-white">
            {treino.titulo}
          </p>
          {treino.tipo_treino && (
  <p className="mt-2 inline-flex rounded-full border border-lime-400/40 bg-lime-400/10 px-3 py-1 text-xs font-black tracking-widest text-lime-400">
    {treino.tipo_treino}
  </p>
)}

          <p className="mt-1 text-xs text-zinc-500">
            {treino.data.split("-").reverse().join("/")}
          </p>

          <button
            onClick={() => carregarTreinoDaAula(treino.id)}
            className="mt-4 w-full rounded-xl border border-lime-400 p-3 text-xs font-black text-lime-400"
          >
            ABRIR / EDITAR
          </button>
          <button
  onClick={() => excluirTreino(treino.id)}
  className="mt-2 w-full rounded-xl border border-red-500/50 p-3 text-xs font-black text-red-400"
>
  EXCLUIR TREINO
</button>
        </div>
      ))}
    </div>
  )}
</div>
{treinoId !== null && (
  <>
  <div className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
  <p className="text-xs font-black tracking-widest text-lime-400">
    TREINO EM EDIÇÃO
  </p>

  <label className="mt-4 block text-xs font-bold text-zinc-500">
    NOME DO TREINO
  </label>

  <input
    type="text"
    value={tituloTreinoAtual}
    onChange={(e) => setTituloTreinoAtual(e.target.value)}
    placeholder="Ex: HYROX ENGINE 01"
    className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
  />

<label className="mt-4 block text-xs font-bold text-zinc-500">
  TIPO DE TREINO
</label>

<input
  type="text"
  value={tipoTreinoAtual}
  onChange={(e) => setTipoTreinoAtual(e.target.value)}
  placeholder="Ex: FOR TIME, AMRAP 20', CHIPPER..."
  className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
/>

  <label className="mt-4 block text-xs font-bold text-zinc-500">
    DATA
  </label>

  <input
    type="date"
    value={dataTreinoAtual}
    onChange={(e) => setDataTreinoAtual(e.target.value)}
    className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
  />
  
  <button
  onClick={salvarDadosTreino}
  className="mt-5 w-full rounded-xl bg-lime-400 p-3 font-black text-black"
>
  SALVAR DADOS DO TREINO
</button>

</div>
            <div className="rounded-3xl bg-zinc-900 p-5">

              <p className="text-sm font-bold text-zinc-400">
                ADICIONAR EXERCÍCIO
              </p>

              <input
                type="text"
                value={novoExercicio}
                onChange={(e) => setNovoExercicio(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    adicionarExercicio();
                  }
                }}
                placeholder="Ex: 1000m corrida"
                className="mt-4 w-full rounded-2xl border border-zinc-700 bg-black p-4 outline-none focus:border-lime-400"
              />

              <button
                onClick={adicionarExercicio}
                className="mt-3 w-full rounded-2xl bg-lime-400 p-4 font-black text-black"
              >
                + ADICIONAR
              </button>

            </div>

            <div className="mt-8">

              <p className="mb-4 text-sm font-bold tracking-widest text-zinc-500">
                EXERCÍCIOS CADASTRADOS
              </p>

              <div className="space-y-3">

                {exercicios.map((exercicio, index) => (
                  
                  <div
                    key={exercicio.id}
                    className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                  >

                    <div className="pr-3">
                      <p className="text-xs text-zinc-500">
                        EXERCÍCIO {index + 1}
                      </p>

                      <p className="mt-1 font-semibold">
                        {exercicio.nome}
                      </p>
                    </div>

                    <button
                      onClick={() => excluirExercicio(exercicio.id)}
                      className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400"
                    >
                      EXCLUIR
                    </button>

                  </div>
                ))}

              </div>
            </div>
              </>
)}
           
              </>
)}
            {abaGestao === "alunos" && (
              <div className="mt-8">
  <button
    onClick={() => setMostrarCadastroAluno(!mostrarCadastroAluno)}
    className="mb-4 w-full rounded-2xl border border-lime-400 p-4 text-sm font-black text-lime-400"
  >
    {mostrarCadastroAluno ? "✕ FECHAR CADASTRO" : "+ CADASTRAR NOVO ALUNO"}
  </button>
    {(mostrarCadastroAluno || alunoEditando) && (
    <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
  <p className="text-sm font-black tracking-widest text-lime-400">
  {alunoEditando ? "EDITAR ALUNO" : "CADASTRAR NOVO ALUNO"}
  </p>

  <label className="mt-4 block text-xs font-bold text-zinc-500">
    NOME COMPLETO
  </label>

  <input
    type="text"
    value={novoAlunoNome}
    onChange={(e) => setNovoAlunoNome(e.target.value)}
    className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
  />

<label className="mt-4 block text-xs font-bold text-zinc-500">
  E-MAIL
</label>

<input
  type="email"
  value={novoAlunoEmail}
  onChange={(e) => setNovoAlunoEmail(e.target.value)}
  placeholder="aluno@email.com"
  className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
/>

<label className="mt-4 block text-xs font-bold text-zinc-500">
  SENHA PROVISÓRIA
</label>

<input
  type="password"
  value={novoAlunoSenha}
  onChange={(e) => setNovoAlunoSenha(e.target.value)}
  placeholder="Mínimo 6 caracteres"
  className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
/>

  <label className="mt-4 block text-xs font-bold text-zinc-500">
    TELEFONE
  </label>

  <input
    type="text"
    value={novoAlunoTelefone}
    onChange={(e) => setNovoAlunoTelefone(e.target.value)}
    className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
  />

  <label className="mt-4 block text-xs font-bold text-zinc-500">
    DATA DE NASCIMENTO
  </label>

  <input
    type="date"
    value={novoAlunoNascimento}
    onChange={(e) => setNovoAlunoNascimento(e.target.value)}
    className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
  />

  <label className="mt-4 block text-xs font-bold text-zinc-500">
    PLANO
  </label>

  <label className="mt-4 block text-xs font-bold text-zinc-500">
  PLANO
</label>

<select
  value={novoAlunoPlanoId ?? ""}
  onChange={(e) =>
    setNovoAlunoPlanoId(
      e.target.value ? Number(e.target.value) : null
    )
  }
  className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
>
  <option value="">Selecione um plano</option>

  {planos
    .filter(
  (plano) =>
    plano.ativo ||
    (alunoEditando && plano.id === alunoEditando.plano_id)
)
    .map((plano) => (
      <option key={plano.id} value={plano.id}>
        {plano.nome} - R${" "}
        {Number(plano.valor).toFixed(2).replace(".", ",")}
      </option>
    ))}
</select>

<label className="mt-4 block text-xs font-bold text-zinc-500">
  PRÓXIMO VENCIMENTO
</label>

<input
  type="date"
  value={novoAlunoVencimento}
  onChange={(e) => setNovoAlunoVencimento(e.target.value)}
  className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
/>

  <label className="mt-4 block text-xs font-bold text-zinc-500">
    OBSERVAÇÕES
  </label>

  <textarea
    value={novoAlunoObservacoes}
    onChange={(e) => setNovoAlunoObservacoes(e.target.value)}
    className="mt-2 min-h-24 w-full rounded-xl border border-zinc-700 bg-black p-3"
  />

  <button
  onClick={alunoEditando ? atualizarAluno : cadastrarNovoAluno}
    className="mt-5 w-full rounded-xl bg-lime-400 p-3 font-black text-black"
  >
  {alunoEditando ? "SALVAR ALTERAÇÕES" : "SALVAR ALUNO"}
  </button>
  {alunoEditando && (
  <button
    onClick={() => {
      setAlunoEditando(null);

      setNovoAlunoNome("");
      setNovoAlunoEmail("");
      setNovoAlunoSenha("");
      setNovoAlunoTelefone("");
      setNovoAlunoNascimento("");
      setNovoAlunoPlanoId(null);
setNovoAlunoVencimento("");
      setNovoAlunoObservacoes("");
    }}
    className="mt-2 w-full rounded-xl border border-zinc-700 p-3 font-black text-zinc-400"
  >
    CANCELAR EDIÇÃO
  </button>
)}
</div>
)}
{alunoDetalhes && (
  <div className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-black tracking-widest text-lime-400">
          DETALHES DO ALUNO
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          {alunoDetalhes.nome || "Aluno sem nome"}
        </h2>

        <p className="mt-2 text-sm font-bold">
          {alunoDetalhes.ativo ? "🟢 ATIVO" : "🔴 INATIVO"}
        </p>
      </div>

      <button
        onClick={() => setAlunoDetalhes(null)}
        className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-black text-zinc-400"
      >
        FECHAR
      </button>
    </div>

    <div className="mt-6 space-y-3 rounded-2xl bg-zinc-900 p-4 text-sm text-zinc-300">
      <p>
        📱 {alunoDetalhes.telefone || "Telefone não informado"}
      </p>

      <p>
        🎂{" "}
        {alunoDetalhes.data_nascimento
          ? alunoDetalhes.data_nascimento
              .split("-")
              .reverse()
              .join("/")
          : "Data de nascimento não informada"}
      </p>

      <p>
        🏷️ {alunoDetalhes.plano || "Plano não informado"}
      </p>

      <p>
        💰{" "}
        {alunoDetalhes.status_financeiro === "em_dia"
          ? "EM DIA"
          : "INADIMPLENTE"}
      </p>

      {alunoDetalhes.observacoes && (
        <p>
          📝 {alunoDetalhes.observacoes}
        </p>
      )}
    </div>
    <div className="mt-6">
  <p className="mb-3 text-xs font-black tracking-widest text-zinc-500">
    FREQUÊNCIA
  </p>

  <div className="grid grid-cols-3 gap-2">
    <div className="rounded-2xl bg-zinc-900 p-3 text-center">
      <p className="text-2xl font-black text-lime-400">
        {resumoFrequencia.presentes}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        PRESENÇAS
      </p>
    </div>

    <div className="rounded-2xl bg-zinc-900 p-3 text-center">
      <p className="text-2xl font-black text-red-400">
        {resumoFrequencia.faltas}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        FALTAS
      </p>
    </div>

    <div className="rounded-2xl bg-zinc-900 p-3 text-center">
      <p className="text-2xl font-black text-white">
        {resumoFrequencia.ultimos30Dias}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        30 DIAS
      </p>
    </div>
  </div>
</div>
  </div>
)}
    <p className="mb-4 text-sm font-bold tracking-widest text-zinc-500">
      ALUNOS CADASTRADOS
    </p>

    <input
  type="text"
  value={buscaAluno}
  onChange={(e) => setBuscaAluno(e.target.value)}
  placeholder="🔎 Buscar aluno pelo nome..."
  className="mb-4 w-full rounded-2xl border border-zinc-700 bg-black p-4 text-sm text-white"
/>
<div className="mb-4 flex flex-wrap gap-2">
  {[
    ["todos", "TODOS"],
    ["ativos", "ATIVOS"],
    ["inativos", "INATIVOS"],
    ["em_dia", "EM DIA"],
    ["em_atraso", "EM ATRASO"],
  ].map(([valor, texto]) => (
    <button
      key={valor}
      onClick={() => setFiltroAlunos(valor as typeof filtroAlunos)}
      className={`rounded-xl px-3 py-2 text-xs font-black ${
        filtroAlunos === valor
          ? "bg-lime-400 text-black"
          : "bg-zinc-900 text-zinc-400"
      }`}
    >
      {texto}
    </button>
  ))}
</div>

    {alunos.length === 0 ? (
      <div className="rounded-3xl border border-zinc-800 p-6 text-center text-zinc-500">
        Nenhum aluno cadastrado.
      </div>
    ) : (
      <div className="space-y-3">
        {alunosPaginados.map((aluno) => (
          <div
            key={aluno.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
  <p className="text-lg font-black text-white">
    {aluno.nome || "Aluno sem nome"}
  </p>

  <div className="mt-3 space-y-1 text-sm text-zinc-400">
    <p>
      📱 {aluno.telefone || "Telefone não informado"}
    </p>

    <p>
      🏷️ {aluno.plano || "Plano não informado"}
    </p>

    <p>
      💰{" "}
      {aluno.status_financeiro === "em_dia"
        ? "EM DIA"
        : "INADIMPLENTE"}
    </p>

    <p>
      {aluno.ativo ? "🟢 ATIVO" : "🔴 INATIVO"}
    </p>

    {aluno.data_nascimento && (
      <p>
        🎂{" "}
        {aluno.data_nascimento
          .split("-")
          .reverse()
          .join("/")}
      </p>
    )}

    {aluno.observacoes && (
      <p className="mt-2 text-xs text-zinc-500">
        📝 {aluno.observacoes}
      </p>
    )}
  </div>
</div>

              <button
  onClick={() =>
    alterarStatusFinanceiro(
      aluno.id,
      aluno.status_financeiro === "em_dia"
        ? "inadimplente"
        : "em_dia"
    )
  }
  className={`rounded-full px-3 py-2 text-xs font-black ${
    aluno.status_financeiro === "em_dia"
      ? "bg-lime-400/10 text-lime-400"
      : "bg-red-500/10 text-red-400"
  }`}
>
  {aluno.status_financeiro === "em_dia"
    ? "EM DIA"
    : "INADIMPLENTE"}
</button>

<button
onClick={async () => {
  await carregarPlanos();
  setAlunoEditando(aluno);

  setNovoAlunoNome(aluno.nome || "");
  setNovoAlunoTelefone(aluno.telefone || "");
  setNovoAlunoNascimento(aluno.data_nascimento || "");
  setNovoAlunoPlanoId(aluno.plano_id ?? null);
setNovoAlunoVencimento(aluno.proximo_vencimento || "");
  setNovoAlunoObservacoes(aluno.observacoes || "");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}}
  className="mt-3 w-full rounded-xl border border-zinc-700 p-2 text-xs font-black text-zinc-300"
>
  EDITAR ALUNO
</button>
<button
 onClick={async () => {
  setAlunoDetalhes(aluno);
  await carregarFrequenciaAluno(aluno.id);
}}
  className="mt-3 w-full rounded-xl bg-zinc-800 p-2 text-xs font-black text-white transition hover:bg-zinc-700"
>
  VER DETALHES
</button>
<button
  onClick={() => {
    setAlunoPagamento(
      alunoPagamento?.id === aluno.id ? null : aluno
    );

    const planoDoAluno = planos.find(
      (plano) => plano.id === aluno.plano_id
    );

    if (planoDoAluno) {
      setValorPagamento(String(planoDoAluno.valor));
    } else {
      setValorPagamento("");
    }
  }}
  className="mt-3 w-full rounded-xl border border-lime-400/40 p-3 text-xs font-black text-lime-400"
>
  {alunoPagamento?.id === aluno.id
    ? "✕ FECHAR PAGAMENTO"
    : "💰 REGISTRAR PAGAMENTO"}
</button>
{alunoPagamento?.id === aluno.id && (
  <div className="mt-3 rounded-2xl border border-zinc-800 bg-black/30 p-4">
    <p className="text-xs font-black tracking-widest text-zinc-500">
      REGISTRAR PAGAMENTO
    </p>

    <label className="mt-4 block text-xs font-bold text-zinc-500">
      VALOR
    </label>

    <input
      type="text"
      value={valorPagamento}
      onChange={(e) => setValorPagamento(e.target.value)}
      placeholder="Ex: 150,00"
      className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
    />

    <label className="mt-4 block text-xs font-bold text-zinc-500">
      DATA DO PAGAMENTO
    </label>

    <input
      type="date"
      value={dataPagamento}
      onChange={(e) => setDataPagamento(e.target.value)}
      className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
    />

    <p className="mt-3 text-xs text-zinc-500">
      Vencimento atual:{" "}
      {aluno.proximo_vencimento
        ? aluno.proximo_vencimento.split("-").reverse().join("/")
        : "Não definido"}
    </p>

    <button
      onClick={registrarPagamento}
      className="mt-4 w-full rounded-xl bg-lime-400 p-3 text-sm font-black text-black"
    >
      CONFIRMAR PAGAMENTO
    </button>
  </div>
)}
            </div>
          </div>
        ))}
        {alunosFiltrados.length > 0 && (
  <div className="mt-5 flex items-center justify-between gap-3">
    <button
      onClick={() =>
        setPaginaAlunos((pagina) => Math.max(1, pagina - 1))
      }
      disabled={paginaAlunos === 1}
      className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-black text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
    >
      ← ANTERIOR
    </button>

    <p className="text-xs font-bold text-zinc-500">
      {paginaAlunos} / {totalPaginasAlunos}
    </p>

    <button
      onClick={() =>
        setPaginaAlunos((pagina) =>
          Math.min(totalPaginasAlunos, pagina + 1)
        )
      }
      disabled={paginaAlunos === totalPaginasAlunos}
      className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-black text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
    >
      PRÓXIMA →
    </button>
  </div>
)}
      </div>
    )}
  </div>
)}
{abaGestao === "financeiro" && (
  <section className="mt-8">
    <div className="grid grid-cols-2 gap-3">
  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
    <p className="text-xs font-black tracking-widest text-zinc-500">
      RECEBIDO NO MÊS
    </p>

    <p className="mt-2 text-xl font-black text-lime-400">
      R$ {recebidoNoMes.toFixed(2).replace(".", ",")}
    </p>
  </div>

  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
    <p className="text-xs font-black tracking-widest text-zinc-500">
      RECEITA PREVISTA
    </p>

    <p className="mt-2 text-xl font-black text-white">
      R$ {receitaPrevista.toFixed(2).replace(".", ",")}
    </p>
  </div>

  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
    <p className="text-xs font-black tracking-widest text-zinc-500">
      INADIMPLENTES
    </p>

    <p className="mt-2 text-xl font-black text-red-400">
      {totalInadimplentes}
    </p>
  </div>

  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
    <p className="text-xs font-black tracking-widest text-zinc-500">
      EM DIA
    </p>

    <p className="mt-2 text-xl font-black text-lime-400">
      {totalEmDia}
    </p>
  </div>
</div>
    <p className="mb-4 text-sm font-black tracking-widest text-zinc-500">
      PLANOS
    </p>

    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <label className="block text-xs font-bold text-zinc-500">
        NOME DO PLANO
      </label>

      <input
        type="text"
        value={novoPlanoNome}
        onChange={(e) => setNovoPlanoNome(e.target.value)}
        placeholder="Ex: Mensal"
        className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
      />

      <label className="mt-4 block text-xs font-bold text-zinc-500">
        VALOR
      </label>

      <input
        type="text"
        value={novoPlanoValor}
        onChange={(e) => setNovoPlanoValor(e.target.value)}
        placeholder="Ex: 150,00"
        className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
      />

      <label className="mt-4 block text-xs font-bold text-zinc-500">
        CICLO EM MESES
      </label>

      <input
        type="number"
        min="1"
        value={novoPlanoMeses}
        onChange={(e) => setNovoPlanoMeses(Number(e.target.value))}
        className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
      />

      <button
        onClick={criarPlano}
        className="mt-5 w-full rounded-2xl bg-lime-400 p-4 font-black text-black"
      >
        + CRIAR PLANO
      </button>
    </div>

    <p className="mb-4 mt-8 text-sm font-black tracking-widest text-zinc-500">
      PLANOS CADASTRADOS
    </p>

    {planos.length === 0 ? (
      <div className="rounded-3xl border border-zinc-800 p-6 text-center text-zinc-500">
        Nenhum plano cadastrado.
      </div>
    ) : (
      <div className="space-y-3">
        {planosOrganizados.map((plano, index) => (
  <div key={plano.id}>
    {index === 0 && (
      <p className="mb-3 text-xs font-black tracking-widest text-lime-400">
        PLANOS ATIVOS
      </p>
    )}

    {!plano.ativo &&
      (index === 0 || planosOrganizados[index - 1]?.ativo) && (
        <p className="mb-3 mt-8 text-xs font-black tracking-widest text-zinc-500">
          PLANOS INATIVOS
        </p>
      )}

    <div
      className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
    >
            <p className="font-black text-white">
              {plano.nome}
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              R$ {Number(plano.valor).toFixed(2).replace(".", ",")}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Ciclo: {plano.meses_ciclo}{" "}
              {plano.meses_ciclo === 1 ? "mês" : "meses"}
            </p>

            <p
              className={`mt-2 text-xs font-black ${
                plano.ativo
                  ? "text-lime-400"
                  : "text-red-400"
              }`}
            >
              {plano.ativo ? "ATIVO" : "INATIVO"}
            </p>
            <button
  onClick={() => {
    setPlanoEditando(plano);
    setNovoPlanoNome(plano.nome || "");
    setNovoPlanoValor(String(plano.valor ?? ""));
    setNovoPlanoMeses(Number(plano.meses_ciclo || 1));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }}
  className="mt-4 w-full rounded-xl border border-zinc-700 p-3 text-xs font-black text-zinc-300"
>
  EDITAR PLANO
</button>
<button
  onClick={() => alterarStatusPlano(plano)}
  className={`mt-2 w-full rounded-xl border p-3 text-xs font-black ${
    plano.ativo
      ? "border-red-500/30 text-red-400"
      : "border-lime-400/30 text-lime-400"
  }`}
>
  {plano.ativo ? "DESATIVAR PLANO" : "ATIVAR PLANO"}
</button>
{!plano.ativo && (
  <button
    onClick={() => excluirPlano(plano)}
    className="mt-2 w-full rounded-xl border border-red-500/30 p-3 text-xs font-black text-red-400"
  >
    EXCLUIR PLANO
  </button>
)}
          </div>
          </div>
        ))}
      </div>
    )}
    <p className="mb-4 mt-8 text-sm font-black tracking-widest text-zinc-500">
  HISTÓRICO DE PAGAMENTOS
</p>

{pagamentos.length === 0 ? (
  <div className="rounded-3xl border border-zinc-800 p-6 text-center text-zinc-500">
    Nenhum pagamento registrado.
  </div>
) : (
  <div className="space-y-3">
    {pagamentos.map((pagamento) => (
      <div
        key={pagamento.id}
        className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-black text-white">
              {pagamento.perfis?.nome || "Aluno"}
            </p>

            <p className="mt-1 text-xs font-bold tracking-widest text-lime-400">
              {pagamento.planos?.nome || "PLANO NÃO INFORMADO"}
            </p>
          </div>

          <p className="font-black text-lime-400">
            R${" "}
            {Number(pagamento.valor)
              .toFixed(2)
              .replace(".", ",")}
          </p>
        </div>

        <div className="mt-4 space-y-1 text-xs text-zinc-500">
          <p>
            PAGO EM:{" "}
            {pagamento.data_pagamento
              ?.split("-")
              .reverse()
              .join("/")}
          </p>

          {pagamento.vencimento_anterior && (
            <p>
              VENCIMENTO ANTERIOR:{" "}
              {pagamento.vencimento_anterior
                .split("-")
                .reverse()
                .join("/")}
            </p>
          )}

          {pagamento.novo_vencimento && (
            <p>
              NOVO VENCIMENTO:{" "}
              {pagamento.novo_vencimento
                .split("-")
                .reverse()
                .join("/")}
            </p>
          )}
        </div>
      </div>
    ))}
  </div>
)}
  </section>
)}
{abaGestao === "checkins" && (
  <div className="mt-8">

    <p className="mb-4 text-sm font-bold tracking-widest text-zinc-500">
      CRIAR AULA
    </p>

    <div className="rounded-3xl bg-zinc-900 p-5">

      <label className="text-sm font-bold text-zinc-400">
        DATA
      </label>

      <input
        type="date"
        value={dataAula}
        onChange={(e) => setDataAula(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-zinc-700 bg-black p-4"
      />

      <label className="mt-5 block text-sm font-bold text-zinc-400">
        HORÁRIO
      </label>

      <input
        type="time"
        value={horarioAula}
        onChange={(e) => setHorarioAula(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-zinc-700 bg-black p-4"
      />

      <label className="mt-5 block text-sm font-bold text-zinc-400">
        LOCAL
      </label>

      <input
        type="text"
        value={localAula}
        onChange={(e) => setLocalAula(e.target.value)}
        placeholder="Ex: Estacionamento Nélio Dias"
        className="mt-2 w-full rounded-2xl border border-zinc-700 bg-black p-4"
      />

      <label className="mt-5 block text-sm font-bold text-zinc-400">
        VAGAS
      </label>

      <input
        type="number"
        min="1"
        value={vagasAula}
        onChange={(e) => setVagasAula(Number(e.target.value))}
        className="mt-2 w-full rounded-2xl border border-zinc-700 bg-black p-4"
      />
<label className="mt-5 block text-sm font-bold text-zinc-400">
  TREINO DA AULA
</label>

{treinoAula && !mostrarSeletorTreinoAula ? (
  <div className="mt-2 rounded-2xl border border-lime-400/30 bg-lime-400/10 p-4">
    {(() => {
      const treinoSelecionado = treinosDisponiveis.find(
        (treino) => treino.id === treinoAula
      );

      if (!treinoSelecionado) return null;

      return (
        <>
          <p className="text-xs font-black text-lime-400">
            ✓ TREINO SELECIONADO
          </p>

          <p className="mt-2 font-black text-white">
            {treinoSelecionado.titulo}
          </p>

          <p className="mt-1 text-xs text-zinc-400">
            {treinoSelecionado.data.split("-").reverse().join("/")}
            {treinoSelecionado.tipo_treino
              ? ` • ${treinoSelecionado.tipo_treino}`
              : ""}
          </p>

          <button
            type="button"
            onClick={() => setMostrarSeletorTreinoAula(true)}
            className="mt-4 w-full rounded-xl border border-zinc-700 p-3 text-xs font-black text-zinc-300"
          >
            TROCAR TREINO
          </button>
        </>
      );
    })()}
  </div>
) : (

<div className="mt-2">
  <input
    type="text"
    value={buscaTreinoAula}
    onChange={(e) => setBuscaTreinoAula(e.target.value)}
    placeholder="🔎 Buscar treino pelo nome..."
    className="w-full rounded-2xl border border-zinc-700 bg-black p-4"
  />

<div className="mt-3 grid grid-cols-4 gap-2">
  {[
    { valor: "futuros", texto: "FUTUROS" },
    { valor: "hoje", texto: "HOJE" },
    { valor: "passados", texto: "PASSADOS" },
    { valor: "todos", texto: "TODOS" },
  ].map((filtro) => (
    <button
      key={filtro.valor}
      type="button"
      onClick={() =>
        setFiltroTreinoAula(
          filtro.valor as "futuros" | "hoje" | "passados" | "todos"
        )
      }
      className={`rounded-xl border px-2 py-2 text-[10px] font-black ${
        filtroTreinoAula === filtro.valor
          ? "border-lime-400 bg-lime-400 text-black"
          : "border-zinc-800 bg-zinc-900 text-zinc-400"
      }`}
    >
      {filtro.texto}
    </button>
  ))}
</div>

  <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
    {treinosFiltradosParaAula.length === 0 ? (
      <div className="rounded-2xl border border-zinc-800 p-4 text-center text-sm text-zinc-500">
        Nenhum treino encontrado.
      </div>
    ) : (
      treinosFiltradosParaAula.map((treino) => {
        const selecionado = treinoAula === treino.id;

        return (
          <button
            key={treino.id}
            type="button"
            onClick={() => {
  setTreinoAula(treino.id);
  setMostrarSeletorTreinoAula(false);
}}
            className={`w-full rounded-2xl border p-4 text-left transition ${
              selecionado
                ? "border-lime-400 bg-lime-400/10"
                : "border-zinc-800 bg-zinc-900"
            }`}
          >
            <p className="font-black text-white">
              {treino.titulo}
            </p>

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-xs text-zinc-500">
                {treino.data.split("-").reverse().join("/")}
              </p>

              {treino.tipo_treino && (
                <span className="rounded-full border border-lime-400/30 px-2 py-1 text-xs font-black text-lime-400">
                  {treino.tipo_treino}
                </span>
              )}
            </div>

            {selecionado && (
              <p className="mt-3 text-xs font-black text-lime-400">
                ✓ TREINO SELECIONADO
              </p>
            )}
          </button>
        );
      })
    )}
  </div>
</div>
)}
{treinoAula && (() => {
  const treinoSelecionado = treinosDisponiveis.find(
    (treino) => treino.id === treinoAula
  );

  if (!treinoSelecionado?.tipo_treino) {
    return null;
  }

  return (
    <div className="mt-3 rounded-xl border border-lime-400/30 bg-lime-400/10 p-3">
      <p className="text-xs font-bold tracking-widest text-zinc-500">
        TIPO DO TREINO
      </p>

      <p className="mt-1 font-black text-lime-400">
        {treinoSelecionado.tipo_treino}
      </p>
    </div>
  );
})()}
      <button
        onClick={criarAula}
        className="mt-5 w-full rounded-2xl bg-lime-400 p-4 font-black text-black"
      >
        + CRIAR AULA
      </button>

    </div>
  <div className="mt-8">
  <p className="mb-4 text-sm font-bold tracking-widest text-zinc-500">
    AULAS CRIADAS
  </p>

  {aulas.length === 0 ? (
    <div className="rounded-3xl border border-zinc-800 p-6 text-center text-zinc-500">
      Nenhuma aula criada.
    </div>
  ) : (
    <div className="space-y-3">
      {aulas.map((aula) => {
        const ocupadas =
          contagemCheckins.find((item) => item.aula_id === aula.id)?.total || 0;
          const treinoDaAula = treinosDisponiveis.find(
  (treino) => treino.id === aula.treino_id
);
          const cronometroDaAula = cronometrosAulas[aula.id];
          const dadosEmom =
  cronometroDaAula?.tipo === "emom"
    ? calcularEmom(cronometroDaAula)
    : null;
    const dadosIntervalado =
  cronometroDaAula?.tipo === "intervalado"
    ? calcularIntervalado(cronometroDaAula)
    : null;
          const tempoDaAula = temposRestantesAulas[aula.id] ?? 0;

const minutosDaAula = Math.floor(tempoDaAula / 60);
const segundosDaAula = tempoDaAula % 60;

const tempoFormatadoDaAula = `${String(minutosDaAula).padStart(
  2,
  "0"
)}:${String(segundosDaAula).padStart(2, "0")}`;

        return (
          <div
            key={aula.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <p className="font-black text-white">
              {aula.data.split("-").reverse().join("/")} •{" "}
              {aula.horario.slice(0, 5)}
            </p>

            <p className="mt-2 text-sm text-zinc-400">
              📍 {aula.local || "Local a definir"}
            </p>

            {treinoDaAula && (
  <div className="mt-2">
    <p className="text-sm font-bold text-white">
      🏋️ {treinoDaAula.titulo}
    </p>

    {treinoDaAula.tipo_treino && (
      <span className="mt-1 inline-flex rounded-full border border-lime-400/40 bg-lime-400/10 px-2 py-1 text-xs font-black tracking-widest text-lime-400">
        {treinoDaAula.tipo_treino}
      </span>
    )}
  </div>
)}

            <p className="mt-1 text-sm text-zinc-400">
              👥 {ocupadas}/{aula.vagas} inscritos
            </p>

<div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
  <p className="text-xs font-black tracking-widest text-zinc-500">
    CRONÔMETRO DA AULA
  </p>

{cronometroDaAula?.status === "rodando" ? (
    <div className="mt-4 text-center">

{cronometroDaAula?.tipo === "emom" && dadosEmom ? (
  <div className="mt-3">
    <p className="text-xs font-black tracking-widest text-zinc-500">
      ROUND {dadosEmom.roundAtual} / {dadosEmom.totalRounds}
    </p>

    <p className="mt-2 text-5xl font-black tracking-tight text-lime-400">
      {String(
        Math.floor(dadosEmom.tempoRestanteRound / 60)
      ).padStart(2, "0")}
      :
      {String(
        dadosEmom.tempoRestanteRound % 60
      ).padStart(2, "0")}
    </p>

    <p className="mt-2 text-xs font-black tracking-widest text-zinc-500">
      PARA O PRÓXIMO ROUND
    </p>

    <p className="mt-4 text-sm font-bold text-zinc-400">
      TEMPO TOTAL: {tempoFormatadoDaAula}
    </p>
  </div>

) : cronometroDaAula?.tipo === "intervalado" &&
    dadosIntervalado ? (

  <div className="mt-3">
    <p className="text-xs font-black tracking-widest text-zinc-500">
      ROUND {dadosIntervalado.roundAtual} / {dadosIntervalado.totalRounds}
    </p>

    <p
      className={`mt-3 text-sm font-black tracking-widest ${
        dadosIntervalado.fase === "trabalho"
          ? "text-lime-400"
          : "text-yellow-400"
      }`}
    >
      {dadosIntervalado.fase === "trabalho"
        ? "🔥 TRABALHO"
        : "💤 DESCANSO"}
    </p>

    <p className="mt-2 text-5xl font-black tracking-tight text-white">
      {String(
        Math.floor(dadosIntervalado.tempoRestanteFase / 60)
      ).padStart(2, "0")}
      :
      {String(
        dadosIntervalado.tempoRestanteFase % 60
      ).padStart(2, "0")}
    </p>

    <p className="mt-2 text-xs font-black tracking-widest text-zinc-500">
      {dadosIntervalado.fase === "trabalho"
        ? "TEMPO DE TRABALHO"
        : "TEMPO DE DESCANSO"}
    </p>

    <p className="mt-4 text-sm font-bold text-zinc-400">
      TEMPO TOTAL: {tempoFormatadoDaAula}
    </p>
  </div>

) : (
  <p className="text-5xl font-black tracking-tight text-lime-400">
    {tempoFormatadoDaAula}
  </p>
)}

      <p className="mt-2 text-xs font-black tracking-widest text-lime-400">
        ● EM ANDAMENTO
      </p>
      <button
  onClick={() => pausarCronometroAula(aula.id)}
  className="mt-4 w-full rounded-xl border border-yellow-500/50 p-3 text-sm font-black text-yellow-400"
>
  ⏸ PAUSAR
</button>
      <button
  onClick={() => {
    const confirmar = window.confirm(
      "Tem certeza que deseja encerrar o cronômetro desta aula agora?"
    );

    if (confirmar) {
      finalizarCronometroAula(aula.id);
    }
  }}
  className="mt-4 w-full rounded-xl border border-red-500/50 p-3 text-sm font-black text-red-400"
>
  ■ ENCERRAR AGORA
</button>

    </div>
) : cronometroDaAula?.status === "pausado" ? (
  <div className="mt-4 text-center">
    <p className="text-5xl font-black tracking-tight text-yellow-400">
      {tempoFormatadoDaAula}
    </p>

    <p className="mt-2 text-xs font-black tracking-widest text-yellow-400">
      ⏸ PAUSADO
    </p>

    <button
      onClick={() => retomarCronometroAula(aula.id)}
      className="mt-4 w-full rounded-xl bg-lime-400 p-3 text-sm font-black text-black"
    >
      ▶ RETOMAR
    </button>

    <button
      onClick={() => {
        const confirmar = window.confirm(
          "Tem certeza que deseja encerrar o cronômetro desta aula agora?"
        );

        if (confirmar) {
          finalizarCronometroAula(aula.id);
        }
      }}
      className="mt-2 w-full rounded-xl border border-red-500/50 p-3 text-sm font-black text-red-400"
    >
      ■ ENCERRAR AGORA
    </button>
  </div>
) : (
    <>
    <label className="mt-3 block text-xs font-bold text-zinc-500">
  TIPO DE CRONÔMETRO
</label>

<select
  value={tipoCronometro}
  onChange={(e) =>
    setTipoCronometro(
      e.target.value as
        | "regressivo"
        | "progressivo"
        | "emom"
        | "intervalado"
    )
  }
  className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
>
  <option value="regressivo">REGRESSIVO</option>
  <option value="progressivo">PROGRESSIVO</option>
  <option value="emom">EMOM</option>
  <option value="intervalado">INTERVALADO</option>
</select>
{tipoCronometro === "emom" && (
  <>
    <label className="mt-3 block text-xs font-bold text-zinc-500">
      INTERVALO DO EMOM (MINUTOS)
    </label>

    <input
      type="number"
      min="1"
      value={intervaloEmom}
      onChange={(e) => setIntervaloEmom(Number(e.target.value))}
      className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
    />
  </>
)}
{tipoCronometro === "intervalado" && (
  <>
    <label className="mt-3 block text-xs font-bold text-zinc-500">
      TEMPO DE TRABALHO (SEGUNDOS)
    </label>

    <input
      type="number"
      min="1"
      value={trabalhoIntervalado}
      onChange={(e) =>
        setTrabalhoIntervalado(Number(e.target.value))
      }
      className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
    />

    <label className="mt-3 block text-xs font-bold text-zinc-500">
      TEMPO DE DESCANSO (SEGUNDOS)
    </label>

    <input
      type="number"
      min="0"
      value={descansoIntervalado}
      onChange={(e) =>
        setDescansoIntervalado(Number(e.target.value))
      }
      className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
    />

    <label className="mt-3 block text-xs font-bold text-zinc-500">
      NÚMERO DE ROUNDS
    </label>

    <input
      type="number"
      min="1"
      value={roundsIntervalado}
      onChange={(e) =>
        setRoundsIntervalado(Number(e.target.value))
      }
      className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
    />
  </>
)}
{tipoCronometro !== "intervalado" && (
  <>
      <label className="mt-3 block text-xs font-bold text-zinc-500">
        DURAÇÃO EM MINUTOS
      </label>

      <input
        type="number"
        min="1"
        value={duracaoCronometro}
        onChange={(e) =>
          setDuracaoCronometro(Number(e.target.value))
        }
        className="mt-2 w-full rounded-xl border border-zinc-700 bg-black p-3"
      />
        </>
)}

      <button
        onClick={() => iniciarCronometroAula(aula.id)}
        className="mt-3 w-full rounded-xl bg-lime-400 p-3 text-sm font-black text-black"
      >
        ▶ INICIAR CRONÔMETRO
      </button>
    </>
  )}
</div>

<button
 onClick={async () => {
  setAulaEditando(aula);
  setAlunosInscritos([]);
  setAulaSelecionada(aula.id);
  await carregarAlunosDaAula(aula.id);
}}
  className="mt-4 w-full rounded-2xl border border-zinc-700 p-3 text-sm font-black text-zinc-300"
>
  EDITAR AULA
</button>

{aulaEditando?.id === aula.id && (
  <div className="mt-4 rounded-2xl border border-zinc-700 bg-black p-4">
    <p className="mb-4 text-sm font-black text-white">
      EDITANDO AULA
    </p>

    <label className="text-xs font-bold text-zinc-500">
      DATA
    </label>

    <input
      type="date"
      value={aulaEditando.data}
      onChange={(e) =>
        setAulaEditando({
          ...aulaEditando,
          data: e.target.value,
        })
      }
      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
    />

    <label className="mt-4 block text-xs font-bold text-zinc-500">
      HORÁRIO
    </label>

    <input
      type="time"
      value={aulaEditando.horario.slice(0, 5)}
      onChange={(e) =>
        setAulaEditando({
          ...aulaEditando,
          horario: e.target.value,
        })
      }
      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
    />

    <label className="mt-4 block text-xs font-bold text-zinc-500">
      LOCAL
    </label>

    <input
      type="text"
      value={aulaEditando.local || ""}
      onChange={(e) =>
        setAulaEditando({
          ...aulaEditando,
          local: e.target.value,
        })
      }
      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
    />

    <label className="mt-4 block text-xs font-bold text-zinc-500">
      VAGAS
    </label>

    <label className="mt-4 block text-xs font-bold text-zinc-500">
  TREINO DA AULA
</label>

<select
  value={aulaEditando.treino_id ?? ""}
  onChange={(e) =>
    setAulaEditando({
      ...aulaEditando,
      treino_id: e.target.value ? Number(e.target.value) : null,
    })
  }
  className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
>
  <option value="">SEM TREINO</option>

  {treinosDisponiveis.map((treino) => (
    <option key={treino.id} value={treino.id}>
      {treino.titulo}
    </option>
  ))}
</select>

    <input
      type="number"
      min="1"
      value={aulaEditando.vagas}
      onChange={(e) =>
        setAulaEditando({
          ...aulaEditando,
          vagas: Number(e.target.value),
        })
      }
      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
    />

    <div className="mt-4 grid grid-cols-2 gap-2">
      <button
        onClick={() => setAulaEditando(null)}
        className="rounded-xl border border-zinc-700 p-3 text-sm font-black text-zinc-400"
      >
        CANCELAR
      </button>

      <button
        onClick={salvarEdicaoAula}
        className="rounded-xl bg-lime-400 p-3 text-sm font-black text-black"
      >
        SALVAR
      </button>
    </div>
  </div>
)}
<button
  onClick={() => cancelarAula(aula.id)}
  className="mt-2 w-full rounded-2xl border border-red-500/40 p-3 text-sm font-black text-red-400"
>
  CANCELAR AULA
</button>

           <button
  onClick={() => carregarAlunosDaAula(aula.id)}
  className="mt-4 w-full rounded-2xl border border-lime-400 p-3 text-sm font-black text-lime-400"
>
  VER ALUNOS
</button>

{aulaSelecionada === aula.id && (
  <div className="mt-4 rounded-2xl bg-black p-4">
    <p className="mb-3 text-sm font-black text-lime-400">
      ALUNOS INSCRITOS
    </p>

    {alunosInscritos.length === 0 ? (
      <p className="text-sm text-zinc-500">
        Nenhum aluno inscrito nesta aula.
      </p>
    ) : (
      <div className="space-y-2">
        {alunosInscritos.map((aluno) => (
        <div
  key={aluno.id}
  className="rounded-xl bg-zinc-900 p-3"
>
  <p className="font-bold text-white">
    👤 {aluno.nome || "Aluno sem nome"}
  </p>

<p
  className={`mt-2 text-xs font-black ${
    aluno.status === "presente"
      ? "text-lime-400"
      : aluno.status === "faltou"
      ? "text-red-400"
      : "text-yellow-400"
  }`}
>
  {aluno.status === "presente"
    ? "✅ PRESENTE"
    : aluno.status === "faltou"
    ? "❌ FALTOU"
    : "🕐 AGUARDANDO"}
</p>

  <div className="mt-3 grid grid-cols-2 gap-2">
<button
  onClick={() => cancelarCheckin(aula.id, aluno.id)}
  className="mt-3 w-full rounded-xl border border-red-500/40 p-2 text-xs font-black text-red-400"
>
  CANCELAR CHECK-IN
</button>
  </div>
</div>
        ))}
      </div>
    )}
  </div>
)}
          </div>
        );
      })}
    </div>
  )}
</div>
</div>
)}

<div className="mt-10">
  <p className="mb-4 text-sm font-bold tracking-widest text-zinc-500">
    HISTÓRICO DE AULAS CANCELADAS
  </p>

  {aulasCanceladas.length === 0 ? (
    <div className="rounded-3xl border border-zinc-800 p-6 text-center text-zinc-500">
      Nenhuma aula cancelada.
    </div>
  ) : (
    <div className="space-y-3">
      {aulasCanceladas.map((aula) => (
        <div
          key={aula.id}
          className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5"
        >
          <p className="font-black text-zinc-300">
            {aula.data.split("-").reverse().join("/")} •{" "}
            {aula.horario.slice(0, 5)}
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            📍 {aula.local || "Local a definir"}
          </p>

          <p className="mt-2 text-xs font-black text-red-400">
            CANCELADA
          </p>
          <button
  onClick={() => reativarAula(aula.id)}
  className="mt-4 w-full rounded-2xl border border-lime-400 p-3 text-sm font-black text-lime-400"
>
  REATIVAR AULA
</button>
<button
  onClick={() => excluirAulaPermanentemente(aula.id)}
  className="mt-2 w-full rounded-2xl bg-red-500/10 p-3 text-sm font-black text-red-400"
>
  EXCLUIR PERMANENTEMENTE
</button>
        </div>
      ))}
    </div>
  )}
</div>

          </section>
        ) : (
          <>
{abaAluno === "treino" && !aulaSelecionada && (
  <>
    <section className="mb-8">
      <p className="mb-4 text-sm font-bold tracking-widest text-zinc-500">
        PRÓXIMA AULA
      </p>

      {aulas.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-center text-zinc-500">
          Nenhuma aula disponível no momento.
        </div>
      ) : (
        <div className="space-y-4">
          {aulas.slice(0, 1).map((aula) => {
            const checkinExistente = checkins.find(
              (checkin) => checkin.aula_id === aula.id
            );

            const temTreino = aula.treino_id !== null;

            const treinoDaAula = treinosDisponiveis.find(
              (treino) => treino.id === aula.treino_id
            );

            const ocupadas =
              contagemCheckins.find(
                (item) => item.aula_id === aula.id
              )?.total || 0;

            const restantes = Math.max(
              aula.vagas - ocupadas,
              0
            );

            return (
              <div
                key={aula.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
              >
                <p className="text-xl font-black text-white">
                  {aula.data.split("-").reverse().join("/")} •{" "}
                  {aula.horario.slice(0, 5)}
                </p>

                <p className="mt-2 text-sm text-zinc-400">
                  📍 {aula.local || "Local a definir"}
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  👥 {ocupadas}/{aula.vagas} vagas ocupadas
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  {restantes === 0
                    ? "Aula lotada"
                    : `${restantes} ${
                        restantes === 1
                          ? "vaga restante"
                          : "vagas restantes"
                      }`}
                </p>

                {treinoDaAula && (
                  <div className="mt-4 rounded-2xl border border-lime-400/30 bg-lime-400/10 p-4">
                    <p className="text-xs font-black tracking-widest text-zinc-500">
                      TREINO
                    </p>

                    <p className="mt-1 text-lg font-black text-white">
                      {treinoDaAula.titulo}
                    </p>

                    {treinoDaAula.tipo_treino && (
                      <span className="mt-2 inline-flex rounded-full border border-lime-400/40 px-3 py-1 text-xs font-black tracking-widest text-lime-400">
                        {treinoDaAula.tipo_treino}
                      </span>
                    )}
                    {exerciciosInicio.length > 0 && (
  <div className="mt-4 border-t border-lime-400/20 pt-4">
    <p className="text-xs font-black tracking-widest text-zinc-500">
      EXERCÍCIOS
    </p>

    <div className="mt-3 space-y-2">
      {exerciciosInicio.map((exercicio, index) => (
        <div
          key={exercicio.id}
          className="flex items-center gap-3 text-sm text-zinc-300"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-black text-lime-400">
            {index + 1}
          </span>

          <span className="font-semibold">
            {exercicio.nome}
          </span>
        </div>
      ))}
    </div>
  </div>
)}
                  </div>
                )}

                {checkinExistente && (
  <div className="mt-4 rounded-2xl bg-lime-400/10 p-4 text-center font-black text-lime-400">
    ✅ CHECK-IN CONFIRMADO
  </div>
)}

                {checkinExistente && temTreino && (
                  <button
                    onClick={async () => {
                      setAulaSelecionada(aula.id);

                      await carregarTreinoDaAula(
                        aula.treino_id
                      );

                      await carregarCronometroAula(
                        aula.id
                      );
                    }}
                    className="mt-3 w-full rounded-2xl border border-lime-400 p-4 text-sm font-black text-lime-400"
                  >
                    VER TREINO DA AULA
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  </>
)}
{abaAluno === "treino" && aulaSelecionada && (
  <section className="mb-8">
    <button
      onClick={() => setAulaSelecionada(null)}
      className="mb-6 w-full rounded-2xl border border-zinc-700 p-3 text-sm font-black text-zinc-300"
    >
      ← VOLTAR AO INÍCIO
    </button>

    <div className="rounded-3xl border border-lime-400/30 bg-lime-400/10 p-5">
      <p className="text-xs font-black tracking-widest text-lime-400">
        ZN HYBRID
      </p>

      <p className="mt-2 text-2xl font-black text-white">
        {tituloTreinoAtual || "TREINO DA AULA"}
      </p>

      {tipoTreinoAluno && (
        <span className="mt-3 inline-flex rounded-full border border-lime-400/40 px-3 py-1 text-xs font-black tracking-widest text-lime-400">
          {tipoTreinoAluno}
        </span>
      )}
    </div>
    <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
  <div className="flex items-center justify-between">
    <p className="text-sm font-black tracking-widest text-zinc-500">
      PROGRESSO
    </p>

    <p className="text-sm font-black text-lime-400">
      {concluidos.length}/{exercicios.length}
    </p>
  </div>

  <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
    <div
      className="h-full bg-lime-400 transition-all"
      style={{
        width:
          exercicios.length === 0
            ? "0%"
            : `${Math.round(
                (concluidos.length / exercicios.length) * 100
              )}%`,
      }}
    />
  </div>

  <p className="mt-2 text-right text-xs font-bold text-zinc-500">
    {exercicios.length === 0
      ? 0
      : Math.round(
          (concluidos.length / exercicios.length) * 100
        )}
    %
  </p>
</div>
<div className="mt-6">
  {!cronometroAula ? (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 text-center">
      <p className="text-xs font-black tracking-widest text-zinc-500">
        CRONÔMETRO DA AULA
      </p>

      <p className="mt-3 text-sm text-zinc-400">
        Aguardando início do cronômetro
      </p>
    </div>
  ) : cronometroAula.status === "rodando" ? (
    <div className="rounded-3xl border border-lime-400/40 bg-lime-400/10 p-5 text-center">
      {cronometroAula.tipo === "emom" && dadosEmomAluno ? (
        <>
          <p className="text-xs font-black tracking-widest text-lime-400">
            ROUND {dadosEmomAluno.roundAtual} /{" "}
            {dadosEmomAluno.totalRounds}
          </p>

          <p className="mt-3 text-6xl font-black tracking-tight text-white">
            {String(
              Math.floor(
                dadosEmomAluno.tempoRestanteRound / 60
              )
            ).padStart(2, "0")}
            :
            {String(
              dadosEmomAluno.tempoRestanteRound % 60
            ).padStart(2, "0")}
          </p>

          <p className="mt-2 text-xs font-black tracking-widest text-lime-400">
            PARA O PRÓXIMO ROUND
          </p>

          <p className="mt-4 text-sm font-bold text-zinc-400">
            TEMPO TOTAL: {tempoFormatado}
          </p>
        </>
      ) : cronometroAula.tipo === "intervalado" &&
        dadosIntervaladoAluno ? (
        <>
          <p className="text-xs font-black tracking-widest text-zinc-400">
            ROUND {dadosIntervaladoAluno.roundAtual} /{" "}
            {dadosIntervaladoAluno.totalRounds}
          </p>

          <p
            className={`mt-3 text-lg font-black tracking-widest ${
              dadosIntervaladoAluno.fase === "trabalho"
                ? "text-lime-400"
                : "text-yellow-400"
            }`}
          >
            {dadosIntervaladoAluno.fase === "trabalho"
              ? "🔥 TRABALHO"
              : "💤 DESCANSO"}
          </p>

          <p className="mt-3 text-6xl font-black tracking-tight text-white">
            {String(
              Math.floor(
                dadosIntervaladoAluno.tempoRestanteFase / 60
              )
            ).padStart(2, "0")}
            :
            {String(
              dadosIntervaladoAluno.tempoRestanteFase % 60
            ).padStart(2, "0")}
          </p>

          <p className="mt-2 text-xs font-black tracking-widest text-zinc-400">
            {dadosIntervaladoAluno.fase === "trabalho"
              ? "TEMPO DE TRABALHO"
              : "TEMPO DE DESCANSO"}
          </p>

          <p className="mt-4 text-sm font-bold text-zinc-400">
            TEMPO TOTAL: {tempoFormatado}
          </p>
        </>
      ) : (
        <>
          <p className="text-xs font-black tracking-widest text-lime-400">
            AULA EM ANDAMENTO
          </p>

          <p className="mt-3 text-6xl font-black tracking-tight text-white">
            {tempoFormatado}
          </p>

          <p className="mt-2 text-xs font-black tracking-widest text-lime-400">
            ● EM ANDAMENTO
          </p>
        </>
      )}
    </div>
  ) : cronometroAula.status === "pausado" ? (
    <div className="rounded-3xl border border-yellow-500/40 bg-yellow-500/10 p-5 text-center">
      <p className="text-xs font-black tracking-widest text-yellow-400">
        CRONÔMETRO DA AULA
      </p>

      <p className="mt-3 text-6xl font-black tracking-tight text-white">
        {tempoFormatado}
      </p>

      <p className="mt-2 text-xs font-black tracking-widest text-yellow-400">
        ⏸ PAUSADO
      </p>

      <p className="mt-3 text-sm text-zinc-400">
        Aguarde o professor retomar o cronômetro.
      </p>
    </div>
  ) : cronometroAula.status === "finalizado" ? (
    <div className="rounded-3xl border border-zinc-700 bg-zinc-900 p-5 text-center">
      <p className="text-xs font-black tracking-widest text-zinc-500">
        CRONÔMETRO DA AULA
      </p>

      <p className="mt-3 text-2xl font-black text-white">
        TREINO ENCERRADO
      </p>

      <p className="mt-2 text-sm text-zinc-400">
        O tempo da aula chegou ao fim.
      </p>
    </div>
  ) : (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 text-center">
      <p className="text-xs font-black tracking-widest text-zinc-500">
        CRONÔMETRO DA AULA
      </p>

      <p className="mt-3 text-sm text-zinc-400">
        Aguardando início do cronômetro
      </p>
    </div>
  )}
</div>
<div className="mt-8">
  <p className="mb-4 text-sm font-black tracking-widest text-zinc-500">
    WORKOUT
  </p>

  {exercicios.length === 0 ? (
    <div className="rounded-3xl border border-zinc-800 p-6 text-center text-sm text-zinc-500">
      Este treino ainda não possui exercícios.
    </div>
  ) : (
    <div className="space-y-3">
      {exercicios.map((exercicio) => {
        const feito = concluidos.includes(exercicio.id);

        return (
          <button
            key={exercicio.id}
            onClick={() => marcarExercicio(exercicio.id)}
            className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
              feito
                ? "border-lime-400/30 bg-lime-400/10"
                : "border-zinc-800 bg-zinc-900"
            }`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                feito
                  ? "border-lime-400 bg-lime-400 text-black"
                  : "border-zinc-600"
              }`}
            >
              {feito && "✓"}
            </div>

            <span
              className={`font-semibold ${
                feito
                  ? "text-zinc-500 line-through"
                  : "text-white"
              }`}
            >
              {exercicio.nome}
            </span>
          </button>
        );
      })}
    </div>
  )}
</div>
  </section>
)}
{abaAluno === "aulas" && (
  <section className="mt-10">
  <p className="mb-4 text-sm font-bold tracking-widest text-zinc-500">
    PRÓXIMAS AULAS
  </p>

  {aulas.length === 0 ? (
    <div className="rounded-3xl border border-zinc-800 p-6 text-center text-zinc-500">
      Nenhuma aula disponível no momento.
    </div>
  ) : (
    <div className="space-y-3">
      {aulasOrganizadas.map((aula, index) => {
  const checkinExistente = checkins.find(
    (checkin) => checkin.aula_id === aula.id
  );
  const temTreino = aula.treino_id !== null;

  const ocupadas =
  contagemCheckins.find((item) => item.aula_id === aula.id)?.total || 0;

const restantes = Math.max(aula.vagas - ocupadas, 0);

const lotada = ocupadas >= aula.vagas;

const mostrarTituloMinha =
  aula.grupo === "minha" &&
  index === 0;

const mostrarTituloOutras =
  aula.grupo === "outras" &&
  (
    index === 0 ||
    aulasOrganizadas[index - 1]?.grupo !== "outras"
  );

  return (
 <div key={aula.id}>
    {mostrarTituloMinha && (
      <p className="mb-3 mt-2 text-sm font-black tracking-widest text-lime-400">
        ✓ MINHA AULA
      </p>
    )}

    {mostrarTituloOutras && (
      <p className="mb-3 mt-8 text-sm font-black tracking-widest text-zinc-500">
        OUTRAS AULAS
      </p>
    )}

    <div
      className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
    >
          <p className="font-black text-white">
            {aula.data.split("-").reverse().join("/")}
          </p>

          <p className="mt-2 text-sm text-zinc-400">
            🕒 {aula.horario.slice(0, 5)}
          </p>

          <p className="mt-1 text-sm text-zinc-400">
            📍 {aula.local || "Local a definir"}
          </p>

         <p className="mt-1 text-sm text-zinc-400">
  👥 {ocupadas}/{aula.vagas} vagas ocupadas
</p>

<p className="mt-1 text-sm text-zinc-500">
  {lotada
    ? "Aula lotada"
    : `${restantes} ${restantes === 1 ? "vaga restante" : "vagas restantes"}`}
</p>
 <button
  onClick={async () => {
    if (aulaListaAberta === aula.id) {
      setAulaListaAberta(null);
      return;
    }

    await carregarAlunosDaAula(aula.id);
    setAulaListaAberta(aula.id);
  }}
  disabled={ocupadas === 0}
  className={`mt-4 w-full rounded-2xl border p-3 text-sm font-black ${
    ocupadas === 0
      ? "cursor-not-allowed border-zinc-800 text-zinc-600"
      : "border-zinc-700 text-zinc-300"
  }`}
>
  {ocupadas === 0
    ? "👥 NINGUÉM CONFIRMADO AINDA"
    : aulaListaAberta === aula.id
    ? "👥 OCULTAR QUEM VAI ▲"
    : `👥 VER QUEM VAI (${ocupadas}) ▼`}
</button>

{aulaListaAberta === aula.id && (
  <div className="mt-3 rounded-2xl border border-zinc-800 bg-black/30 p-4">
    {alunosInscritos.length === 0 ? (
      <p className="text-sm text-zinc-500">
        Nenhum aluno confirmado ainda.
      </p>
    ) : (
      <div className="space-y-2">
        {alunosInscritos.map((aluno) => (
          <div
            key={aluno.id}
            className="flex items-center gap-2 text-sm text-zinc-300"
          >
            <span>•</span>

            <span className="font-semibold">
              {aluno.nome}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
)}
         {checkinExistente ? (
  <div className="mt-4 space-y-2">
    <div className="w-full rounded-2xl bg-lime-400/10 p-4 text-center font-black text-lime-400">
      ✅ CHECK-IN CONFIRMADO
    </div>

    <button
      onClick={() => cancelarCheckin(aula.id)}
      className="w-full rounded-2xl border border-red-500/40 p-3 text-sm font-black text-red-400"
    >
      CANCELAR CHECK-IN
    </button>
    {checkinExistente && temTreino && (
  <button
  onClick={async () => {
  setAulaSelecionada(aula.id);

  await carregarTreinoDaAula(aula.treino_id);
  await carregarCronometroAula(aula.id);
}}
    className="mt-3 w-full rounded-2xl border border-lime-400 p-3 text-sm font-black text-lime-400"
  >
    VER TREINO DA AULA
  </button>
)}
  </div>
) : (
 <button
  onClick={() => fazerCheckin(aula.id)}
  disabled={
    statusFinanceiro === "inadimplente" ||
    (lotada && !checkinExistente)
  }
  className={`mt-4 w-full rounded-2xl p-4 font-black ${
    statusFinanceiro === "inadimplente" || lotada
      ? "cursor-not-allowed bg-zinc-700 text-zinc-400"
      : "bg-lime-400 text-black"
  }`}
>
  {statusFinanceiro === "inadimplente"
    ? "CHECK-IN BLOQUEADO"
    : lotada
    ? "AULA LOTADA"
    : "FAZER CHECK-IN"}
</button>
)}
      </div>
    </div>
  );
})}
    </div>
  )}
</section>
)}

            {progresso === 100 && exercicios.length > 0 && (
              <div className="mt-8 rounded-3xl bg-lime-400 p-6 text-center text-black">

                <p className="text-3xl">🏁</p>

                <p className="mt-2 text-xl font-black">
                  TREINO CONCLUÍDO!
                </p>

              </div>
            )}

          </>
        )}

      </div>

{!modoGestao && abaAluno === "recordes" && (
  <section className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
    <div>
  <p className="text-4xl text-center">🏆</p>

  <h2 className="mt-3 text-center text-2xl font-black text-white">
    MEUS RECORDES
  </h2>

  <div className="mt-6 rounded-2xl bg-black p-4">
    <label className="text-xs font-bold text-zinc-500">
      MODALIDADE
    </label>

    <select
      value={modalidadeRecorde}
      onChange={(e) => setModalidadeRecorde(e.target.value)}
      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
    >
    <option value="">Selecione</option>

<option value="1km_corrida">🏃 1 KM CORRIDA</option>
<option value="5km_corrida">🏃 5 KM CORRIDA</option>

<option value="1000m_skierg">🎿 1000 M SKIERG</option>
<option value="sled_push">🛷 SLED PUSH</option>
<option value="sled_pull">🪢 SLED PULL</option>
<option value="burpee_broad_jump">🐸 BURPEE BROAD JUMP</option>
<option value="1000m_remo">🚣 1000 M REMO</option>
<option value="farmers_carry">🧳 FARMERS CARRY</option>
<option value="sandbag_lunges">🎒 SANDBAG LUNGES</option>
<option value="wall_balls">⚫ WALL BALLS</option>
<option value="hyrox_completo">🏆 HYROX COMPLETO</option>
<option value="personalizado">➕ OUTRO / PERSONALIZADO</option>
    </select>
    {modalidadeRecorde === "personalizado" && (
  <>
    <label className="mt-4 block text-xs font-bold text-zinc-500">
      NOME DO RECORDE
    </label>

    <input
      type="text"
      value={nomeRecordePersonalizado}
      onChange={(e) => setNomeRecordePersonalizado(e.target.value)}
      placeholder="Ex: 50 Wall Balls, 2 km Bike, Fran..."
      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
    />
    <label className="mt-4 block text-xs font-bold text-zinc-500">
  MELHOR RESULTADO
</label>

<select
  value={criterioRecorde}
  onChange={(e) =>
    setCriterioRecorde(e.target.value as "menor" | "maior")
  }
  className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
>
  <option value="maior">MAIOR É MELHOR</option>
  <option value="menor">MENOR É MELHOR</option>
</select>
  </>
)}

{modalidadeRecorde === "hyrox_completo" ? (
  <>
    <label className="mt-4 block text-xs font-bold text-zinc-500">
      TEMPO
    </label>

    <div className="mt-2 grid grid-cols-3 gap-2">
      <input
        type="number"
        min="0"
        placeholder="Horas"
        value={horasRecorde}
        onChange={(e) => setHorasRecorde(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
      />

      <input
        type="number"
        min="0"
        max="59"
        placeholder="Minutos"
        value={minutosRecorde}
        onChange={(e) => setMinutosRecorde(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
      />

      <input
        type="number"
        min="0"
        max="59"
        placeholder="Segundos"
        value={segundosRecorde}
        onChange={(e) => setSegundosRecorde(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
      />
    </div>
  </>
) : [
  "1km_corrida",
  "5km_corrida",
  "1000m_skierg",
  "sled_push",
  "sled_pull",
  "burpee_broad_jump",
  "1000m_remo",
  "farmers_carry",
  "sandbag_lunges",
  "wall_balls",
].includes(modalidadeRecorde) ? (
  <>
    <label className="mt-4 block text-xs font-bold text-zinc-500">
      TEMPO
    </label>

    <div className="mt-2 grid grid-cols-2 gap-2">
      <input
        type="number"
        min="0"
        placeholder="Minutos"
        value={minutosRecorde}
        onChange={(e) => setMinutosRecorde(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
      />

      <input
        type="number"
        min="0"
        max="59"
        placeholder="Segundos"
        value={segundosRecorde}
        onChange={(e) => setSegundosRecorde(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
      />
    </div>
  </>
) : (
  <>
    <label className="mt-4 block text-xs font-bold text-zinc-500">
      CARGA
    </label>

    <input
      type="number"
      step="0.5"
      value={valorRecorde}
      onChange={(e) => setValorRecorde(e.target.value)}
      placeholder="Kg"
      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
    />
  </>
)}
{modalidadeRecorde === "personalizado" && (
  <>
    <label className="mt-4 block text-xs font-bold text-zinc-500">
      UNIDADE
    </label>

    <select
      value={unidadeRecorde}
      onChange={(e) => setUnidadeRecorde(e.target.value)}
      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
    >
      <option value="">Selecione</option>
<option value="segundos">TEMPO</option>
<option value="kg">KG</option>
<option value="reps">REPETIÇÕES</option>
<option value="metros">METROS</option>
<option value="km">KM</option>
<option value="calorias">CALORIAS</option>
    </select>
      </>
)}

    <label className="mt-4 block text-xs font-bold text-zinc-500">
      DATA
    </label>

    <input
      type="date"
      value={dataRecorde}
      onChange={(e) => setDataRecorde(e.target.value)}
      className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3"
    />

    <button
      onClick={salvarRecorde}
      className="mt-5 w-full rounded-xl bg-lime-400 p-3 font-black text-black"
    >
      SALVAR RECORDE
    </button>
  </div>
  <div className="mt-6">
  <p className="mb-3 text-sm font-black text-zinc-400">
    🏆 MELHORES MARCAS
  </p>

  {melhoresRecordes.length === 0 ? (
    <div className="rounded-2xl border border-zinc-800 p-4 text-center text-sm text-zinc-500">
      Nenhum recorde cadastrado ainda.
    </div>
  ) : (
    <div className="space-y-3">
      {melhoresRecordes.map((recorde) => (
       <div
  key={recorde.id}
  onClick={() => setModalidadeSelecionada(recorde.modalidade)}
  className="group cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-lime-400/40 hover:bg-zinc-900"
>
         <div className="flex items-center justify-between gap-3">
  <div className="flex items-center gap-2">
    <span className="text-xl">🏆</span>

    <p className="text-sm font-black text-white">
      {nomeModalidade(recorde.modalidade)}
    </p>
  </div>

  <span className="text-xl font-black text-zinc-600 transition group-hover:text-lime-400">
    ›
  </span>
</div>

          <div className="mt-4">
  <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
    MELHOR MARCA
  </p>

  <p className="mt-1 text-3xl font-black text-lime-400">
    {formatarRecorde(recorde)}
  </p>
</div>

<div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-800 pt-3">
  <p className="text-xs text-zinc-500">
    {recorde.data.split("-").reverse().join("/")}
  </p>

  <p className="text-xs font-bold text-zinc-500">
    TOQUE PARA VER EVOLUÇÃO
  </p>
</div>

          <p className="mt-1 text-xs text-zinc-500">
            {recorde.data.split("-").reverse().join("/")}
          </p>
          <button
onClick={(e) => {
  e.stopPropagation();
  excluirRecorde(recorde.id);
}}
  className="mt-3 w-full rounded-xl border border-red-500/40 p-2 text-xs font-black text-red-400"
>
  EXCLUIR
</button>
        </div>
      ))}
    </div>
  )}
</div>
  <div className="mt-6">
  <p className="mb-3 text-sm font-black text-zinc-400">
    HISTÓRICO DE RECORDES
  </p>

  {modalidadeSelecionada && (
  <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-4">
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
  <span className="text-lg">📈</span>

  <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
    EVOLUÇÃO
  </p>
</div>

       <p className="mt-2 text-xl font-black text-white">
  {nomeModalidade(modalidadeSelecionada)}
</p>
        {recordeSelecionado && (
  <div className="mt-4 rounded-2xl border border-lime-400/30 bg-lime-400/10 p-4">
    <p className="text-xs font-black uppercase tracking-wider text-lime-400">
  🏆 PR ATUAL
</p>
    <p className="mt-1 text-3xl font-black text-lime-400">
      {formatarRecorde(recordeSelecionado)}
    </p>
    {dadosGrafico.length > 1 && (
 <>
  <div className="mt-4 grid grid-cols-2 gap-2">
    <div className="rounded-xl bg-black/30 p-3">
      <p className="text-xs font-bold text-zinc-500">
        EVOLUÇÃO
      </p>

      <p className="mt-1 text-lg font-black text-lime-400">
        +{percentualEvolucao.toFixed(1)}%
      </p>
    </div>

    <div className="rounded-xl bg-black/30 p-3">
      <p className="text-xs font-bold text-zinc-500">
        DIFERENÇA
      </p>

      <p className="mt-1 text-lg font-black text-white">
        {formatarValorGrafico(diferencaEvolucao, unidadeGrafico)}
      </p>
    </div>
  </div>
</>
)}
</div>
)}
        {dadosGrafico.length > 1 && (
  <div className="mt-4 h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={dadosGrafico}>
        <XAxis
          dataKey="data"
          tick={{ fontSize: 10 }}
        />

        <YAxis
  tick={{ fontSize: 10 }}
 tickFormatter={(valor) =>
  formatarValorGrafico(Number(valor), unidadeGrafico)
}
/>

        <Tooltip
 formatter={(valor) => [
  formatarValorGrafico(Number(valor), unidadeGrafico),
  "Resultado",
]}
/>

        <Line
  type="monotone"
  dataKey="valor"
  strokeWidth={3}
  dot={(props) => {
    const { cx, cy, payload } = props;

    const ehPR =
      recordeSelecionado &&
      payload.id === recordeSelecionado.id;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={ehPR ? 7 : 4}
        fill={ehPR ? "#a3e635" : "#71717a"}
        stroke={ehPR ? "#d9f99d" : "#27272a"}
        strokeWidth={ehPR ? 3 : 1}
      />
    );
  }}
/>
      </LineChart>
    </ResponsiveContainer>
  </div>
)}
 <button
        onClick={() => setModalidadeSelecionada(null)}
        className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-black text-zinc-400"
      >
        FECHAR
      </button>
      </div>

    <div className="mt-4 space-y-2">
      {recordes
  .filter(
    (recorde) =>
      recorde.modalidade === modalidadeSelecionada
  )
  .sort(
    (a, b) =>
      new Date(a.data).getTime() - new Date(b.data).getTime()
  )
  .map((recorde) => (
          <div
            key={recorde.id}
            className="rounded-xl bg-zinc-900 p-3"
          >
            <p className="font-black text-lime-400">
              {formatarRecorde(recorde)}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {recorde.data.split("-").reverse().join("/")}
            </p>
          </div>
        ))}
    </div>
    </div>
  </div>
)}

  {recordes.length === 0 ? (
    <div className="rounded-2xl border border-zinc-800 p-4 text-center text-sm text-zinc-500">
      Nenhum recorde cadastrado ainda.
    </div>
  ) : (
    <div className="space-y-3">
      {recordes.map((recorde) => (
        <div
          key={recorde.id}
          className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
        >
          <p className="font-black text-white">
            {recorde.modalidade
              .replaceAll("_", " ")
              .toUpperCase()}
          </p>

          <p className="mt-1 text-xl font-black text-lime-400">
          {formatarRecorde(recorde)}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            {recorde.data.split("-").reverse().join("/")}
          </p>
        </div>
      ))}
    </div>
  )}
</div>
</div>
  </section>
)}

{/* BARRA DE NAVEGAÇÃO DO ALUNO */}
{!modoGestao && (
  <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-black/95 px-4 py-3 backdrop-blur">
    <div className="mx-auto grid max-w-md grid-cols-3 gap-2">

      <button
        onClick={() => setAbaAluno("treino")}
        className={`rounded-2xl p-3 text-xs font-black ${
          abaAluno === "treino"
            ? "bg-lime-400 text-black"
            : "bg-zinc-900 text-zinc-400"
        }`}
      >
        🏠 INÍCIO
      </button>

      <button
        onClick={() => setAbaAluno("aulas")}
        className={`rounded-2xl p-3 text-xs font-black ${
          abaAluno === "aulas"
            ? "bg-lime-400 text-black"
            : "bg-zinc-900 text-zinc-400"
        }`}
      >
        📅 AULAS
      </button>

      <button
        onClick={async () => {
  setAbaAluno("recordes");
  await carregarRecordes();
}}
        className={`rounded-2xl p-3 text-xs font-black ${
          abaAluno === "recordes"
            ? "bg-lime-400 text-black"
            : "bg-zinc-900 text-zinc-400"
        }`}
      >
        🏆 RECORDES
      </button>

    </div>
  </div>
)}

</main>
  );
}