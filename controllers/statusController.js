import { mongoClient } from "./../index.js"

async function sessionRenewer(req, res) {
    const token = req.headers.authorization.replace("Bearer", "").trim();

    try {
        await mongoClient.connect();
        const db = mongoClient.db(process.env.DB_MY_WALLET);

        const sessionOn = await db.collection("sessions").findOne({ token: token });
        if (!sessionOn) {
            return res.sendStatus(404);
        }

        await db.collection("sessions").updateOne({ token: token }, { $set: { lastStatus: Date.now() } });

        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.send("couldn`t update last status").status(500);
    }
}

export default sessionRenewer;