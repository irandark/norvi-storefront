import { spawn } from 'node:child_process';
import http from 'node:http';

const publicHost = '127.0.0.1';
const publicPort = 4200;
const angularPort = 4201;

const groups = [
  { id: 'home', slug: 'dlya-doma', name: 'Для дома' },
  { id: 'kitchen', slug: 'tehnika-dlya-kuhni', name: 'Техника для кухни' },
  {
    id: 'media',
    slug: 'televizory-audio-i-domashnie-kinoteatry',
    name: 'Телевизоры, аудио и домашние кинотеатры',
  },
];

const products = [
  {
    id: 'lamp',
    groupId: 'home',
    name: 'Настольная лампа Норд',
    description: 'Мягкий направленный свет и лаконичный корпус.',
    priceInCents: 699000,
    imageUrl: '/images/product-placeholder.svg',
    stock: 8,
  },
  {
    id: 'chair',
    groupId: 'home',
    name: 'Кресло Фьорд',
    description: 'Глубокая посадка для спокойного отдыха.',
    priceInCents: 2499000,
    imageUrl: '/images/product-placeholder.svg',
    stock: 3,
  },
  {
    id: 'kettle',
    groupId: 'kitchen',
    name: 'Чайник Тихий',
    description: 'Быстро нагревает воду и сохраняет тишину.',
    priceInCents: 849000,
    imageUrl: '/images/product-placeholder.svg',
    stock: 11,
  },
  {
    id: 'speaker',
    groupId: 'media',
    name: 'Колонка Волна',
    description: 'Чистый звук в компактном корпусе.',
    priceInCents: 1199000,
    imageUrl: '/images/product-placeholder.svg',
    stock: 0,
  },
];

const angular = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['ng', 'serve', '--host', publicHost, '--port', String(angularPort)],
  { stdio: 'inherit' },
);

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? publicHost}`);
  if (request.method === 'GET' && url.pathname === '/api/product-groups') {
    respondJson(response, groups);
    return;
  }
  if (request.method === 'GET' && url.pathname === '/api/products') {
    const groupId = url.searchParams.get('groupId');
    const result = products
      .filter((product) => groupId === null || product.groupId === groupId)
      .map(({ groupId: _ownership, ...product }) => product);
    respondJson(response, result);
    return;
  }

  const proxy = http.request(
    {
      host: publicHost,
      port: angularPort,
      path: request.url,
      method: request.method,
      headers: request.headers,
    },
    (upstream) => {
      response.writeHead(upstream.statusCode ?? 502, upstream.headers);
      upstream.pipe(response);
    },
  );
  proxy.on('error', () => {
    response.writeHead(503, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Angular development server is starting');
  });
  request.pipe(proxy);
});

function respondJson(response, value) {
  response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
}

server.listen(publicPort, publicHost);

function shutdown() {
  server.close();
  angular.kill('SIGTERM');
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
angular.on('exit', (code) => {
  server.close();
  process.exitCode = code ?? 1;
});
