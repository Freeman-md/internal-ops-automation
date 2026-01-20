import express from "express";
import { SERVER_HOST, SERVER_PORT } from "@/config/server.config";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.path });
});

app.listen(SERVER_PORT, SERVER_HOST, () => {
  console.log(`[API] listening on http://${SERVER_HOST}:${SERVER_PORT}`);
});
