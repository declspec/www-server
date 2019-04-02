const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const serveStatic = require('serve-static');
const finalHandler = require('finalhandler');

const sslOptions = {
    key: fs.readFileSync('./.ssl/key.pem'),
    cert: fs.readFileSync('./.ssl/cert.pem')
};

if (process.argv.length < 4) {
    console.error('usage: node server.js domain directory [ip]');
    process.exit(128);
}

const requestHandler = createRequestHandler(path.resolve(process.argv[3]), process.argv[2]);
const ipAddress = process.argv.length > 4 ? process.argv[4] : '0.0.0.0';

http.createServer(requestHandler).listen(80, ipAddress);
https.createServer(sslOptions, requestHandler).listen(443, ipAddress);

function createRequestHandler(root, host) {
    const serveRoot = serveStatic(root);
    host = '.' + host;

    return function(req, res) {
        if (req.headers.host && req.headers.host.endsWith(host)) {
            const subdomains = req.headers.host.substring(0, req.headers.host.length - host.length);
            req.url = `/${subdomains.split('.').reverse().join('/')}${req.url}`;
        }

        console.log(`${req.method} ${req.url}`);
        return serveRoot(req, res, finalHandler(req, res));
    };
}
