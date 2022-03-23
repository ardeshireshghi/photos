async function fetchImages() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/v1/images');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const urls = JSON.parse(xhr.responseText);
          resolve(urls);
        } else {
          reject(new Error('error fetching images'));
        }
      }
    };
    xhr.send();
  });
}
