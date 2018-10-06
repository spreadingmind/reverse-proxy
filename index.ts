import * as net from 'net';
import * as http from 'http';
import { REDIRECT_SITE } from './config';

const PROXY_PORT = 80;
const HTTP_SERVER_PORT = 8080;

const proxy = net.createServer(socket => {
  socket.on('data', message => {
    console.info('PROXY: got message:', message.toString());

    const serviceSocket = new net.Socket();

    serviceSocket.connect(HTTP_SERVER_PORT, 'localhost', () => {
      console.info('PROXY: sending message to server');
      serviceSocket.write(message);
    });

    serviceSocket.on('data', data => {
      console.info('PROXY: Receiving message from server', data.toString());
      socket.write(data);
    });

    serviceSocket.on('error', err => {
      console.info('PROXY: got error', err.toString());
      socket.write(err);
    });
  });
});

const httpServer = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(301,
      { Location: REDIRECT_SITE}
    );
    res.end();
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

proxy.listen(PROXY_PORT);
httpServer.listen(HTTP_SERVER_PORT);