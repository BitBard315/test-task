import { FileCache } from "./app/cache/cache";
import { HttpProxyServer, ProxyServerOptions } from "./app/proxy/server";

const cache = new FileCache('./cache');

(async () => {
    cache.set('cache1', { data: 'first item' }, 30);
    cache.set('cache2', { data: 'second item' }, 40);

    const value1 = await cache.get('cache1');
    console.log('First value:', value1);
    const value2 = await cache.get('cache2');
    console.log('Second value:', value2);

    await cache.delete('cache2');

    // await cache.clear();
  })();

  const proxyOptions: ProxyServerOptions = {
    targetHost: 'catfact.ninja',
    targetPort: 443,
    targetProtocol: 'https',
    cache: new FileCache('./cache'),
};

const proxyServer = new HttpProxyServer(proxyOptions);
