import express from "express";

import userRouter from './routes/user.routes.js';
import contactRouter from './routes/contact.route.js'
import forgotPasswordRouter from './routes/forgotPassword.js'
import adminRouter from './routes/admin.routes.js'
import expensesRouter from "./routes/expense.routes.js"
import managerRoutes from "./routes/manager.routes.js"

import userRouter from "./routes/user.routes.js";
import contactRouter from "./routes/contact.route.js";
import forgotPasswordRouter from "./routes/forgotPassword.js";
import adminRouter from "./routes/admin.routes.js";

import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Serve static files (uploaded resumes)
app.use("/uploads", express.static("uploads"));


app.use(cors({
    origin:'http://localhost:5031',
    credentials: true
}))

app.use(
  cors({
    origin: "http://localhost:8000",
    credentials: true,
  })
);


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/users", userRouter, forgotPasswordRouter);

app.use("/api/v1/contact", contactRouter);

app.use("/api/v1/admin", adminRouter);


app.use("/api/v1/expenses",expensesRouter)

app.use("/api/v1/manager",managerRoutes)

export {app};

