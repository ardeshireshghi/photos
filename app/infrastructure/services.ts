import createBlobStoreClient, {
  BlobStoreClient,
  BlobStoreTypes
} from './blob-store/src/BlobStoreClient';

type Services = {
  blobStoreClient: BlobStoreClient;
};

const createServices = (): Services => {
  const blobStoreClient = createBlobStoreClient(
    BlobStoreTypes.S3,
    process.env.S3_BUCKET,
    'photo-gallery/'
  );

  return {
    blobStoreClient
  };
};

export { createServices };
export default createServices();
