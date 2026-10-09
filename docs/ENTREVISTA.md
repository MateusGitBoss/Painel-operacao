# Roteiro de estudo para entrevista

## 1. Explique o projeto em 1 minuto

"É um painel em React com TypeScript que consome as APIs dos meus outros dois projetos. Mostra a saúde de cada coletor com uma regra simples: sucesso, parcial, falha ou atrasado, se passou mais de 26 horas sem rodar. Mostra também as vendas do dia com indicadores, gráfico por hora e tabela por produto. Uso TanStack Query para buscar e atualizar os dados a cada minuto, e a fonte de dados é injetada por contexto, então sem as APIs no ar o painel roda com dados de demonstração e os testes usam uma fonte falsa. As regras ficam em funções puras fora dos componentes."

## 2. Perguntas técnicas

**Por que TanStack Query e não `useEffect` + `fetch`?**
Com `useEffect` eu teria que tratar na mão: carregando, erro, cancelar requisição quando o componente sai da tela, evitar resposta antiga sobrescrever a nova, cache entre telas, nova tentativa e atualização periódica. O TanStack Query faz isso e eu só declaro `queryKey` e `queryFn`. → `src/dados/consultas.ts`

**O que é a `queryKey`?**
A identidade do dado no cache. `['resumo-vendas', dia]`: quando o dia muda, a chave muda e ele busca de novo; voltar para um dia já visto usa o cache.

**O que é Context e por que você usou?**
Uma forma de passar um valor para toda a árvore de componentes sem repassar prop por prop. Usei para injetar a fonte de dados (API ou demo) e o relógio. Nos testes eu passo uma fonte falsa e um relógio fixo, então o teste é determinístico. → `src/dados/contexto.ts`

**Por que o relógio é injetado?**
A regra de "atrasado" depende da hora atual. Se eu usar `new Date()` direto, o teste passa hoje e quebra amanhã.

**Como você testa componentes?**
Testing Library: renderizo o componente e procuro o que o usuário vê, por papel e texto (`getByRole('region', { name: 'Vendas do dia' })`), em vez de classe CSS ou estrutura interna. Clico com `userEvent`. Se eu refatorar o componente sem mudar o que aparece, o teste continua passando.

**O que significa TypeScript `strict`?**
Ativa checagens como `strictNullChecks`: um valor que pode ser `null` precisa ser tratado antes de usar. Por isso o `main.tsx` verifica se o `#root` existe em vez de usar `!`.

**Por que não colocar o token da API no front?**
Tudo que vai para o navegador é público: qualquer um abre o DevTools e vê. Variável `VITE_` é embutida no JavaScript no build. Por isso o painel só usa rotas sem token e com dados agregados.

**O que é CORS e por que precisa configurar?**
O navegador bloqueia uma página de um domínio de ler respostas de outro domínio, a menos que o servidor diga que aceita (`Access-Control-Allow-Origin`). O painel na Vercel chama APIs no Railway, domínios diferentes, então as APIs precisam liberar a origem do painel.

**Por que dinheiro em centavos?**
`0.1 + 0.2` dá `0.30000000000000004` em ponto flutuante. Com inteiros em centavos a soma é exata; só divido por 100 para exibir com `Intl.NumberFormat`.

**Como o painel avisa que a API caiu?**
`buscarJson` tem tempo limite de 10 s (`AbortSignal.timeout`) e transforma erro de rede, tempo esgotado e status HTTP em mensagem legível. O componente mostra a mensagem com um botão "Tentar de novo" que chama `refetch`.

**O que você faria se tivesse mais tempo?**
Atualização em tempo real (SSE no webhook-vendas), carregar o Recharts sob demanda para diminuir o bundle, e autenticação se o painel precisar mostrar dado de cliente.

## 3. Para treinar em voz alta

1. Siga o caminho de um clique no nome "livros" até a chamada `GET /execucoes?fonte=livros`.
2. Explique por que um coletor com último status "sucesso" pode aparecer como "Atrasada".
3. Abra `App.test.tsx` e explique o teste de erro com "Tentar de novo".
