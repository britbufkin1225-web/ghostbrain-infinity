import type { ModelRecord, SourceRecord } from "../../types";

export interface RegistrySnapshot {
  sources: SourceRecord[];
  models: ModelRecord[];
}
