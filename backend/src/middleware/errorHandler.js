// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', err);

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { status: 404, message };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field} already exists`;
    error = { status: 400, message };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { status: 400, message };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = { status: 401, message: 'Invalid token' };
  }

  if (err.name === 'TokenExpiredError') {
    error = { status: 401, message: 'Token expired' };
  }

  // Multer file upload error
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = { status: 400, message: 'File size too large. Max 10MB' };
  }

  // Default error
  const statusCode = error.status || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// 404 handler for routes not found
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };