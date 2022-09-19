const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');
const {setTimeout} = require('timers/promises');
const {Pool} = require('undici');

const csvFile = fs.createReadStream(
    path.join(__dirname, 'big-file.csv')
);

const pool = new Pool('http://localhost:4000', {
    pipelining: 10,
    connections: 20
});

async function sendToApi(json) {
    try {
        const res = await pool.request({
            method: 'POST',
            path: '/',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json)
        });
        if (res.statusCode === 204) {
            console.log('Data sent successfully!');
        } else {
            const data = await res.body.text();
            console.log(`Unknown response ${res.statusCode} | ${data}`);
        }
    } catch (err) {
        console.error('Error on API:', err.message);

        await setTimeout(1000);
        return await sendToApi(json);
    }
}

async function handleData(json) {
    await sendToApi({
        id: json.ID,
        hash: json.HASH,
        uuid: json.UUID
    })
}

function handleError(err) {
    console.error('Some error:', err.message);
}

function handleDone() {
    console.log('Done!!!');
}

csv({delimiter: ';'}).fromStream(csvFile).subscribe(
    handleData,
    handleError,
    handleDone
);
