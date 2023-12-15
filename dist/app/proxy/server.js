"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpProxyServer = void 0;
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const url = __importStar(require("url"));
class HttpProxyServer {
    constructor(options) {
        this.targetHost = options.targetHost;
        this.targetPort = options.targetPort;
        this.targetProtocol = options.targetProtocol;
        this.cache = options.cache;
        this.createServer();
    }
    createServer() {
        const server = http.createServer((req, res) => this.handleRequest(req, res));
        server.listen(3000, () => {
            console.log('Proxy server is listening on port 3000');
        });
    }
    handleRequest(clientReq, clientRes) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestOptions = this.getRequestOptions(clientReq);
            if (clientReq.method === 'GET' && requestOptions.path) {
                const cacheKey = requestOptions.path;
                const cachedResponse = yield this.cache.get(cacheKey);
                if (cachedResponse) {
                    console.log(`Cache hit for ${requestOptions.path}`);
                    this.respondWithCachedData(clientRes, cachedResponse);
                }
                else {
                    console.log(`Cache miss for ${requestOptions.path}`);
                    this.forwardRequest(clientReq, clientRes, requestOptions, cacheKey);
                }
            }
            else {
                console.log(`Forwarding non-GET request for ${requestOptions.path}`);
                this.forwardRequest(clientReq, clientRes, requestOptions, '');
            }
        });
    }
    getRequestOptions(clientReq) {
        const { method, headers, url: clientUrl } = clientReq;
        if (!clientUrl) {
            throw new Error('Request URL is undefined.');
        }
        const targetUrl = `${this.targetProtocol}://${this.targetHost}:${this.targetPort}/fact`;
        headers['Host'] = 'catfact.ninja';
        return Object.assign({ method, headers }, url.parse(targetUrl));
    }
    respondWithCachedData(clientRes, data) {
        clientRes.writeHead(200, { 'Content-Type': 'application/json' });
        clientRes.end(JSON.stringify(data));
    }
    //     private forwardRequest(
    //         clientReq: http.IncomingMessage,
    //         clientRes: http.ServerResponse,
    //         requestOptions: http.RequestOptions,
    //         cacheKey: string
    //     ) {
    //         const proxyReq = this.createProxyRequest(requestOptions, (proxyRes) => {
    //             const chunks: Buffer[] = [];
    //             proxyRes.on('data', (chunk) => chunks.push(chunk));
    //             proxyRes.on('end', async () => {
    //                 const responseData = Buffer.concat(chunks).toString('utf-8');
    //                 console.log(`Received response data: ${responseData}`);
    //                 try {
    //                     const parsedData = JSON.parse(responseData);
    //                     await this.cache.set(cacheKey, parsedData, 60);
    //                     this.respondWithCachedData(clientRes, parsedData);
    //                 } catch (jsonError) {
    //                     if (jsonError instanceof Error) {
    //                         console.error('Error parsing JSON:', jsonError.message);
    //                     } else {
    //                         console.error('Unexpected error parsing JSON.');
    //                     }
    //                     clientRes.writeHead(500, { 'Content-Type': 'text/plain' });
    //                     clientRes.end('Internal Server Error');
    //                 }
    //             });
    //             proxyRes.pipe(clientRes, { end: true });
    //         });
    //         clientReq.pipe(proxyReq, { end: true });
    //         proxyReq.on('error', (err) => {
    //             console.error('Proxy request error:', err.message);
    //             clientRes.writeHead(500, { 'Content-Type': 'text/plain' });
    //             clientRes.end('Internal Server Error');
    //         });
    //     }
    createProxyRequest(requestOptions, onResponse) {
        return (this.targetProtocol === 'https' ? https : http).request(requestOptions, onResponse);
    }
    forwardRequest(clientReq, clientRes, requestOptions, cacheKey) {
        const proxyReq = this.createProxyRequest(requestOptions, (proxyRes) => {
            const chunks = [];
            proxyRes.on('data', (chunk) => chunks.push(chunk));
            proxyRes.on('end', () => __awaiter(this, void 0, void 0, function* () {
                const responseData = Buffer.concat(chunks).toString('utf-8');
                console.log(`Received response data: ${responseData}`);
                try {
                    const parsedData = JSON.parse(responseData);
                    yield this.cache.set(cacheKey, parsedData, 60);
                    this.respondWithCachedData(clientRes, parsedData);
                }
                catch (jsonError) {
                    if (jsonError instanceof Error) {
                        console.error('Error parsing JSON:', jsonError.message);
                    }
                    else {
                        console.error('Unexpected error parsing JSON.');
                    }
                    this.handleJsonError(clientRes);
                }
            }));
            proxyRes.on('error', (err) => {
                console.error('Proxy response error:', err.message);
                this.handleProxyError(clientRes);
            });
            clientReq.pipe(proxyReq, { end: true });
        });
        proxyReq.on('error', (err) => {
            console.error('Proxy request error:', err.message);
            this.handleProxyError(clientRes);
        });
    }
    handleJsonError(clientRes) {
        clientRes.writeHead(500, { 'Content-Type': 'text/plain' });
        clientRes.end('Internal Server Error');
    }
    handleProxyError(clientRes) {
        if (!clientRes.headersSent) {
            clientRes.writeHead(500, { 'Content-Type': 'text/plain' });
            clientRes.end('Internal Server Error');
        }
    }
}
exports.HttpProxyServer = HttpProxyServer;
