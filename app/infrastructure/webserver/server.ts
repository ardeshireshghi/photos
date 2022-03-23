import http from 'http';
import createApp from './app';

const PORT = Number(process.env.PORT) || 9999;

function startServer() {
  const app = createApp();

  app.listen(PORT, '0.0.0.0', () => {
    console.log('Server started! Listening to port', PORT);
  });
}

export { startServer };
