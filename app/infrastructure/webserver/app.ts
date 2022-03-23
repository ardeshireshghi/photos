import express, { Request, Response } from 'express';
import services from '../services';
import createSignS3Controller from '../../interface-adapters/controllers/signS3';
import createImageController from '../../interface-adapters/controllers/images';
import { basicAuth } from './middlewares/basicAuth';
import notFound from './routes/notFound';

export default function createApp() {
  const app = express();

  const signS3Controller = createSignS3Controller(services.blobStoreClient);
  const imageController = createImageController(services.blobStoreClient);
  const staticMiddleware = express.static('./public');

  app.use(basicAuth());
  app.use(staticMiddleware);
  app.get('/api/v1/sign-s3', signS3Controller.signS3);
  app.get('/api/v1/images', imageController.fetchImages);
  app.get('*', notFound);
  return app;
}
