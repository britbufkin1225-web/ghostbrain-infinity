import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const fixtureDir = join(root, "src", "data", "fixtures");
const docsDir = join(fixtureDir, "documents");

mkdirSync(docsDir, { recursive: true });

const clusters = [
  {
    id: "cluster-ai-models",
    label: "AI Models",
    description: "Synthetic model registry, local runtime, embedding, and routing records.",
    category: "LLM",
    sourceType: "Manual",
    recordCount: 20,
    nodeCount: 5,
    edgeCount: 10,
    status: "Architecture Ready",
  },
  {
    id: "cluster-cybersecurity",
    label: "Cybersecurity",
    description: "Synthetic operations and security-monitoring notes for dashboard density testing.",
    category: "Research",
    sourceType: "Document",
    recordCount: 18,
    nodeCount: 5,
    edgeCount: 10,
    status: "Index Pending",
  },
  {
    id: "cluster-code-projects",
    label: "Code Projects",
    description: "Synthetic frontend, backend, repository, and helper architecture notes.",
    category: "Code",
    sourceType: "Code",
    recordCount: 18,
    nodeCount: 5,
    edgeCount: 10,
    status: "Architecture Ready",
  },
  {
    id: "cluster-research",
    label: "Research",
    description: "Synthetic research summaries, reliability notes, and RAG concepts.",
    category: "Research",
    sourceType: "Research",
    recordCount: 16,
    nodeCount: 5,
    edgeCount: 10,
    status: "Index Pending",
  },
  {
    id: "cluster-creative-assets",
    label: "Creative Assets",
    description: "Synthetic brand asset, mascot, texture, icon, and lockup usage notes.",
    category: "Image",
    sourceType: "Image",
    recordCount: 14,
    nodeCount: 5,
    edgeCount: 10,
    status: "Architecture Ready",
  },
  {
    id: "cluster-personal-knowledge",
    label: "Personal Knowledge",
    description: "Generic placeholder memory records with no private or personal content.",
    category: "Manual",
    sourceType: "Manual",
    recordCount: 14,
    nodeCount: 5,
    edgeCount: 10,
    status: "Local Stub",
  },
  {
    id: "cluster-voice-layer",
    label: "Voice Layer",
    description: "Synthetic future speech, audio, transcript, and voice-routing placeholders.",
    category: "Audio",
    sourceType: "Audio",
    recordCount: 14,
    nodeCount: 5,
    edgeCount: 10,
    status: "Adapter Pending",
  },
  {
    id: "cluster-import-export",
    label: "Import/Export",
    description: "Synthetic import, export, backup, replacement, and activity workflow records.",
    category: "Local",
    sourceType: "JSON",
    recordCount: 14,
    nodeCount: 5,
    edgeCount: 10,
    status: "Adapter Pending",
  },
];

const clusterTopics = {
  "cluster-ai-models": [
    "local LLM registry notes",
    "Ollama provider placeholder",
    "Qwen local model placeholder",
    "Llama local model placeholder",
    "embedding model placeholder",
    "cloud provider placeholder",
    "routing capability notes",
    "model context window note",
  ],
  "cluster-cybersecurity": [
    "SOC dashboard note",
    "network scan log sample",
    "suspicious login event sample",
    "firewall rule note",
    "endpoint monitoring note",
    "security event sample",
    "alert triage placeholder",
    "incident timeline sample",
  ],
  "cluster-code-projects": [
    "backend API note",
    "frontend dashboard note",
    "GitHub repo note",
    "component architecture note",
    "import export helper note",
    "localStorage persistence note",
    "TypeScript model note",
    "routing helper note",
  ],
  "cluster-research": [
    "article summary sample",
    "technical research note",
    "RAG architecture note",
    "memory indexing concept",
    "source reliability note",
    "retrieval confidence note",
    "chunking strategy sample",
    "citation placeholder",
  ],
  "cluster-creative-assets": [
    "logo asset note",
    "GhostBrain mascot note",
    "devdevbuilds brand note",
    "UI texture reference note",
    "header lockup note",
    "icon usage note",
    "watermark opacity note",
    "metallic control note",
  ],
  "cluster-personal-knowledge": [
    "sample journal-style note",
    "sample reminder note",
    "sample project idea note",
    "sample learning goal note",
    "sample reading queue note",
    "sample decision log note",
    "sample planning note",
    "sample habit placeholder",
  ],
  "cluster-voice-layer": [
    "speech-to-text placeholder",
    "text-to-speech placeholder",
    "voice model placeholder",
    "audio transcript sample",
    "future voice interaction note",
    "AudioInput category note",
    "AudioOutput category note",
    "voice routing status note",
  ],
  "cluster-import-export": [
    "imported markdown sample",
    "imported JSON sample",
    "imported code file sample",
    "import activity event",
    "export activity event",
    "replace with real import note",
    "demo reset note",
    "backup snapshot placeholder",
  ],
};

