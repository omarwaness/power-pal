import type { WindowApi } from "../types/api";

declare global {
  interface Window {
    api: WindowApi;
  }
}

export {};