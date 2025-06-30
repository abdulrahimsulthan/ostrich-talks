import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  errors?: { [key: string]: any };
  keyValue?: { [key: string]: any };
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {})
      .map((val: any) => val.message)
      .join(', ');
    
    res.status(400).json({
      error: 'Validation Error',
      message,
      details: err.errors
    });
    return;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    
    res.status(400).json({
      error: 'Duplicate Field Error',
      message,
      field
    });
    return;
  }

  // Mongoose CastError (Invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      error: 'Invalid ID',
      message: `Invalid ${err.path}: ${err.value}`
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Invalid Token',
      message: 'Invalid authentication token'
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Expired Token',
      message: 'Authentication token has expired'
    });
    return;
  }

  // Default error
  res.status(error.statusCode || 500).json({
    error: 'Server Error',
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}; 