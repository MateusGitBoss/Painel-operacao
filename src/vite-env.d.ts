/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COLETOR_API_URL?: string
  readonly VITE_VENDAS_API_URL?: string
  readonly VITE_MODO_DEMO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
