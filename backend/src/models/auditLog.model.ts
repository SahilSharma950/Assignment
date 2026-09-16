import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from '../types/index.js';

export interface IAuditLog extends Document {
  action: string;
  actor: ObjectId;
  entityId?: ObjectId;
  entityModel?: 'User' | 'Workspace' | 'Board' | 'List' | 'Task';
  metadata?: any;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      refPath: 'entityModel',
    },
    entityModel: {
      type: String,
      enum: ['User', 'Workspace', 'Board', 'List', 'Task'],
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Audit logs are immutable, no need for updatedAt
  }
);

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
