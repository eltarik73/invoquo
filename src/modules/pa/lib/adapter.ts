import type { PlatformAdapter } from "./interface";
import { PennylaneAdapter } from "./pennylane";

const adapters: Record<string, PlatformAdapter> = {
  pennylane: new PennylaneAdapter(),
};

export function getAdapter(provider: string): PlatformAdapter {
  const adapter = adapters[provider];
  if (!adapter) {
    throw new Error(`Unknown PA provider: ${provider}`);
  }
  return adapter;
}

export function getDefaultAdapter(): PlatformAdapter {
  return adapters.pennylane;
}
