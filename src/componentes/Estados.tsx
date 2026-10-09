export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
  return (
    <p className="estado" role="status">
      {texto}
    </p>
  )
}

export function MensagemErro({ erro, tentarDeNovo }: { erro: Error; tentarDeNovo: () => void }) {
  return (
    <div className="estado estado-erro" role="alert">
      <p>{erro.message}</p>
      <button type="button" onClick={tentarDeNovo}>
        Tentar de novo
      </button>
    </div>
  )
}
