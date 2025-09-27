/// <reference types="vite/client" />
declare const REACT_APP_DEPLOY_ENV: string
declare const LATEST_COMMIT_HASH: string

interface ImportMetaEnv {
  readonly VITE_UNSPLASH_ACCESS_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
