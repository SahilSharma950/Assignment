import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/AppError.js';
import { ROLE_HIERARCHY, UserRole } from '../types/index.js';

/**
 * Role-Based Access Control (RBAC) middleware.
 * Must be used AFTER `requireAuth` middleware so that `req.user` is populated.
 *
 * Checks if the authenticated user's role meets or exceeds the required role.
 *
 * @param requiredRole The minimum role required to access the route.
 */
export const requireRole = (requiredRole: UserRole) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required for RBAC check.'));
    }

    const userRole = req.user.role as UserRole;
    
    // Check if the user's role is recognized in the hierarchy
    if (!(userRole in ROLE_HIERARCHY)) {
      return next(new ForbiddenError('Invalid user role assigned.'));
    }

    const userLevel = ROLE_HIERARCHY[userRole];
    const requiredLevel = ROLE_HIERARCHY[requiredRole];

    if (userLevel < requiredLevel) {
      return next(
        new ForbiddenError(`Access denied. Requires at least '${requiredRole}' privileges.`)
      );
    }

    next();
  };
};
