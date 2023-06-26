// A protected route that requires authentication:
app.get('/protected', requireAuth, (req, res) => {
  // Access token is valid, perform the protected operation here
  res.json({ message: 'Protected route accessed successfully' });
});

// A route to log out and clear the tokens:
app.post('/logout', (req, res) => {
  // Clear the access token cookie
  res.clearCookie('accessToken');

  // Clear the refresh token cookie
  res.clearCookie('refreshToken');

  res.sendStatus(200);
});

app.get('/protected', (req, res) => {
  // Retrieve the access token from the cookie
  const accessToken = getCookie(req, 'accessToken');

  if (!accessToken) {
    return res.status(401).json({ message: 'Access token not found' });
  }

  try {
    jwt.verify(accessToken, secretKey);
    // Access token is valid, perform the protected operation here
    res.json({ message: 'Protected route accessed successfully' });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid access token' });
  }
});

app.post('/logout', (req, res) => {
  // Clear the access token cookie
  deleteCookie(res, 'accessToken');

  // Clear the refresh token cookie
  deleteCookie(res, 'refreshToken');

  res.sendStatus(200);
});

