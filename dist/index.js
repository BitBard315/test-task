"use strict";
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
const cache_1 = require("./app/cache/cache");
const server_1 = require("./app/proxy/server");
const cache = new cache_1.FileCache('./cache');
(() => __awaiter(void 0, void 0, void 0, function* () {
    cache.set('cache1', { data: 'first item' }, 30);
    cache.set('cache2', { data: 'second item' }, 40);
    const value1 = yield cache.get('cache1');
    console.log('First value:', value1);
    const value2 = yield cache.get('cache2');
    console.log('Second value:', value2);
    yield cache.delete('cache2');
    // await cache.clear();
}))();
const proxyOptions = {
    targetHost: 'catfact.ninja',
    targetPort: 443,
    targetProtocol: 'https',
    cache: new cache_1.FileCache('./cache'),
};
const proxyServer = new server_1.HttpProxyServer(proxyOptions);
