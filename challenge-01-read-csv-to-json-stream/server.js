const http = require('http');
const {once} = require('events');

async function getPayload(req) {
    const [data] = await once(req, 'data');
    return JSON.parse(data);
}

async function handle(req, res) {
    const payload = await getPayload(req);
    const ids = payload.map(json => json.id);
    console.log(ids);
    //
    // const error = [true, false][Math.round(Math.random())];
    // if (error) {
    //     res.writeHead(500, {
    //         'Content-Type': 'application/json'
    //     });
    //     res.end(JSON.stringify({message: 'Internal Server error!'}));
    // } else {
        res.writeHead(204);
        res.end();
    // }
}

http.createServer(handle).listen(4000, () => {
    console.log('Server up and running at 4000');
});
