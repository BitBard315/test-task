import * as http from 'http';
import * as https from 'https';
import * as url from 'url';
import { FileCache } from '../cache/cache';

const cache = new FileCache('http-cache');

const targetServer = {
    host: 'jsonplaceholder.typicode.com',
    port: 443,
    protocol: 'http',
    path: '/todos',
};

const httpProxyServer = http.createServer((req, res) => {
    const requestOptions = {
        host: targetServer.host,
        port: targetServer.port,
        path: req.url,
        method: req.method,
        headers: req.headers,
    } as any;

    const targetUrl = url.format({
        protocol: targetServer.protocol,
        host: targetServer.host,
        port: targetServer.port,
        pathname: targetServer.path,
    });
    console.log(targetUrl);
    if (req.method === 'GET') {
        cache.get(targetUrl).then((cachedData) => {
            if (cachedData) {
                console.log(`Cache hit for ${targetUrl}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(cachedData);
            } else {
                handleProxyRequest(req, res, requestOptions, targetUrl);
            }
        });
    } else {
        handleProxyRequest(req, res, requestOptions, targetUrl);
    }
});

function handleProxyRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse<http.IncomingMessage>,
    requestOptions: https.RequestOptions,
    targetUrl: string
) {
    const proxyReq = https.request(requestOptions, (proxyRes) => {
        let data = '';

        proxyRes.on('data', (chunk) => {
            data += chunk;
        });

        proxyRes.on('end', () => {
            if (proxyRes.statusCode === 200) {
                cache.set(targetUrl, data, 60);
            }

            const statusCode = proxyRes.statusCode || 500;
            res.writeHead(statusCode, proxyRes.headers);
            res.end(data);
        });
    });

    proxyReq.on('error', (error: NodeJS.ErrnoException) => {
        console.error(`Proxy request error: ${error.message}`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    });

    req.pipe(proxyReq, { end: true });
}



const PORT = 3000;

export { httpProxyServer, handleProxyRequest, PORT };