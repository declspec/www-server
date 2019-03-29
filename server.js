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

const requestHandler = createRequestHandler(path.resolve('../www'), 'dev.io');

http.createServer(requestHandler).listen(80, '127.0.0.2');
https.createServer(sslOptions, requestHandler).listen(443, '127.0.0.2');

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
