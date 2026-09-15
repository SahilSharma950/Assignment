/**
 * Custom operational error class.
 *
 * Distinguishes between:
 *  - Operational errors (AppError) — predictable, handled gracefully (4xx/5xx)
 *  - Programming errors (Error)    — unexpected, crash the process
 *
 * Usage:
 *   throw new AppError('User not found', 404);
 *   throw new AppError('Email already in use', 409, [{ field: 'email', message: '...' }]);
 */

import type { ValidationError } from '../types/index.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors: ValidationError[] | undefined;

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: ValidationError[],
  ) {
    super(message);

    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    // Restores prototype chain (required when extending built-ins in TS/ES5 target)
    Object.setPrototypeOf(this, new.target.prototype);

    // Captures a clean stack trace that starts from the call site, not here
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Common Factory Methods ────────────────────────────────────────────────────

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', errors?: ValidationError[]) {
    super(message, 400, errors);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', errors?: ValidationError[]) {
    super(message, 409, errors);
    this.name = 'ConflictError';
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = 'Unprocessable entity', errors?: ValidationError[]) {
    super(message, 422, errors);
    this.name = 'UnprocessableEntityError';
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
    this.name = 'TooManyRequestsError';
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500);
    this.name = 'InternalServerError';
  }
}
