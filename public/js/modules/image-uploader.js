// document.addEventListener('paste', (e) => {
//   const file = e.clipboardData.items[0].getAsFile();
//   if (!file.type.startsWith('image')) return;

//   const imgEl = new Image();
//   const reader = new FileReader();

//   imgEl.style.maxWidth = '100%';

//   reader.onload = (e) => {
//     imgEl.src = e.target.result;
//     document.body.appendChild(imgEl);
//     if ('scrollIntoView' in imgEl) {
//       imgEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
//     } else {
//       window.scrollTo(0, document.documentElement.scrollHeight - imgEl.height);
//     }
//   };
//   reader.readAsDataURL(file);
// });

const ImageUploader = (() => {
  const ImageFileMimeTypes = {
    JPEG: 'image/jpeg',
    JPG: 'image/jpg',
    PNG: 'image/png',
    GIF: 'image/gif',
    SVG: 'image/svg'
  };

  const defaultAcceptedFiles = Object.values(ImageFileMimeTypes);
  const noop = () => {};

  class Uploader {
    constructor({
      containerEl,
      onFilesSelected = noop,
      acceptedFileTypes = defaultAcceptedFiles
    }) {
      this.containerEl = containerEl;
      this.acceptedFileTypes = acceptedFileTypes;
      this.onFilesSelected = onFilesSelected;

      this.state = {
        isRendered: false,
        isUploading: false
      };
    }

    render() {
      if (this.state.isRendered) {
        return;
      }
      const acceptedFiles = this.acceptedFileTypes.join(',');
      const style = document.createElement('style');

      style.innerHTML = this.styles;
      document.head.appendChild(style);

      this.containerEl.innerHTML = `
        <div class="image-uploader">
          <div class="js-image-uploader__overlay image-uploader__overlay image-uploader--hidden">Uploading images...</div>
          <div class="image-uploader__inner">
            <input accept="${acceptedFiles}" tabindex="-1" multiple="" type="file" class="js-image-uploader__file-input image-uploader__file-input" />
            <span class="image-uploader__file-cta js-image-uploader__file-cta">Choose files</span> or drag here
          </div>
        </div>
      `;

      this.bindEvents();

      this.state.isRendered = true;
    }

    bindEvents() {
      this.containerEl.addEventListener('click', (e) => {
        if (!e.target.closest('.js-image-uploader__file-input')) {
          this.containerEl
            .querySelector('.js-image-uploader__file-input')
            .click();
        }
      });

      this.containerEl.querySelector('[type="file"]').onchange = (e) => {
        const files = e.target.files;

        files.length > 0 && this.onFilesSelected(files);
      };
    }
    setUploadStatus({ isUploading, text }) {
      if (isUploading && this.state.isUploading !== isUploading) {
        this.toggleUploadingOverlay();
      }

      if (text || !isUploading) {
        this.updateUploadOverlayText(text);
      }

      this.state.isUploading = isUploading;
    }

    toggleUploadingOverlay() {
      const overlay = this.containerEl.querySelector(
        '.js-image-uploader__overlay'
      );

      overlay.classList.toggle('image-uploader--hidden');
    }

    updateUploadOverlayText(text = 'Uploading images...') {
      const overlay = this.containerEl.querySelector(
        '.js-image-uploader__overlay'
      );
      overlay.textContent = text;
    }

    get styles() {
      return `
        .image-uploader {
          display: flex;
          position: relative;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border: 2px dashed #aaa;
          border-radius: 10px;
          background-color: #f4f4f4;
          cursor: pointer;
        }

        .image-uploader__inner {
          padding: 40px;
        }

        .image-uploader__file-input {
          display: none;
        }

        .image-uploader__file-cta {
          color: #5166d8;
          font-weight: 500;
        }

        .image-uploader__overlay {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255, 255, 255, 0.8);

          font-size: 1.2rem;
          color: #333;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .image-uploader--hidden {
          display: none;
        }
      `;
    }
  }

  Uploader.ImageFileMimeTypes = ImageFileMimeTypes;

  return Uploader;
})();
