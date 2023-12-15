import * as http from 'http';
import * as https from 'https';
import * as url from 'url';
import { FileCache } from '../cache/cache';

export interface ProxyServerOptions {
    targetHost: string;
    targetPort: number;
    targetProtocol: 'http' | 'https';
    cache: FileCache;
}

export class HttpProxyServer {
    private targetHost: string;
    private targetPort: number;
    private targetProtocol: 'http' | 'https';
    private cache: FileCache;

    constructor(options: ProxyServerOptions) {
        this.targetHost = options.targetHost;
        this.targetPort = options.targetPort;
        this.targetProtocol = options.targetProtocol;
        this.cache = options.cache;

        this.createServer();
    }

    private createServer() {
        const server = http.createServer((req, res) => this.handleRequest(req, res));
        server.listen(3000, () => {
            console.log('Proxy server is listening on port 3000');
        });
    }

    private async handleRequest(clientReq: http.IncomingMessage, clientRes: http.ServerResponse) {
        const requestOptions = this.getRequestOptions(clientReq);

        if (clientReq.method === 'GET' && requestOptions.path) {
            const cacheKey = requestOptions.path;
            const cachedResponse = await this.cache.get(cacheKey);

            if (cachedResponse) {
                console.log(`Cache hit for ${requestOptions.path}`);
                this.respondWithCachedData(clientRes, cachedResponse);
            } else {
                console.log(`Cache miss for ${requestOptions.path}`);
                this.forwardRequest(clientReq, clientRes, requestOptions, cacheKey);
            }
        } else {
            console.log(`Forwarding non-GET request for ${requestOptions.path}`);
            this.forwardRequest(clientReq, clientRes, requestOptions, '');
        }
    }

    private getRequestOptions(clientReq: http.IncomingMessage): http.RequestOptions {
        const { method, headers, url: clientUrl } = clientReq;

        if (!clientUrl) {
            throw new Error('Request URL is undefined.');
        }

        const targetUrl = `${this.targetProtocol}://${this.targetHost}:${this.targetPort}/fact`;

        headers['Host'] = 'catfact.ninja';

        return { method, headers, ...url.parse(targetUrl) };
    }

    private respondWithCachedData(clientRes: http.ServerResponse, data: any) {
        clientRes.writeHead(200, { 'Content-Type': 'application/json' });
        clientRes.end(JSON.stringify(data));
    }

    private createProxyRequest(
        requestOptions: http.RequestOptions,
        onResponse: (res: http.IncomingMessage) => void
    ): http.ClientRequest {
        return (this.targetProtocol === 'https' ? https : http).request(requestOptions, onResponse);
    }
    private forwardRequest(
        clientReq: http.IncomingMessage,
        clientRes: http.ServerResponse,
        requestOptions: http.RequestOptions,
        cacheKey: string
    ) {
        const proxyReq = this.createProxyRequest(requestOptions, (proxyRes) => {
            const chunks: Buffer[] = [];

            proxyRes.on('data', (chunk) => chunks.push(chunk));

            proxyRes.on('end', async () => {
                const responseData = Buffer.concat(chunks).toString('utf-8');

                console.log(`Received response data: ${responseData}`);

                try {
                    const parsedData = JSON.parse(responseData);
                    await this.cache.set(cacheKey, parsedData, 60);
                    this.respondWithCachedData(clientRes, parsedData);
                } catch (jsonError) {
                    if (jsonError instanceof Error) {
                        console.error('Error parsing JSON:', jsonError.message);
                    } else {
                        console.error('Unexpected error parsing JSON.');
                    }

                    this.handleJsonError(clientRes);
                }
            });

            proxyRes.on('error', (err: any) => {
                console.error('Proxy response error:', err.message);
                this.handleProxyError(clientRes);
            });

            clientReq.pipe(proxyReq, { end: true });
        });

        proxyReq.on('error', (err: any) => {
            console.error('Proxy request error:', err.message);
            this.handleProxyError(clientRes);
        });
    }

    private handleJsonError(clientRes: http.ServerResponse) {
        clientRes.writeHead(500, { 'Content-Type': 'text/plain' });
        clientRes.end('Internal Server Error');
    }

    private handleProxyError(clientRes: http.ServerResponse) {
        if (!clientRes.headersSent) {
            clientRes.writeHead(500, { 'Content-Type': 'text/plain' });
            clientRes.end('Internal Server Error');
        }
    }
}
