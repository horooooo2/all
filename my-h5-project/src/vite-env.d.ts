/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    readonly VITE_WS_BASE_URL: string
    readonly VITE_OSS_BASE_URL: string
    readonly VITE_H5_SHARE_BASE_URL: string
    readonly VITE_API_ACCEPT_LANGUAGE: string
    readonly VITE_APP_DEVICE: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
