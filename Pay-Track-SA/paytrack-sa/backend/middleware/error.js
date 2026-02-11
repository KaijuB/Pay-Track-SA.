function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.expose ? err.message : 'Internal server error';
  res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
