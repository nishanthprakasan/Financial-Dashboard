import { configDotenv } from "dotenv";
import express from "express";
import cors from 'cors'
import cookieParser from "cookie-parser";
import connectMongoDb from "./connection.js";
import authRouter from "./routes/authRouter.js";
import dashboardRouter from "./routes/dashboardRouter.js";
import transactionRouter from './routes/transactionsRouter.js'

configDotenv();
const app = express();
const PORT = process.env.PORT;

connectMongoDb(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true 
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); 

app.get("/favicon.ico", (req, res) => res.status(204).end());
app.use("/api/auth", authRouter);
app.use("/api/dashboard",dashboardRouter);
app.use("/api/transactions", transactionRouter);

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
