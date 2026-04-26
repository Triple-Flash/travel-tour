/**
 * data/errors.ts
 * Typed errors thrown by all DAL functions.
 * The app layer catches these to decide how to respond (redirect, toast, etc.).
 */

export class NotFoundError extends Error {
  readonly code = "NOT_FOUND";
  constructor(resource: string, id?: string) {
    super(id ? `${resource} with id "${id}" not found.` : `${resource} not found.`);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  readonly code = "VALIDATION_ERROR";
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ForbiddenError extends Error {
  readonly code = "FORBIDDEN";
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "ForbiddenError";
  }
}
