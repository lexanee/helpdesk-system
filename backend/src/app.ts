import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { globalLimiter } from "./middlewares/rate-limit.middleware.js";
import { xssMiddleware } from "./middlewares/xss.middleware.js";
import { env } from "./config/env.config.js";

import authRoutes from "./routes/auth.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";

import categoryRoutes from "./routes/category.routes.js";
import logRoutes from "./routes/log.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import priorityRoutes from "./routes/priority.routes.js";
import rbacRoutes from "./routes/rbac.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import statusRoutes from "./routes/status.routes.js";
import trashRoutes from "./routes/trash.routes.js";
import userRoutes from "./routes/user.routes.js";

import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger.js";

const app = express();

// Security Middleware
app.use(helmet());
app.use(xssMiddleware());
app.use(globalLimiter);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.get("/swagger", (req, res) => {
  res.redirect("/api-docs");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/rbac", rbacRoutes);
app.use("/api/priorities", priorityRoutes);
app.use("/api/trash", trashRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/statuses", statusRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/logs", logRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Helpdesk API" });
});

export default app;
