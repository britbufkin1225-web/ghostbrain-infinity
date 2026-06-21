import type { BrainStats, SyntheticCluster } from "../../types";

interface BrainActivityCounterProps {
  stats: BrainStats;
  clusters: SyntheticCluster[];
}

export function BrainActivityCounter({ stats, clusters }: BrainActivityCounterProps) {
  const hasRecords = stats.totalRecords > 0;

  return (
    <div className="brain-counter" tabIndex={0} aria-label={`Total Brain: ${stats.totalRecords} records`}>
      <span className="brain-counter__label">Brain Records</span>
      <strong className="brain-counter__value" key={stats.totalRecords}>
        {stats.totalRecords}
      </strong>
      <span className="brain-counter__delta">+{stats.recordsAddedSession} added</span>

      <div className="brain-counter__popover" role="status">
        {hasRecords ? (
          <>
            <div className="brain-counter__summary">
              <strong>Total Brain: {stats.totalRecords} Records</strong>
              <span>{stats.demoRecords} demo / {stats.importedRecords} imported / {stats.manualRecords} manual / {stats.registryRecords} registry</span>
              <span>{stats.indexedRecords} sources indexed / {stats.unindexedRecords} pending index</span>
            </div>
            <div className="brain-counter__breakdown">
              {clusters.map((cluster) => (
                <span key={cluster.id}>
                  {cluster.label}: <strong>{stats.recordsByCluster[cluster.id] ?? 0}</strong>
                </span>
              ))}
            </div>
            <div className="brain-counter__session">
              <strong>Source + Cluster Counts</strong>
              <span>Sources: {stats.totalSources}</span>
              <span>Enabled sources: {stats.enabledSources}</span>
              <span>Disabled sources: {stats.disabledSources}</span>
              <span>Clusters: {stats.totalClusters}</span>
              <span>Strong / Moderate / Weak: {stats.strongClusters} / {stats.moderateClusters} / {stats.weakClusters}</span>
            </div>
            <div className="brain-counter__session">
              <strong>Session Activity</strong>
              <span>+{stats.recordsAddedSession} records added</span>
              <span>-{stats.recordsRemovedSession} records removed</span>
              <span>+{stats.recordsImportedSession} records imported</span>
              <span>+{stats.modelsDiscoveredSession} models discovered</span>
              <span>+{stats.providersCheckedSession} providers checked</span>
              <span>+{stats.nodesCreatedSession} nodes created</span>
              <span>+{stats.edgesCreatedSession} edges created</span>
            </div>
            <div className="brain-counter__session">
              <strong>Model Telemetry</strong>
              <span>Providers: {stats.totalProviders}</span>
              <span>Online providers: {stats.onlineProviders}</span>
              <span>Offline providers: {stats.offlineProviders}</span>
              <span>Models: {stats.totalModels}</span>
              <span>Enabled models: {stats.enabledModels}</span>
              <span>Available models: {stats.availableModels}</span>
              <span>Disabled models: {stats.disabledModels}</span>
            </div>
            <div className="brain-counter__session">
              <strong>Graph Nodes</strong>
              {Object.entries(stats.graphNodesByType).map(([type, count]) => (
                <span key={type}>{type}: {count}</span>
              ))}
            </div>
          </>
        ) : (
          <div className="brain-counter__summary">
            <strong>Total Brain: 0 Records</strong>
            <span>No records loaded. Load Demo Vault or import sources to populate GhostBrain.</span>
          </div>
        )}
      </div>
    </div>
  );
}
