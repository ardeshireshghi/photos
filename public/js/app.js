(() => {
  function renderImages(imageUrls) {
    const imagesContainer = document.querySelector('.js-images');
    imageUrls.forEach((url) => {
      const imageLink = document.createElement('a');
      imageLink.href = url;
      imageLink.className = 'image';

      if (imagesContainer.children.length > 0) {
        imagesContainer.insertBefore(imageLink, imagesContainer.firstChild);
      } else {
        imagesContainer.appendChild(imageLink);
      }

      imageLink.style.backgroundImage = `url(${url})`;
      imageLink.style.backgroundPosition = 'center';
      imageLink.style.backgroundSize = 'cover';
    });
  }

  async function init() {
    const uploaderContainerEl = document.getElementById('uploader');
    const imagesContainer = document.querySelector('.js-images');

    const sidebar = new Sidebar({
      direction: Sidebar.direction.TOP
    });

    const uploadTaskRunner = new ConcurrentTaskRunner({
      concurrency: 10
    });

    const uploader = new ImageUploader({
      containerEl: uploaderContainerEl,
      async onFilesSelected(files) {
        uploader.setUploadStatus({ isUploading: true });
        let filesToUpload = Array.from(files);
        let filesUploaded = 0;
        const filesToUploadCount = filesToUpload.length;

        const doUploadImages = () => {
          return new Promise((resolve, reject) => {
            uploadTaskRunner.onComplete = async (tasks) => {
              resolve();
            };

            uploadTaskRunner.enqueue(
              filesToUpload.map(async (file) => {
                const url = await getUploadSignedRequest(file);
                renderImages([url]);

                filesUploaded += 1;
                filesToUpload.splice(filesToUpload.indexOf(file), 1);
                uploader.setUploadStatus({
                  text: `Uploaded ${filesUploaded} from ${filesToUploadCount} images`
                });
              })
            );
          });
        };

        const handleUpload = async () => {
          const handleGoesBackToOnline = async (event) => {
            await handleUpload();
          };

          window.addEventListener('online', handleGoesBackToOnline, {
            once: true
          });

          await doUploadImages();
          lightGallery(imagesContainer);

          window.removeEventListener('online', handleGoesBackToOnline);

          uploader.setUploadStatus({ isUploading: false });
          sidebar.hide();
        };

        await handleUpload();
      }
    });

    sidebar.renderContent(uploaderContainerEl);
    uploader.render();

    // Show uploader when button is clicked
    document.querySelector('.js-btn-upload').onclick = () => sidebar.show();

    renderImages(await fetchImages());
    lightGallery(imagesContainer);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await init();

    setTimeout(() => {
      document.querySelector('.js-loader').classList.add('loader--is-hidden');
    }, 400);
  });
})();
