import { v4 } from "uuid";
import bcrypt from "bcrypt";

import { mongoClient } from "./../index.js"

async function signUp(req, res) {
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
        res.send("deu ruim").status(500);
    }
}

async function signIn(req, res) {
    const { email, password } = req.body;

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
        res.send("deuruim").status(500);
    }
}
export { signUp, signIn };