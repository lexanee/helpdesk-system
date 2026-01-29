import "dotenv/config";
import http from "http";
import app from "./app.js";
import { env } from "./config/env.config.js";
import logger from "./utils/logger.js";
import { initSocket } from "./services/socket.service.js";

const PORT = env.PORT;

const server = http.createServer(app);
initSocket(server);

// Start Background Jobs

server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
