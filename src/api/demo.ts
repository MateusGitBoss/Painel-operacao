import { dataLocalIso } from '../dominio/formatacao'
import type { FonteDeDados } from './cliente'
import type { Execucao, Fonte, ResumoDia, StatusExecucao } from './tipos'

// Dados de demonstração: o painel funciona sem as APIs no ar (útil para quem visita o
// repositório). As datas são relativas ao momento atual para o painel sempre parecer "vivo".

const HORA = 3_600_000

function execucao(
  agora: Date,
  fonte: string,
  horasAtras: number,
  status: StatusExecucao,
  itens: number,
  erro: string | null = null,
): Execucao {
  const inicio = new Date(agora.getTime() - horasAtras * HORA)
  const duracao = status === 'falha' ? 12 : 48 + (itens % 17)
  return {
    id: `${fonte}-${horasAtras}`,
    fonte,
    iniciada_em: inicio.toISOString(),
    finalizada_em: new Date(inicio.getTime() + duracao * 1000).toISOString(),
    status,
    itens_coletados: itens,
    itens_invalidos: status === 'parcial' ? 14 : 0,
    mensagem_erro: erro,
    duracao_segundos: duracao,
  }
}

export function execucoesDemo(agora: Date): Execucao[] {
  return [
    execucao(agora, 'livros', 2, 'sucesso', 1000),
    execucao(
      agora,
      'citacoes',
      2.1,
      'parcial',
      86,
      'volume 14% abaixo da média dos últimos 7 dias',
    ),
    execucao(agora, 'livros', 26, 'sucesso', 1000),
    execucao(agora, 'citacoes', 26.1, 'sucesso', 100),
    execucao(agora, 'livros', 50, 'falha', 0, 'TimeoutError: página não respondeu em 30s'),
    execucao(agora, 'citacoes', 50.1, 'sucesso', 100),
    execucao(agora, 'livros', 74, 'sucesso', 998),
    execucao(agora, 'citacoes', 74.1, 'sucesso', 100),
  ]
}

export function fontesDemo(agora: Date): Fonte[] {
  const execs = execucoesDemo(agora)
  return ['citacoes', 'livros'].map((nome) => {
    const ultima = execs.find((e) => e.fonte === nome)
    return {
      nome,
      url_base: nome === 'livros' ? 'https://books.toscrape.com' : 'https://quotes.toscrape.com/js',
      ativa: true,
      ultima_execucao_id: ultima?.id ?? null,
      ultimo_status: ultima?.status ?? null,
      ultima_execucao_em: ultima?.iniciada_em ?? null,
      ultimos_itens: ultima?.itens_coletados ?? null,
      total_itens: nome === 'livros' ? 1000 : 100,
    }
  })
}

// Curva típica de venda de infoproduto: pico à noite, depois de uma live às 20h, e uma cauda
// de vendas na madrugada (assim o painel nunca abre vazio de manhã cedo)
const VENDAS_POR_HORA = [3, 2, 1, 0, 0, 0, 1, 2, 3, 4, 3, 5, 4, 3, 4, 5, 4, 6, 7, 9, 14, 11, 6, 3]
const PRODUTOS = [
  { produto: 'Curso Lojista Digital', preco: 49700, peso: 0.55 },
  { produto: 'Mentoria Social Commerce', preco: 99700, peso: 0.15 },
  { produto: 'E-book Lives que Vendem', preco: 4700, peso: 0.3 },
]

export function resumoDemo(dia: string, agora: Date): ResumoDia {
  const hoje = dataLocalIso(agora)
  const horaLimite = dia === hoje ? agora.getHours() : 23
  const porHora = VENDAS_POR_HORA.map((quantidade, hora) => {
    const q = hora <= horaLimite ? quantidade : 0
    return { hora, quantidade: q, valor_centavos: q * 38_900 }
  }).filter((h) => h.quantidade > 0)

  const total = porHora.reduce((soma, h) => soma + h.quantidade, 0)
  const porProduto = PRODUTOS.map(({ produto, preco, peso }) => {
    const quantidade = Math.round(total * peso)
    return { produto, quantidade, valor_centavos: quantidade * preco }
  }).filter((p) => p.quantidade > 0)
  const faturamento = porProduto.reduce((soma, p) => soma + p.valor_centavos, 0)
  const aprovadas = porProduto.reduce((soma, p) => soma + p.quantidade, 0)

  return {
    dia,
    vendas_aprovadas: aprovadas,
    faturamento_centavos: faturamento,
    reembolsos: Math.floor(aprovadas / 25),
    chargebacks: aprovadas > 60 ? 1 : 0,
    ticket_medio_centavos: aprovadas ? Math.round(faturamento / aprovadas) : 0,
    por_hora: porHora,
    por_produto: porProduto,
  }
}

export function criarClienteDemo(relogio: () => Date = () => new Date()): FonteDeDados {
  // Pequeno atraso para o estado "carregando" aparecer, como numa API de verdade
  const atraso = <T>(valor: T) => new Promise<T>((ok) => setTimeout(() => ok(valor), 150))
  return {
    fontes: () => atraso(fontesDemo(relogio())),
    execucoes: (fonte) =>
      atraso(execucoesDemo(relogio()).filter((e) => !fonte || e.fonte === fonte)),
    resumoVendas: (dia) => atraso(resumoDemo(dia, relogio())),
  }
}