const sourceTypeByCluster = Object.fromEntries(clusters.map((cluster) => [cluster.id, cluster.sourceType]));
const categoryByCluster = Object.fromEntries(clusters.map((cluster) => [cluster.id, cluster.category]));
const privacyCycle = ["LocalOnly", "Sensitive", "CloudAllowed", "Public", "Unknown"];
const storageCycle = ["Local", "Local", "Hybrid", "CloudReference"];

const sources = clusters.flatMap((cluster) => {
  const topics = clusterTopics[cluster.id];
  return Array.from({ length: cluster.recordCount }, (_, index) => {
    const topic = topics[index % topics.length];
    const sequence = String(index + 1).padStart(2, "0");
    return {
      id: `${cluster.id}-source-${sequence}`,
      name: `${cluster.label} - ${titleCase(topic)} ${sequence}`,
      sourceType: sourceTypeByCluster[cluster.id],
      category: categoryByCluster[cluster.id],
      status: index % 11 === 0 ? "warning" : index % 5 === 0 ? "ready" : "idle",
      enabled: index % 9 !== 0,
      origin: "Synthetic Test Corpus",
      storageMode: storageCycle[index % storageCycle.length],
      privacyLevel: privacyCycle[index % privacyCycle.length],
      indexed: index % 4 === 0,
      lastImported: index % 3 === 0 ? "2026-06-20T00:00:00.000Z" : null,
      lastUpdated: `2026-06-${String(1 + (index % 20)).padStart(2, "0")}T12:00:00.000Z`,
      recordCount: 1 + (index % 7),
      tags: ["synthetic", "development-fixture", cluster.label.toLowerCase().replaceAll(" ", "-")],
      notes: `Synthetic development fixture record for ${cluster.label}. Safe to delete and replace with real imported data.`,
      description: `Sample Memory Record for ${cluster.label}: ${topic}. This is synthetic fixture content for clustering and dashboard testing.`,
      clusterId: cluster.id,
      fixtureKind: "Synthetic Test Corpus",
    };
  });
});

const models = [
  model("synthetic-qwen-local", "Qwen Local Demo", "Ollama placeholder", "Ollama", "LLM", true, true, false, ["chat", "summarize", "retrieve", "route"], "cluster-ai-models"),
  model("synthetic-llama-local", "Llama Local Demo", "Ollama placeholder", "Ollama", "LLM", true, true, false, ["chat", "summarize"], "cluster-ai-models"),
  model("synthetic-code-local", "Code Local Demo", "Local LLM placeholder", "Local LLM", "Code", true, true, false, ["codeAssist", "retrieve"], "cluster-code-projects"),
  model("synthetic-embedding-local", "Embedding Local Demo", "Local embedding placeholder", "Local LLM", "Embedding", false, true, false, ["embed", "retrieve"], "cluster-research"),
  model("synthetic-vision-cloud", "Vision Cloud Demo", "Cloud provider placeholder", "Gemini", "Vision", false, false, true, ["analyzeImage", "summarize"], "cluster-creative-assets"),
  model("synthetic-openai-compatible", "OpenAI-Compatible Demo", "OpenAI-compatible API", "OpenAI-compatible API", "LLM", false, false, true, ["chat", "summarize", "route"], "cluster-ai-models"),
  model("synthetic-research-cloud", "Research Cloud Demo", "Claude placeholder", "Claude", "Research", false, false, true, ["summarize", "retrieve"], "cluster-research"),
  model("synthetic-stt-local", "SpeechToText Local Demo", "Local audio placeholder", "Local LLM", "SpeechToText", false, true, false, ["transcribe"], "cluster-voice-layer"),
  model("synthetic-tts-local", "TextToSpeech Local Demo", "Local audio placeholder", "Local LLM", "TextToSpeech", false, true, false, ["speak"], "cluster-voice-layer"),
];

function model(id, name, provider, providerType, modelType, enabled, localOnly, requiresApiKey, capabilities, clusterId) {
  return {
    id,
    name,
    provider,
    providerType,
    modelType,
    category: modelType === "Code" ? "Code" : modelType === "Vision" ? "Image" : modelType === "Research" ? "Research" : modelType === "SpeechToText" || modelType === "TextToSpeech" ? "Audio" : "LLM",
    description: `${name} is a synthetic development fixture model record. It does not execute AI calls.`,
    status: enabled ? "idle" : requiresApiKey ? "warning" : "idle",
    enabled,
    localOnly,
    requiresApiKey,
    contextWindow: modelType === "Embedding" || modelType.includes("Speech") || modelType.includes("TextToSpeech") ? null : 32768,
    capabilities,
    tags: ["synthetic", localOnly ? "local-first" : "cloud-optional", enabled ? "enabled" : "disabled-by-default"],
    lastUsed: null,
    notes: requiresApiKey ? "API key required later. No key is stored in this demo corpus." : "Local registry fixture only. Adapter pending.",
    clusterId,
    fixtureKind: "Synthetic Test Corpus",
  };
}

