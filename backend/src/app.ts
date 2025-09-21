import express from "express";
import cors from "cors";
import { initRoutes } from "./routes/index.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { scheduleWeeklyReport } from "./jobs/report.job.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

(async () => {
    const routes = await initRoutes();
    app.use('/', routes);

    scheduleWeeklyReport();
})();

export default app;