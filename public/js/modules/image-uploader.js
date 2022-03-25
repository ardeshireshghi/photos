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

      this._handleDragOverEnter = this._handleDragOverEnter.bind(this);
      this._handleDragLeaveEnd = this._handleDragLeaveEnd.bind(this);
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
        <div class="js-image-uploader image-uploader">
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
        if (
          !e.target.closest('.js-image-uploader__file-input') &&
          !this.state.isUploading
        ) {
          this.containerEl
            .querySelector('.js-image-uploader__file-input')
            .click();
        }
      });

      this.containerEl.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      // See: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
      this.containerEl.addEventListener('drop', (ev) => {
        ev.preventDefault();
        let files = [];

        if (ev.dataTransfer.items) {
          // Use DataTransferItemList interface to access the file(s)
          for (let i = 0; i < ev.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            if (ev.dataTransfer.items[i].kind === 'file') {
              files.push(ev.dataTransfer.items[i].getAsFile());
            }
          }
        } else {
          // Use DataTransfer interface to access the file(s)
          if (ev.dataTransfer.files.length > 0) {
            ev.dataTransfer.files;
          }
          for (let i = 0; i < ev.dataTransfer.files.length; i++) {
            files = [...files, ...ev.dataTransfer.files];
          }
        }

        files.length > 0 && this.onFilesSelected(files);
      });

      this.containerEl.addEventListener('dragover', this._handleDragOverEnter);
      this.containerEl.addEventListener('dragenter', this._handleDragOverEnter);
      this.containerEl.addEventListener('dragleave', this._handleDragLeaveEnd);
      this.containerEl.addEventListener('dragend', this._handleDragLeaveEnd);

      this.containerEl.querySelector('[type="file"]').onchange = (e) => {
        const files = e.target.files;

        files.length > 0 && this.onFilesSelected(files);
      };
    }
    setUploadStatus({ isUploading, text }) {
      if (
        typeof isUploading !== 'undefined' &&
        this.state.isUploading !== isUploading
      ) {
        this.toggleUploadingOverlay();
      }

      if (text || !isUploading) {
        this.updateUploadOverlayText(text);
      }

      if (typeof isUploading !== 'undefined') {
        this.state.isUploading = isUploading;
      }
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

    _handleDragOverEnter(e) {
      e.preventDefault();
      this.containerEl
        .querySelector('.js-image-uploader')
        .classList.add('image-uploader--dragover');
    }

    _handleDragLeaveEnd(e) {
      e.preventDefault();
      this.containerEl
        .querySelector('.js-image-uploader')
        .classList.remove('image-uploader--dragover');
    }

    get styles() {
      return `
        .image-uploader {
          display: flex;
          position: relative;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          outline: 2px dashed #8d97ce;
          outline-offset: -10px;
          background-color: rgba(81, 102, 216, 0.12);
          transition: outline-offset .15s ease-in-out, background-color .15s linear;
          cursor: pointer;
        }

        .image-uploader--dragover {
          outline-offset: -15px;
          outline-color: #cbc8df;
          background-color: #fff;
        }

        .image-uploader__inner {
          padding: 80px;
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
