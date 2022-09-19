const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const csvFile = fs.createWriteStream(
    path.join(__dirname, 'big-file.csv')
);
csvFile.write('ID;HASH;UUID\n');

for (let i = 1; i <= 11; i++) {
    const hash = crypto.randomBytes(10).toString('hex');
    const uuid = crypto.randomUUID();

    csvFile.write(`${i};${hash};${uuid}\n`);
}

csvFile.end();
