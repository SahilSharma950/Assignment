/**
 * Shared frontend TypeScript types & interfaces.
 *
 * Domain-specific types (User, Board, Document, etc.) will be added
 * in their respective task implementations. This file contains
 * foundational utility types used across the application.
 */

// ─── API Response Types ────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: Pagination;
  timestamp: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: ValidationError[];
  statusCode: number;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ─── Common Types ──────────────────────────────────────────────────────────────

export type ID = string;

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  order: SortOrder;
}

export interface FilterOptions {
  [key: string]: string | number | boolean | undefined;
}

// ─── Theme ────────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system';

// ─── Async State ──────────────────────────────────────────────────────────────

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AsyncState {
  status: AsyncStatus;
  error: string | null;
}
