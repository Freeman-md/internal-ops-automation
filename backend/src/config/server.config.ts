import "dotenv/config";

const DEFAULT_PORT = 3000;

function readNumber(value: string | undefined, fallback: number) {
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const SERVER_PORT = readNumber(process.env.PORT, DEFAULT_PORT);
export const SERVER_HOST = process.env.HOST ?? "0.0.0.0";

const DEFAULT_CORS_ORIGINS = "http://localhost:5173,http://0.0.0.0:5173";

export const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? DEFAULT_CORS_ORIGINS)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
