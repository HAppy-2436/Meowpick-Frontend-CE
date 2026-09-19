/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_SERVER_HOST_PORT: string;
    readonly VITE_TOKEN_NAME: string;
  }
}

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
