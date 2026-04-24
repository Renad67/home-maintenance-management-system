import express from "express";
import { bootstrap } from "./app.bootstrap.js";
import cron from "node-cron";
import { autoAssignOverdueTasks } from "./services/corn.service.js"; 

const app = express();
const PORT = process.env.PORT || 3000;

bootstrap(app);

cron.schedule("0 * * * *", () => {
  console.log(" Running hourly check for overdue 36h tasks...");
  autoAssignOverdueTasks();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