const graphNodes = clusters.flatMap((cluster) =>
  Array.from({ length: cluster.nodeCount }, (_, index) => {
    const source = sources.find((record) => record.clusterId === cluster.id && record.id.endsWith(String(index + 1).padStart(2, "0")));
    return {
      id: `${cluster.id}-node-${index + 1}`,
      label: index === 0 ? cluster.label : titleCase(clusterTopics[cluster.id][index % clusterTopics[cluster.id].length]),
      category: cluster.category,
      status: index === 0 ? "ready" : index % 3 === 0 ? "warning" : "idle",
      clusterId: cluster.id,
      sourceId: source?.id,
    };
  }),
);

const graphEdges = clusters.flatMap((cluster) => {
  const nodes = graphNodes.filter((node) => node.clusterId === cluster.id);
  const edges = [];
  for (let i = 1; i < nodes.length; i += 1) {
    edges.push(edge(`${cluster.id}-edge-hub-${i}`, nodes[0].id, nodes[i].id, "clusters", cluster.id));
  }
  for (let i = 0; i < nodes.length; i += 1) {
    edges.push(edge(`${cluster.id}-edge-link-${i}`, nodes[i].id, nodes[(i + 1) % nodes.length].id, "relates", cluster.id));
  }
  return edges;
});

const activityEvents = Array.from({ length: 32 }, (_, index) => {
  const cluster = clusters[index % clusters.length];
  const statuses = ["ready", "idle", "warning"];
  const eventTypes = ["import event", "registry change", "graph update note", "index status note"];
  return {
    id: `synthetic-activity-${String(index + 1).padStart(2, "0")}`,
    title: `${cluster.label} ${titleCase(eventTypes[index % eventTypes.length])}`,
    description: `Synthetic Test Corpus activity for ${cluster.label}. This event is safe to delete with the demo vault.`,
    status: statuses[index % statuses.length],
    timestamp: `2026-06-${String(1 + (index % 20)).padStart(2, "0")}T${String(8 + (index % 10)).padStart(2, "0")}:00:00.000Z`,
    clusterId: cluster.id,
  };
});

const manifest = {
  datasetName: "GhostBrain Infinity Synthetic Test Corpus",
  datasetVersion: "0.1.0",
  recordCount: sources.length,
  modelCount: models.length,
  nodeCount: graphNodes.length,
  edgeCount: graphEdges.length,
  clusterCount: clusters.length,
  activityEventCount: activityEvents.length,
  createdFor: "Development clustering, filtering, graph, registry, activity, persistence, import/export, and future RAG architecture testing",
  isSynthetic: true,
  safeToDelete: true,
  replacementTarget: "Real imported user/project data",
  notes: "All records are synthetic development fixtures. No real personal data, credentials, private documents, or sensitive security incidents are included.",
};

writeJson("synthetic-sources.json", sources);
writeJson("synthetic-models.json", models);
writeJson("synthetic-graph-nodes.json", graphNodes);
writeJson("synthetic-graph-edges.json", graphEdges);
writeJson("synthetic-activity-events.json", activityEvents);
writeJson("synthetic-clusters.json", clusters);
writeJson("synthetic-manifest.json", manifest);

writeDoc("ai-model-routing-note.md", "AI Model Routing Note", "Synthetic note describing a local-first routing path from source metadata to a selected local model.");
writeDoc("cybersecurity-event-sample.md", "Cybersecurity Event Sample", "Synthetic security-monitoring note with generic event language and no real incident details.");
writeDoc("code-architecture-note.md", "Code Architecture Note", "Synthetic code-project memory note for dashboard architecture and helper boundaries.");
writeDoc("rag-memory-indexing-note.md", "RAG Memory Indexing Note", "Synthetic RAG planning note for parsing, chunking, embedding, retrieval, and source-linked responses.");
writeDoc("brand-asset-usage-note.md", "Brand Asset Usage Note", "Synthetic creative asset note for logo, watermark, mascot, and metallic UI reference usage.");

function writeJson(fileName, value) {
  writeFileSync(join(fixtureDir, fileName), `${JSON.stringify(value, null, 2)}\n`);
}

function writeDoc(fileName, title, body) {
  writeFileSync(
    join(docsDir, fileName),
    `# ${title}\n\n${body}\n\nThis is synthetic development fixture content for GhostBrain Infinity. It is safe to delete and replace with real imported data.\n`,
  );
}

function edge(id, sourceId, targetId, relationship, clusterId) {
  return { id, sourceId, targetId, relationship, clusterId };
}

function titleCase(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}
