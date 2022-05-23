import { MongoClient } from "mongodb";
import express, { json } from "express";
import dotenv from "dotenv";
import chalk from "chalk";
import cors from "cors";
import cookieParser from "cookie-parser";

import router from "./routes/index.js";
import sessionMonitor from "./controllers/sessionController.js";

dotenv.config();

export const mongoClient = new MongoClient(process.env.MONGO_URI);

const server = express();

server.use(cookieParser());
server.use(cors({ credentials: true, origin: ["http://localhost:3000"] }));
server.use(json());
// server.use(allowCookies);

server.use(router);

const everyFifteenSeconds = 15000;

setInterval(sessionMonitor, everyFifteenSeconds);

server.listen(process.env.PORT, () => console.log(chalk.bold.blue("Server running on port " + process.env.PORT)));