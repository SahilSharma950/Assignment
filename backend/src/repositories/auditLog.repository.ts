import { AuditLogModel as AuditLog, IAuditLog } from '../models/auditLog.model.js';

class AuditLogRepository {
  /**
   * Insert a new audit log.
   */
  async create(data: Partial<IAuditLog>): Promise<IAuditLog> {
    return AuditLog.create(data);
  }

  /**
   * Fetch recent audit logs (e.g. for an admin dashboard or workspace activity feed).
   */
  async getRecent(limit: number = 100, query: any = {}): Promise<IAuditLog[]> {
    return AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('actor', 'name email');
  }
}

export const auditLogRepository = new AuditLogRepository();
