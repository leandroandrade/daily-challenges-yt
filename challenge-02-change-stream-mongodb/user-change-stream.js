const {MongoClient} = require('mongodb');
const {mongo_uri, db, collection_name} = require('./db.json');
const {setTimeout} = require('timers/promises');

async function handle(client) {
    const database = client.db(db);
    const collection = database.collection(collection_name);
    const changeStream = collection.watch([{
        '$match': {
            operationType: 'insert'
        }
    }], {
        // fullDocument: 'updateLookup', // retorna todo document na atualizacao do registro
        // resumeAfter: {
        //     _data: '82632120000000000E2B022C0100296E5A10049FC8E2E83B114D9DBB010A699A2C636A46645F6964006463212000B1DF61389E1CBDAE0004'
        // }
    });

    try {
        while (await changeStream.hasNext()) {
            const document = await changeStream.next();
            console.log(document);

            await setTimeout(1000);
        }
    } catch (err) {
        throw err;
    } finally {
        if (!changeStream.closed) {
            changeStream.close();
        }
    }
}

async function main() {
    const client = new MongoClient(mongo_uri);
    try {
        await client.connect();
        console.log('MongoDB conectado...');

        await handle(client);
    } finally {
        await client.close();
    }
}

main().catch(console.error);
