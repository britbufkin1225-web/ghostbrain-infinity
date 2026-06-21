export interface ImportExportAction {
  id: string;
  label: string;
  direction: "import" | "export";
  enabled: false;
}

export const importExportActions: ImportExportAction[] = [
  {
    id: "import-vault",
    label: "Import Vault",
    direction: "import",
    enabled: false,
  },
  {
    id: "export-snapshot",
    label: "Export Snapshot",
    direction: "export",
    enabled: false,
  },
];
