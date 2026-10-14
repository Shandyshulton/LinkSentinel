/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL dasar backend di produksi. Kosong saat dev (pakai proxy Vite). */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
