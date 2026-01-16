export const HEADED =
  process.env.HEADED === "1" || process.env.HEADED === "true";

export const WORKFLOW_RETRIES = Number(process.env.WORKFLOW_RETRIES ?? "1");

export const SLOWMO = Number(
  process.env.PLAYWRIGHT_SLOWMO ?? process.env.SLOWMO ?? "0"
);
