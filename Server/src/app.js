import express from "express";

import expensesRouter from "./routes/expense.routes.js";
import managerRoutes from "./routes/manager.routes.js";
import metaRoutes from "./routes/meta.routes.js";

import userRouter from "./routes/user.routes.js";
import contactRouter from "./routes/contact.route.js";
import forgotPasswordRouter from "./routes/forgotPassword.js";
import adminRouter from "./routes/admin.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Serve static files (uploaded resumes)
app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN === "*" ? true : process.env.CORS_ORIGIN || "http://localhost:8000",
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/meta", metaRoutes);

app.use("/api/v1/users", userRouter, forgotPasswordRouter);

app.use("/api/v1/contact", contactRouter);

app.use("/api/v1/admin", adminRouter);

app.use("/api/v1/expenses", expensesRouter);

app.use("/api/v1/manager", managerRoutes);

app.use(errorHandler);

export { app };
