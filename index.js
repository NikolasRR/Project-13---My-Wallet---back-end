import { MongoClient } from "mongodb";
import joi from "joi";
import express, { json } from "express";
import dotenv from "dotenv";
import chalk from "chalk";
import cors from "cors";
import { v4 } from "uuid";
import bcrypt from "bcrypt";
import dayjs from "dayjs";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);

const server = express();
server.use(cors());
server.use(json());

setInterval(async () => {
    try {
        await mongoClient.connect();
        const db = mongoClient.db(process.env.DB_MY_WALLET);

        const fiveMinAgo = Date.now() - 300000;
        await db.collection("sessions").deleteMany({ lastStatus: {$lte: fiveMinAgo} });
    } catch (error) {
        console.log(error);

    }
}, 300000)

server.post("/sign-up", async (req, res) => {
    const singupSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required()
    });

    const validation = singupSchema.validate(req.body);
    if (validation.error) return res.sendStatus(422);

    const { password, name, email } = req.body;
    try {
        await mongoClient.connect();
        const db = mongoClient.db(process.env.DB_MY_WALLET);

        const alreadyExists = await db.collection("users").findOne({ email: email });
        if (alreadyExists) return res.sendStatus(409);

        const cryp = bcrypt.hashSync(password, 10);
        await db.collection("users").insertOne({
            name: name,
            email: email,
            password: cryp
        });

        await db.collection("transactions").insertOne({ email: email, statement: [] });

        mongoClient.close();
        res.sendStatus(201);

    } catch (error) {
        mongoClient.close();
        res.sendStatus(500);
    }
});

server.post("/sign-in", async (req, res) => {
    const { email, password } = req.body;

    const singinSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    });
    
    const validation = singinSchema.validate(req.body);
    if (validation.error) return res.sendStatus(422);

    try {
        await mongoClient.connect();
        const db = mongoClient.db(process.env.DB_MY_WALLET);

        const user = await db.collection("users").findOne({ email: email });
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = v4();
            await db.collection("sessions").insertOne({
                email: email,
                token: token,
                lastStatus: Date.now()
            });
            
            mongoClient.close();
            return res.send(token).status(201);
        }
        mongoClient.close();
        res.sendStatus(401)
    } catch (error) {
        mongoClient.close();
        res.sendStatus(500);
    }
});

server.get("/main", async (req, res) => {
    const token = req.headers.authorization.replace("bearer", "").trim();
    if (!token) {
        return res.sendStatus(400);
    }

    try {
        await mongoClient.connect();
        const db = mongoClient.db(process.env.DB_MY_WALLET);

        const session = await db.collection("sessions").findOne({ token: token });
        if (session) {
            const statement = await db.collection("transactions").findOne({ email: session.email });
            delete statement._id;
            mongoClient.close();
            return res.send(statement).status(200);
        }
        mongoClient.close();
        return res.sendStatus(404);
    } catch (error) {
        mongoClient.close();
        res.send(error).status(500);
    }
});


server.post("/transaction", async (req, res) => {
    const transactionSchema = joi.object({
        value: joi.number().required(),
        description: joi.string().required()
    });
    const token = (req.headers.authorization).replace("bearer", "").trim();

    const validation = transactionSchema.validate(req.body);
    if (validation.error) res.sendStatus(422);

    try {
        await mongoClient.connect();
        const db = mongoClient.db(process.env.DB_MY_WALLET);

        const session = await db.collection("sessions").findOne({ token: token });
        if (session) {
            const transaction = {...req.body, date: dayjs().format("DD/MM")}
            await db.collection("transactions").updateOne({ email: session.email }, { $push: { statement: transaction } });
            
            mongoClient.close();
            return res.sendStatus(201);
        }

        mongoClient.close();
        res.sendStatus(401);
    } catch (error) {
        mongoClient.close();
        res.send(error).status(500);
    }
});

server.post("/status", async (req, res) => {
    const token = req.headers.authorization;

    try {
        await mongoClient.connect();
        const db = mongoClient.db(process.env.DB_MY_WALLET);
        
        await db.collection("sessions").updateOne({ token: token }, { $set: { lastStatus: Date.now() } });
    } catch (error) {
        console.log(error);
        res.send("couldn`t update last status").status(500);
    }
});

server.listen(process.env.PORT, () => console.log(chalk.bold.yellow(`Server Operational at ${process.env.PORT}`)));