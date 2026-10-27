function errorHandler(err, req, res, next) {
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);
  }

  if (err.code === '23505') {
    if (err.constraint && err.constraint.includes('email')) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }
    if (err.constraint && err.constraint.includes('uq_user_store_rating')) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a rating for this store.',
      });
    }
    return res.status(409).json({
      success: false,
      message: 'This record already exists.',
    });
  }

  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      message: 'The submitted data does not meet database constraints.',
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record was not found.',
    });
  }

  if (err.code === '22P02') {
    return res.status(400).json({
      success: false,
      message: 'Invalid input format. Expected numeric identifier.',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Something went wrong on our end. Please try again later.' : (err.message || 'Request failed.');

  res.status(statusCode).json({
    success: false,
    message,
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
