export type SuratData = Record<string, string>;

export function parseSuratData(value: unknown): SuratData {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, field]) =>
      typeof field === "string" || typeof field === "number"
        ? [[key, String(field)]]
        : [],
    ),
  );
}
