import express, { Request, Response } from 'express';
import services from '../services';
import createSignS3Controller from '../../interface-adapters/controllers/signS3';
import createImageController, {
  NoS3Bucket
} from '../../interface-adapters/controllers/images';
import { basicAuth } from './middlewares/basicAuth';
import notFound from './routes/notFound';
import { createReadStream } from 'fs';
import bodyParser from 'body-parser';

export default function createApp() {
  const app = express();

  const signS3Controller = createSignS3Controller(services.blobStoreClient);
  const imageController = createImageController(services.blobStoreClient);
  const staticMiddleware = express.static('./public');

  app.use(bodyParser.json());
  app.use(staticMiddleware);

  // TODO: Use express for this
  app.get('/login', (req, res) => {
    createReadStream('./public/login.html').pipe(res);
  });

  app.get('/api/v1/sign-s3', basicAuth(), signS3Controller.signS3);
  app.get('/api/v1/images', basicAuth(), imageController.fetchImages);
  app.post('/api/v1/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400);
      res.json({
        error: true,
        status: 400,
        message: 'Cannot login without username or password'
      });
      return;
    }

    const isAdminUser =
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD;

    if (!isAdminUser) {
      res.status(401);
      res.json({
        error: true,
        status: 401,
        message: 'Invalid username and password'
      });
      return;
    }

    const authToken = Buffer.from(`${username}:${password}`).toString('base64');

    res.json({
      token: authToken
    });
  });

  app.get('*', notFound);

  app.use((err, req, res, next) => {
    if (err && err instanceof NoS3Bucket) {
      console.log(
        'S3 bucket "%s" does not exist',
        services.blobStoreClient.bucketName
      );

      res.status(500);
      res.json({
        error: true,
        status: 500,
        message: 'Cannot read images from storage'
      });
    }
  });
  return app;
}
