import createBlobStoreClient, {
  BlobStoreClient
} from '../../infrastructure/blob-store/src/BlobStoreClient';

export default function createSignS3Controller(
  blobStoreClient: BlobStoreClient
) {
  const signS3 = async (req, res, next) => {
    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];

    if (!fileName || !fileType) {
      next(new Error('Requires file-name and file-type for sign S3 url'));
      return;
    }
    const signS3params = await blobStoreClient.getSignedUrl(fileName, fileType);
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(signS3params));
    res.end();
  };

  return {
    signS3
  };
}
