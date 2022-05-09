import dayjs from "dayjs";

import { mongoClient } from "./../index.js"

async function getStatement(req, res) {
    const token = req.headers.authorization.replace("Bearer", "").trim();

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
}

async function postNewTransaction(req, res) {
    const token = req.headers.authorization.replace("Bearer", "").trim();

    try {
        await mongoClient.connect();
        const db = mongoClient.db(process.env.DB_MY_WALLET);

        const session = await db.collection("sessions").findOne({ token: token });
        if (session) {
            const transaction = { ...req.body, date: dayjs().format("DD/MM") }
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
}

export { getStatement, postNewTransaction };