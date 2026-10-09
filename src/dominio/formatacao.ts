const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const numero = new Intl.NumberFormat('pt-BR')
const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

/** Valores trafegam em centavos (inteiro) para não ter erro de arredondamento de float. */
export function formatarCentavos(centavos: number): string {
  return moeda.format(centavos / 100)
}

export function formatarNumero(valor: number): string {
  return numero.format(valor)
}

export function formatarDataHora(iso: string): string {
  return dataHora.format(new Date(iso))
}

export function formatarDuracao(segundos: number | null): string {
  if (segundos === null) return '—'
  if (segundos < 60) return `${Math.round(segundos)} s`
  const minutos = Math.floor(segundos / 60)
  return `${minutos} min ${Math.round(segundos % 60)} s`
}

export function tempoAtras(iso: string, agora: Date): string {
  const minutos = Math.round((agora.getTime() - new Date(iso).getTime()) / 60_000)
  if (minutos < 1) return 'agora'
  if (minutos < 60) return `há ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 48) return `há ${horas} h`
  return `há ${Math.floor(horas / 24)} dias`
}

/** Data local no formato AAAA-MM-DD (o que a API e o <input type="date"> esperam). */
export function dataLocalIso(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mes}-${dia}`
}
