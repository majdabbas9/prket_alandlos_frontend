/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_URL?: string;
  /** Public R2 domain (e.g. https://images.majdabbas.dev); unset = images via the API */
  readonly VITE_IMAGES_URL?: string;
}
