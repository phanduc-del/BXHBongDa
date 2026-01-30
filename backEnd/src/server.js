import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import seasonRoutes from "./routes/seasonRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/seasons", seasonRoutes);
app.use("/api/matches", matchRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
 console.log(`🚀 Server running on port ${PORT}`);
});
