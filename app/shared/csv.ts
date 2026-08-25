export function downloadCsv(name: string, data: unknown[]) {
  const rows = data.map(x => Array.isArray(x) ? x : Object.values(x as Record<string, unknown>));
  const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
