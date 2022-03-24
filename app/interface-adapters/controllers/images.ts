import createBlobStoreClient, {
  BlobStoreClient,
  File
} from '../../infrastructure/blob-store/src/BlobStoreClient';

export class NoS3Bucket extends Error {
  constructor() {
    super('S3 bucket does not exists');
  }
}

export default function createImageController(
  blobStoreClient: BlobStoreClient
) {
  const fetchImages = async (req, res, next) => {
    let imageFiles: File[] = [];

    try {
      imageFiles = (await blobStoreClient.getFiles()) as File[];
    } catch (err) {
      if (err.name === 'NoSuchBucket') {
        next(new NoS3Bucket());
        return;
      }
    }

    let imageUrls = [];
    if (imageFiles.length > 0) {
      imageUrls = imageFiles
        .sort((a, b) => {
          return a.lastModified > b.lastModified ? 1 : -1;
        })
        .map(
          (file) =>
            `https://${
              blobStoreClient.bucketName
            }.s3.amazonaws.com/${encodeURIComponent(file.name)}`
        );
    }

    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(imageUrls));
    res.end();
  };

  return {
    fetchImages
  };
}
