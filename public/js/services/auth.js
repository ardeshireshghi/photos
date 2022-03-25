async function loginUser({ username, password }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/v1/login');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const token = JSON.parse(xhr.responseText);
          resolve(token);
        } else {
          reject(new Error('error authenticating user: ' + xhr.statusText));
        }
      }
    };
    xhr.send(
      JSON.stringify({
        username,
        password
      })
    );
  });
}
