import { FileCache } from "./app/cache/cache";
// import { httpProxyServer } from "./app/proxy/httpServer";
import { httpsProxyServer, PORT } from "./app/proxy/httpsServer";

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

// https server
httpsProxyServer.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});


// httpServer
// httpProxyServer.listen(PORT, () => {
//   console.log(`Proxy server listening on port ${PORT}`);
// });