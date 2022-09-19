const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');
const {setTimeout} = require('timers/promises');
const {request} = require('undici');
const fastJson = require('fast-json-stringify');

class HandleCsv {
    constructor({path, url, httpPipelining, httpConnections}) {
        this.csvFile = fs.createReadStream(path);
        this.url = url;

        // this.pool = new Pool(url, {
        //     pipelining: httpPipelining,
        //     connections: httpConnections
        // });

        this.MAX_TIMEOUT = 2000;
        this.MAX_ITEMS_PER_REQUEST = 10;

        this.totalRequests = 0;
        this.items = [];
        this.stringify = fastJson({
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
    }

    getRandomTimeout() {
        return Math.floor(Math.random() * this.MAX_TIMEOUT);
    }

    async sendToApi(items, retry = false) {
        try {
            if (!retry) {
                this.totalRequests += 1;
            }

            const res = await request(this.url, {
                method: 'POST',
                path: '/',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: this.stringify(items)
            });
            if (res.statusCode === 204) {
                console.log(`Data sent successfully! | Request ${this.totalRequests}`);
            } else {
                const data = await res.body.text();
                console.log(`Unknown response ${res.statusCode} | ${data} | Request ${this.totalRequests}`);
            }
        } catch (err) {
            console.error(`Error on API: ${err.message}| Sending request ${this.totalRequests} again...`);

            await setTimeout(
                this.getRandomTimeout()
            );
            return await this.sendToApi(items, true);
        }
    }

    async handleData(json) {
        const newJson = {
            id: json.ID,
            hash: json.HASH,
            uuid: json.UUID
        }
        this.items.push(newJson);

        if (this.items.length === this.MAX_ITEMS_PER_REQUEST) {
            await this.sendToApi(this.items);
            this.items = [];
        }
    }

    handleError(err) {
        console.error('Some error:', err.message);
    }

    async handleDone() {
        if (this.items.length) {
            await this.sendToApi(this.items);
            this.items = [];
        }
        console.log('Done!!!');
    }

    run() {
        csv({delimiter: ';'}).fromStream(this.csvFile).subscribe(
            this.handleData.bind(this),
            this.handleError.bind(this),
            this.handleDone.bind(this)
        );
    }
}

module.exports = {
    HandleCsv
}
