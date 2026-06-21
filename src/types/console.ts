import type { BrainRecord } from "./vault";

export type SearchResult = {
  record: BrainRecord;
  score: number;
  matchedFields: string[];
  matchedTags: string[];
  reason: string;
};

export type QueryConsoleSettings = {
  demoDataEnabled: boolean;
  selectedScope?: string;
};
