export const formatTime = (value: number) =>
  new Date(value).toLocaleTimeString();

export const formatValue = (value: unknown) => {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "None";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
};
