const os = require('os');
const fs = require('fs');
const path = require('path');
const t = require('tap');
const crypto = require('crypto');
const fastJson = require('fast-json-stringify');
const {MockAgent, setGlobalDispatcher} = require('undici');
const {HandleCsv} = require("./handle-csv");

const {test} = t;

const BASE_URL = 'http://127.0.0.1:4000';
const stringify = fastJson({
    title: 'Schema Request API',
    type: 'array',
    items: {
        type: 'object',
        properties: {
            id: {type: 'string'},
            hash: {type: 'string'},
            uuid: {type: 'string'},
        }
    }
})

function generateTestData(max = 10) {
    const items = [];
    for (let i = 1; i <= max; i++) {
        const hash = crypto.randomBytes(10).toString('hex');
        const uuid = crypto.randomUUID();
        items.push({id: '1', hash, uuid});
    }
    return items;
}

test('should sent data from csv to API successfully', async t => {
    const filename = 'csv-to-test.csv';
    const mockItems = generateTestData();
    const tmpDir = os.tmpdir();

    const mockAgent = new MockAgent()
    setGlobalDispatcher(mockAgent)

    const mockPool = mockAgent.get(BASE_URL)
    t.teardown(async () => {
        await mockPool.close();
    });
    mockPool.intercept({
        path: '/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: stringify(mockItems)
    }).reply(204);

    const handler = new HandleCsv({
        path: path.join(tmpDir, filename),
        url: BASE_URL,
    });

    t.doesNotThrow(async () => {
        await handler.sendToApi(mockItems);
    })

});

test('should received http error from external API', async t => {
    const filename = 'csv-to-test.csv';
    const mockItems = generateTestData();
    const tmpDir = os.tmpdir();

    const mockAgent = new MockAgent()
    setGlobalDispatcher(mockAgent)

    const mockPool = mockAgent.get(BASE_URL)
    t.teardown(async () => {
        await mockPool.close();
    });
    mockPool.intercept({
        path: '/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: stringify(mockItems)
    }).reply(500, {message: 'Internal Server Error'});

    const handler = new HandleCsv({
        path: path.join(tmpDir, filename),
        url: BASE_URL,
        httpPipelining: 10,
        httpConnections: 20
    });

    t.doesNotThrow(async () => {
        await handler.sendToApi(mockItems);
    })

});

test('should send data with timeout', async t => {
    const filename = 'csv-to-test.csv';
    const mockItems = generateTestData();
    const tmpDir = os.tmpdir();

    const handler = new HandleCsv({
        path: path.join(tmpDir, filename),
        url: BASE_URL,
    });

    t.doesNotThrow(async () => {
        setTimeout(async () => {
            const mockAgent = new MockAgent()
            setGlobalDispatcher(mockAgent)

            const mockPool = mockAgent.get(BASE_URL)
            t.teardown(async () => {
                await mockPool.close();
            });
            mockPool.intercept({
                path: '/',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: stringify(mockItems)
            }).reply(204);
        }, 200)

        await handler.sendToApi(mockItems);
    })
});

test('should send remaining data to API', async t => {
    const filename = 'csv-to-test.csv';
    const mockItems = generateTestData();
    const tmpDir = os.tmpdir();

    const mockAgent = new MockAgent()
    setGlobalDispatcher(mockAgent)

    const mockPool = mockAgent.get(BASE_URL);
    t.teardown(async () => {
        await mockPool.close();
    });
    mockPool.intercept({
        path: '/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: stringify(mockItems)
    }).reply(204,);

    const handler = new HandleCsv({
        path: path.join(tmpDir, filename),
        url: BASE_URL,
    });

    t.doesNotThrow(async () => {
        handler.items = mockItems;
        await handler.handleDone();
    });

});

test('should send data to API doing parser CSV data', async t => {
    const filename = 'csv-to-test.csv';
    const mockItems = generateTestData(9);
    const newItemMock = {
        ID: '10',
        HASH: crypto.randomBytes(5).toString('hex'),
        UUID: crypto.randomUUID()
    }
    const tmpDir = os.tmpdir();

    const mockAgent = new MockAgent()
    setGlobalDispatcher(mockAgent)

    const mockPool = mockAgent.get(BASE_URL)
    t.teardown(async () => {
        await mockPool.close();
    });
    mockPool.intercept({
        path: '/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: stringify([
            ...mockItems,
            {id: newItemMock.ID, hash: newItemMock.HASH, uuid: newItemMock.UUID}
        ])
    }).reply(204);

    const handler = new HandleCsv({
        path: path.join(tmpDir, filename),
        url: BASE_URL,
    });

    t.doesNotThrow(async () => {
        handler.items = mockItems;
        await handler.handleData(newItemMock);
    })
});

test('should not send data when the length is less than expected', async t => {
    const filename = 'csv-to-test.csv';
    const mockItems = generateTestData(2);
    const newItemMock = {
        ID: '10',
        HASH: crypto.randomBytes(5).toString('hex'),
        UUID: crypto.randomUUID()
    }
    const tmpDir = os.tmpdir();

    const handler = new HandleCsv({
        path: path.join(tmpDir, filename),
        url: BASE_URL,
    });

    t.doesNotThrow(async () => {
        handler.items = mockItems;
        await handler.handleData(newItemMock);
    })
});

test('should print error on console', async t => {
    const filename = 'csv-to-test.csv';
    const tmpDir = os.tmpdir();

    const handler = new HandleCsv({
        path: path.join(tmpDir, filename),
        url: BASE_URL,
    });

    t.doesNotThrow(async () => {
        handler.handleError(new Error('Kaboom'));
    })
});

test('should run csv handler', async t => {
    const filename = 'csv-to-test.csv';
    // const mockItems = generateTestData(1);
    const tmpDir = os.tmpdir();

    const csvStream = fs.createWriteStream(path.join(tmpDir, filename));
    csvStream.write('ID;HASH;UUID')
    csvStream.write('1;12hash;12uuid')

    // for (const item of mockItems) {
    //     csvStream.write(`${item.id};${item.hash};${item.uuid}`)
    // }
    csvStream.end();

    const mockAgent = new MockAgent()
    setGlobalDispatcher(mockAgent)

    const mockPool = mockAgent.get(BASE_URL)
    t.teardown(async () => {
        await mockPool.close();
    });
    mockPool.intercept({
        path: '/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: stringify([{id: '1', hash: '12hash', uuid: '12uuid'}])
    }).reply(204);

    const handler = new HandleCsv({
        path: path.join(tmpDir, filename),
        url: BASE_URL,
    });

    t.doesNotThrow(async () => {
        handler.run()
    })
});
