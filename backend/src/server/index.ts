import express from "express";
import cors from "cors";
import { CORS_ORIGINS, SERVER_HOST, SERVER_PORT } from "@/config/server.config";
import triageRoutes from "@/server/routes/triage.routes";
import ticketsRoutes from "@/server/routes/tickets.routes";
import statusRoutes from "@/server/routes/status.routes";
import authRoutes from "@/server/routes/auth.routes";
import aiRoutes from "@/server/routes/ai.routes";
import workflowsRoutes from "@/server/routes/workflows.routes";
import { sendWorkflowError } from "@/server/http/responders";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || CORS_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS origin not allowed"));
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api", triageRoutes);
app.use("/api", ticketsRoutes);
app.use("/api", statusRoutes);
app.use("/api", authRoutes);
app.use("/api", aiRoutes);
app.use("/api", workflowsRoutes);

app.use((req, res) => {
  sendWorkflowError(res, "Not found", 404, "UNKNOWN", { path: req.path });
});

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  sendWorkflowError(res, error.message || "Internal server error", 500);
});

app.listen(SERVER_PORT, SERVER_HOST, () => {
  console.log(`[API] listening on http://${SERVER_HOST}:${SERVER_PORT}`);
});
