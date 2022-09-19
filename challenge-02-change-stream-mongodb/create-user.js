const {MongoClient} = require('mongodb');
const {faker} = require('@faker-js/faker');
const {mongo_uri, db, collection_name} = require('./db.json');

async function main() {
    const client = new MongoClient(mongo_uri);
    try {
        await client.connect();
        console.log('MongoDB conectado...');

        const database = client.db(db);
        const collection = database.collection(collection_name);

        for (let i = 1; i <= 200; i++) {
            await collection.insertOne({
                id: i,
                username: faker.internet.userName().toLowerCase(),
                email: faker.internet.email().toLowerCase()
            });
        }
        console.log('Registros incluidos com sucesso!');
    } finally {
        await client.close();
    }
}

main().catch(console.error);
