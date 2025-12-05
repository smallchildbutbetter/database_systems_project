export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors,
    });
  }

  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({
      error: 'Database constraint violation',
      message: err.message,
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};
