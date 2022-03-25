const showAuthPrompt = (res) => {
  res.status(401);
  res.setHeader('WWW-Authenticate', 'Basic realm=<realm>, charset="UTF-8"');
  res.end();
};

const credentialsFromAuthHeader = (authorization) => {
  const base64Credentials = authorization.trim().split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString(
    'ascii'
  );

  const [username, password] = credentials.split(':');
  return [username, password];
};

export function basicAuth() {
  const basicAuthHandler = (req, res, next) => {
    const authorization = req.headers.authorization;

    // Exclude login page and login api
    if (!process.env.ADMIN_USERNAME || req.url.includes('login')) {
      next();
      return;
    }

    if (!authorization || !authorization.startsWith('Basic')) {
      res.redirect('/login');
      return;
    }

    const [username, password] = credentialsFromAuthHeader(authorization);
    const isAdminUser =
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD;

    if (!isAdminUser) {
      res.redirect('/login');
      return;
    }

    next();
  };

  return basicAuthHandler;
}
