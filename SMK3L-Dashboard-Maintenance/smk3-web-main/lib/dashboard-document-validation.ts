const documentTypes = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
} as const;

export const MAX_DASHBOARD_DOCUMENT_BYTES = 20 * 1024 * 1024;

export type DashboardDocumentKind = "pdf" | "docx" | "jpg" | "png";
export type DashboardDocumentPayload = {
  activityId: string;
  name: string;
  kind: DashboardDocumentKind;
  contentType: string;
  source: "Unggahan" | "Template" | "Hasil gabungan";
  pages: number;
};

export function getDashboardDocumentType(name: string) {
  const extension = name.split(".").pop()?.toLowerCase();
  if (!extension || !(extension in documentTypes)) return null;
  const contentType = documentTypes[extension as keyof typeof documentTypes];
  const kind = extension === "jpeg" ? "jpg" : extension as DashboardDocumentKind;
  return { kind, contentType };
}

export function parseDashboardDocumentPayload(value: unknown): DashboardDocumentPayload | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  if (typeof input.activityId !== "string" || !/^[\w-]{1,80}$/.test(input.activityId)) return null;
  if (typeof input.name !== "string" || !input.name.trim() || input.name.length > 200 || /[\\/\r\n\0]/.test(input.name)) return null;
  if (typeof input.source !== "string" || !["Unggahan", "Template", "Hasil gabungan"].includes(input.source)) return null;
  if (!Number.isInteger(input.pages) || (input.pages as number) < 0 || (input.pages as number) > 10_000) return null;
  const type = getDashboardDocumentType(input.name);
  if (!type) return null;
  return {
    activityId: input.activityId,
    name: input.name.trim(),
    ...type,
    source: input.source as DashboardDocumentPayload["source"],
    pages: input.pages as number,
  };
}
