import { MongoClient } from "mongodb";
import express, { json } from "express";
import dotenv from "dotenv";
import chalk from "chalk";
import cors from "cors";

import router from "./routes/index.js";
import sessionMonitor from "./controllers/sessionController.js";

dotenv.config();

export const mongoClient = new MongoClient(process.env.MONGO_URI);

const server = express();
server.use(cors());
server.use(json());
server.use(router);

const everyFifteenSeconds = 15000;

setInterval(sessionMonitor, everyFifteenSeconds);

server.listen(process.env.PORT, () => console.log("Server running on port " + process.env.PORT));