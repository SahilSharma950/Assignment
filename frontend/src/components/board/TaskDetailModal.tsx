import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AppDispatch } from '../../store';
import { updateTaskDetails, assignTask, unassignTask } from '../../store/slices/boardSlice';
import type { Task, User } from '../../types/board';
import { attachmentApi, getAttachmentUrl } from '../../api/attachment';
import { useAuth } from '../../context/AuthContext';
import { formatFileSize } from '../../utils';

interface TaskDetailModalProps {
  task: Task | null;
  members: User[];
  onClose: () => void;
}

// Task.dueDate comes back as a full ISO datetime string; <input type="date">
// only understands YYYY-MM-DD.
const toDateInputValue = (iso?: string) => (iso ? iso.slice(0, 10) : '');

// Mirrors the backend's default MAX_FILE_SIZE_MB (config/env.ts) — checked
// client-side purely to fail fast; the server enforces its own limit regardless.
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const TaskDetailModal: FC<TaskDetailModalProps> = ({ task, members, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pendingAssigneeId, setPendingAssigneeId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: attachmentsData } = useQuery({
    queryKey: ['attachments', task?._id],
    queryFn: () => attachmentApi.getByTask(task!._id),
    enabled: !!task,
  });
  const attachments = attachmentsData?.data ?? [];

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(toDateInputValue(task.dueDate));
      setError(null);
    }
  }, [task]);

  if (!task) return null;

  const assigneeIds = new Set(task.assignees.map((a) => a._id));

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title cannot be empty.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await dispatch(
        updateTaskDetails({
          taskId: task._id,
          title: trimmedTitle,
          description,
          ...(dueDate ? { dueDate: new Date(dueDate).toISOString() } : {}),
        }),
      ).unwrap();
      onClose();
    } catch (err: any) {
      setError(typeof err === 'string' ? err : 'Failed to save task. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAssignee = async (member: User) => {
    setPendingAssigneeId(member._id);
    setError(null);
    try {
      if (assigneeIds.has(member._id)) {
        await dispatch(unassignTask({ taskId: task._id, assigneeId: member._id })).unwrap();
      } else {
        await dispatch(assignTask({ taskId: task._id, assigneeId: member._id })).unwrap();
      }
    } catch (err: any) {
      setError(typeof err === 'string' ? err : `Failed to update assignment for ${member.name}.`);
    } finally {
      setPendingAssigneeId(null);
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file next time
    if (!file || !task) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`"${file.name}" is larger than ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      await attachmentApi.upload(task._id, file);
      queryClient.invalidateQueries({ queryKey: ['attachments', task._id] });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!task) return;
    setDeletingAttachmentId(attachmentId);
    setError(null);
    try {
      await attachmentApi.delete(attachmentId);
      queryClient.invalidateQueries({ queryKey: ['attachments', task._id] });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete attachment.');
    } finally {
      setDeletingAttachmentId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-700 rounded-2xl shadow-2xl p-8 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-7">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Task Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more detail..."
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Due date <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all"
            />
            <p className="text-xs text-slate-400">
              Set this to have the task appear in "Upcoming Deadlines" on your dashboard.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assignees</label>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => {
                const isAssigned = assigneeIds.has(member._id);
                return (
                  <button
                    key={member._id}
                    onClick={() => toggleAssignee(member)}
                    disabled={pendingAssigneeId === member._id}
                    className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isAssigned
                        ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-400'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-primary-300 dark:bg-surface-800 dark:border-surface-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white text-[10px] font-bold">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                    {member.name}
                    {isAssigned && <span className="text-primary-500">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Attachments {attachments.length > 0 && `(${attachments.length})`}
              </label>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : '+ Add file'}
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />
            </div>

            {attachments.length === 0 ? (
              <p className="text-sm text-slate-400">No files attached yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {attachments.map((attachment) => (
                  <li
                    key={attachment._id}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-surface-800 border border-slate-200 dark:border-surface-700"
                  >
                    <svg className="w-4 h-4 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 10-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <a
                      href={getAttachmentUrl(attachment.filename)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={attachment.originalName}
                      className="flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:underline"
                    >
                      {attachment.originalName}
                    </a>
                    <span className="text-xs text-slate-400 flex-shrink-0">{formatFileSize(attachment.size)}</span>
                    {attachment.uploadedBy._id === user?._id && (
                      <button
                        onClick={() => handleDeleteAttachment(attachment._id)}
                        disabled={deletingAttachmentId === attachment._id}
                        title="Delete attachment"
                        className="flex-shrink-0 text-slate-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-7">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
