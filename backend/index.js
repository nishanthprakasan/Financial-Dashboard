import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectMongoDb from "./connection.js";
import authRouter from "./routes/authRouter.js";
import dashboardRouter from "./routes/dashboardRouter.js";
import transactionRouter from "./routes/transactionsRouter.js";
import settingsRouter from "./routes/settingsRouter.js";
import analyticsRouter from "./routes/analyticsRouter.js"
import aiRouter from "./routes/aiRouter.js"

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT;

connectMongoDb(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/favicon.ico", (req, res) => res.status(204).end());
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/ai", aiRouter)

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
