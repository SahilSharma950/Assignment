import { AttachmentModel as Attachment, IAttachment } from '../models/attachment.model.js';
import { ObjectId } from '../types/index.js';
import mongoose from 'mongoose';

class AttachmentRepository {
  /**
   * Creates a new attachment record.
   */
  async create(data: Partial<IAttachment>, session?: mongoose.ClientSession): Promise<IAttachment> {
    const options = session ? { session } : {};
    const attachments = await Attachment.create([data], options);
    return attachments[0] as IAttachment;
  }

  /**
   * Finds an attachment by ID.
   */
  async findById(id: string | ObjectId, session?: mongoose.ClientSession): Promise<IAttachment | null> {
    let query = Attachment.findById(id);
    if (session) query = query.session(session);
    return query.populate('uploadedBy', 'name email avatar');
  }

  /**
   * Finds all attachments for a specific task.
   */
  async findByTask(taskId: string | ObjectId, session?: mongoose.ClientSession): Promise<IAttachment[]> {
    let query = Attachment.find({ task: taskId }).sort({ createdAt: -1 });
    if (session) query = query.session(session);
    return query.populate('uploadedBy', 'name email avatar');
  }

  /**
   * Deletes an attachment by ID.
   */
  async delete(id: string | ObjectId, session?: mongoose.ClientSession): Promise<IAttachment | null> {
    const options: any = {};
    if (session) options.session = session;
    const attachment = await Attachment.findByIdAndDelete(id, options);
    return attachment as IAttachment | null;
  }

  /**
   * Finds every attachment on the given tasks (for cascade deletes — need the
   * filenames before the records are gone so the physical files can be cleaned up).
   */
  async findByTasks(taskIds: (string | ObjectId)[]): Promise<IAttachment[]> {
    return Attachment.find({ task: { $in: taskIds } });
  }

  /**
   * Deletes every attachment record on the given tasks (for cascade deletes).
   */
  async deleteByTasks(taskIds: (string | ObjectId)[]): Promise<void> {
    await Attachment.deleteMany({ task: { $in: taskIds } });
  }
}

export const attachmentRepository = new AttachmentRepository();
