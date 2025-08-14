interface ImportMetaEnv {
  readonly VITE_SOCKET_SERVER_URL: string
  readonly VITE_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}