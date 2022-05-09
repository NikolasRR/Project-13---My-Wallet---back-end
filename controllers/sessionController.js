import { mongoClient } from "./../index.js";

async function sessionMonitor() {
    try {
        await mongoClient.connect();
        const db = mongoClient.db(process.env.DB_MY_WALLET);

        const fiveMinAgo = Date.now() - 15000;
        await db.collection("sessions").deleteMany({ lastStatus: { $lte: fiveMinAgo } });
    } catch (error) {
        console.log(error);

    }
}

export default sessionMonitor;