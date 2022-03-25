(() => {
  function doRenderImages(imagesContainer, imageUrls) {
    imageUrls.forEach((url) => {
      const imageLink = document.createElement('a');
      imageLink.href = url;
      imageLink.className = 'js-image image';

      if (imagesContainer.children.length > 0) {
        imagesContainer.insertBefore(imageLink, imagesContainer.firstChild);
      } else {
        imagesContainer.appendChild(imageLink);
      }

      imageLink.setAttribute('data-url', url);
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

    const imageIntersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((item) => {
          if (item.isIntersecting) {
            const imageEl = item.target;
            const imageUrl = item.target.getAttribute('data-url');

            if (imageUrl) {
              imageEl.style.backgroundImage = `url(${imageUrl})`;
              imageEl.style.transitionDelay = `${Math.random() * 300 + 50}ms`;

              setTimeout(() => {
                imageEl.classList.add('image--loaded');
              }, 300);
            }
          }
        });
      },
      {
        threshold: 0.2
      }
    );

    const renderImages = (urls) => {
      const imagesContainer = document.querySelector('.js-images');
      const noImageText = imagesContainer.querySelector(
        '.js-images__no-image-text'
      );
      noImageText && noImageText.remove();
      doRenderImages(imagesContainer, urls);
      lightGallery(imagesContainer);

      // start observing images
      imagesContainer.querySelectorAll('.js-image').forEach((imageEl) => {
        imageIntersectionObserver.observe(imageEl);
      });
    };

    const uploader = new ImageUploader({
      containerEl: uploaderContainerEl,
      async onFilesSelected(files) {
        uploader.setUploadStatus({ isUploading: true });
        let filesToUpload = Array.from(files);
        let filesUploaded = 0;
        let imageUrls = [];
        const filesToUploadCount = filesToUpload.length;

        const doUploadImages = () => {
          return new Promise((resolve, reject) => {
            uploadTaskRunner.onComplete = async (tasks) => {
              resolve();
            };

            uploadTaskRunner.enqueue(
              filesToUpload.map(async (file) => {
                try {
                  const url = await getUploadSignedRequest(file);
                  imageUrls.push(url);
                  filesUploaded += 1;
                  filesToUpload.splice(filesToUpload.indexOf(file), 1);
                  uploader.setUploadStatus({
                    text: `Uploaded ${filesUploaded} from ${filesToUploadCount} images`
                  });
                } catch (err) {
                  console.error('There was an error uploading image', err);
                }
              })
            );
          });
        };

        const handleUpload = async () => {
          const handleGoesBackToOnline = async (event) => {
            await handleUpload();
          };

          // This is to resume uploading in case of losing connection
          window.addEventListener('online', handleGoesBackToOnline, {
            once: true
          });

          await doUploadImages();

          // Render images and set the image gallery
          if (imageUrls.length > 0) {
            renderImages(imageUrls);

            // Empty url cache
            imageUrls = [];
          }

          window.removeEventListener('online', handleGoesBackToOnline);

          // Reset uploader state and hide the sidebar
          uploader.setUploadStatus({ isUploading: false });
          sidebar.hide();
        };

        await handleUpload();
      }
    });

    // Render uploader and set sidebar
    sidebar.renderContent(uploaderContainerEl);
    uploader.render();

    try {
      const urls = await fetchImages();
      if (urls.length > 0) {
        renderImages(urls);
      }
    } catch (err) {
      // This means that the user is not authenticated
      if (err.message === 'ParseImageError') {
        location.href = '/login';
        return;
      }

      const noImageText = imagesContainer.querySelector(
        '.js-images__no-image-text'
      );
      noImageText.style.color = 'red';
      noImageText.textContent =
        '😬 There was an error loading the images. Please try again later';

      throw err;
    }

    // Show uploader when button is clicked
    document.querySelector('.js-btn-upload').onclick = () => sidebar.show();

    document.querySelector('.js-logout').onclick = (e) => {
      e.preventDefault();
      localStorage.removeItem('accessToken');
      location.href = '/login';
    };
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      await init();
    } finally {
      setTimeout(() => {
        document.querySelector('.js-loader').classList.add('loader--is-hidden');
      }, 400);
    }
  });
})();
