export type RegistryEntryStatus = "enabled" | "disabled" | "error" | "unknown";
export type ModelRegistryEntryStatus = RegistryEntryStatus | "mock";
export type RegistryPrivacy = "LocalOnly" | "External" | "Unknown";

export type SourceRegistryEntry = {
  id: string;
  name: string;
  category: string;
  type: string;
  status: RegistryEntryStatus;
  privacy: RegistryPrivacy;
  tags: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type ModelRegistryEntry = {
  id: string;
  name: string;
  provider: string;
  category: string;
  status: ModelRegistryEntryStatus;
  localOnly: boolean;
  endpoint?: string;
  tags: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
};
