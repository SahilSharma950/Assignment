/**
 * Shared backend TypeScript types & interfaces.
 *
 * Domain-specific types (User, Board, Message, etc.) will be added
 * in their respective task implementations. This file contains
 * foundational types used across controllers, services, and repositories.
 */

import type { Request } from 'express';
import type { Document, Types } from 'mongoose';

// ─── MongoDB Document Types ────────────────────────────────────────────────────

export type ObjectId = Types.ObjectId;

export interface BaseDocument extends Document {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ValidationError[];
  statusCode: number;
  timestamp: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ValidationError {
  field: string;
  message: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── RBAC Types ───────────────────────────────────────────────────────────────

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

// ─── Authenticated Request ─────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  workspaces: string[];
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.login'
  | 'user.logout'
  | 'workspace.created'
  | 'workspace.updated'
  | 'workspace.deleted'
  | 'board.created'
  | 'board.updated'
  | 'board.deleted'
  | 'card.created'
  | 'card.updated'
  | 'card.deleted'
  | 'document.created'
  | 'document.updated'
  | 'document.deleted'
  | 'channel.created'
  | 'channel.deleted'
  | 'message.created'
  | 'message.deleted'
  | 'member.invited'
  | 'member.removed'
  | 'role.changed'
  | 'file.uploaded'
  | 'file.deleted';

export interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
