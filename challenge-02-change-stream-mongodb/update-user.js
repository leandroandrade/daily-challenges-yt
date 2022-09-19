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

        await collection.updateOne(
            {username: 'adriel86'},
            {$set: {email: faker.internet.email().toLowerCase()}}
        )
        console.log('Registro atualizado com sucesso!');
    } finally {
        await client.close();
    }
}

main().catch(console.error);
