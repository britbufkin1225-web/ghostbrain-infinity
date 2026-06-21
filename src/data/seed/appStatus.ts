import type { AppStatus } from "../../types";
import { graphNodeSeeds } from "./graph";
import { modelSeeds } from "./models";
import { sourceSeeds } from "./sources";

export const appStatusSeed: AppStatus = {
  mode: "development",
  localStorage: "ready",
  registryCount: sourceSeeds.length + modelSeeds.length,
  graphNodeCount: graphNodeSeeds.length,
  activeFilters: 0,
};
