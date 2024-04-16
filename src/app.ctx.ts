import { createContextId } from "@builder.io/qwik";
import type { NoSerialize } from "@builder.io/qwik";

export enum BlockableCaches {
  PID_ANALYZER = "PID_ANALYZER",
}

export interface AppContextState {
  showPageHeader: boolean;
  isPreviewing: boolean;
  serviceWorker: NoSerialize<ServiceWorker | undefined>;
  unblockedCaches: Array<BlockableCaches>;
}

export const AppContext = createContextId<AppContextState>("app");
