async function uploadFile(file, signedRequest, url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedRequest);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(url);
        } else {
          reject(new Error('error uploading file ' + file.name));
        }
      }
    };
    xhr.send(file);
  });
}

async function getUploadSignedRequest(file) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      'GET',
      `/api/v1/sign-s3?file-name=${file.name}&file-type=${file.type}`
    );
    const authToken = localStorage.getItem('accessToken');
    xhr.setRequestHeader('Authorization', `Basic ${authToken}`);
    xhr.onreadystatechange = async () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          try {
            const result = await uploadFile(
              file,
              response.signedRequest,
              response.url
            );
            resolve(result);
          } catch (err) {
            reject(err);
          }
        } else {
          reject(new Error('Could not get signed URL.'));
        }
      }
    };
    xhr.send();
  });
}
