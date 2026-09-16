import { auditLogRepository } from '../repositories/auditLog.repository.js';
import { IAuditLog } from '../models/auditLog.model.js';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

class AuditLogService {
  /**
   * Fire-and-forget logging utility for system events.
   * We do not want to block or fail core API requests if audit logging fails,
   * so we catch and log internally.
   */
  logAction(
    actorId: string,
    action: string,
    entityId?: string,
    entityModel?: 'User' | 'Workspace' | 'Board' | 'List' | 'Task',
    metadata?: any
  ): void {
    const logData: Partial<IAuditLog> = {
      action,
      actor: new mongoose.Types.ObjectId(actorId),
      metadata,
    };

    if (entityId) logData.entityId = new mongoose.Types.ObjectId(entityId);
    if (entityModel) logData.entityModel = entityModel;

    auditLogRepository.create(logData).catch((error) => {
      logger.error('Failed to create audit log:', error);
    });
  }
}

export const auditLogService = new AuditLogService();
