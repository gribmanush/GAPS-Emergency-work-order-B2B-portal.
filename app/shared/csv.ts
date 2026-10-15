export function downloadCsv(name: string, data: unknown[]) {
  if (!data.length) return;
  const rows = data.map(x => Array.isArray(x) ? x : Object.values(x as Record<string, unknown>));
  const header = Object.keys(data[0] as object);
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
