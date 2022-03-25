async function fetchImages() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const authToken = localStorage.getItem('accessToken');
    xhr.open('GET', '/api/v1/images');
    xhr.setRequestHeader('Authorization', `Basic ${authToken}`);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          let urls;
          try {
            console.log(xhr.statusText);
            urls = JSON.parse(xhr.responseText);
            resolve(urls);
          } catch (err) {
            reject(new Error('ParseImageError'));
          }
        } else {
          reject(new Error('error fetching images'));
        }
      }
    };
    xhr.send();
  });
}
