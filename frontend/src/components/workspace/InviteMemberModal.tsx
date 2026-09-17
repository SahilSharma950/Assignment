import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '../../api/workspace';
import { userApi, type UserSummary } from '../../api/user';

interface InviteMemberModalProps {
  isOpen: boolean;
  workspaceId: string;
  onClose: () => void;
  onInvited: () => void;
}

export const InviteMemberModal: FC<InviteMemberModalProps> = ({ isOpen, workspaceId, onClose, onInvited }) => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: userApi.list,
    enabled: isOpen,
  });

  const { data: membersData } = useQuery({
    queryKey: ['workspaceMembers', workspaceId],
    queryFn: () => workspaceApi.getMembers(workspaceId),
    enabled: isOpen && !!workspaceId,
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setAddedIds(new Set());
      setError(null);
    }
  }, [isOpen]);

  const ownerId = membersData?.data.owner._id;

  const existingMemberIds = useMemo(() => {
    const ids = new Set<string>();
    if (membersData?.data) {
      ids.add(membersData.data.owner._id);
      membersData.data.members.forEach((m) => ids.add(m._id));
    }
    return ids;
  }, [membersData]);

  // Members shown in the "current members" section — everyone except the owner,
  // since the owner is implicit and can't be removed.
  const removableMembers = useMemo(
    () => (membersData?.data.members ?? []).filter((m) => m._id !== ownerId),
    [membersData, ownerId],
  );

  const candidates = useMemo(() => {
    const all = usersData?.data ?? [];
    const trimmed = query.trim().toLowerCase();
    return all
      .filter((u) => !existingMemberIds.has(u._id))
      .filter((u) => !trimmed || u.name.toLowerCase().includes(trimmed) || u.email.toLowerCase().includes(trimmed));
  }, [usersData, existingMemberIds, query]);

  if (!isOpen) return null;

  const refreshMembers = () => {
    queryClient.invalidateQueries({ queryKey: ['workspaceMembers', workspaceId] });
    onInvited();
  };

  const handleAdd = async (user: UserSummary) => {
    setPendingId(user._id);
    setError(null);
    try {
      await workspaceApi.addMember(workspaceId, user.email);
      setAddedIds((prev) => new Set(prev).add(user._id));
      refreshMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to add ${user.name}. Please try again.`);
    } finally {
      setPendingId(null);
    }
  };

  const handleRemove = async (user: UserSummary) => {
    if (!window.confirm(`Remove ${user.name} from this workspace?`)) return;
    setPendingId(user._id);
    setError(null);
    try {
      await workspaceApi.removeMember(workspaceId, user._id);
      refreshMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to remove ${user.name}. Please try again.`);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-700 rounded-2xl shadow-2xl p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-7">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manage Members</h2>
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

        {/* Current Members */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase text-slate-400 mb-2">
            Current Members {membersData ? `(${removableMembers.length + 1})` : ''}
          </h3>
          <div className="space-y-1 max-h-40 overflow-y-auto -mx-2">
            {membersData?.data.owner && (
              <div className="flex items-center justify-between gap-3 px-2 py-2 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-accent-500 to-primary-500 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                    {membersData.data.owner.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {membersData.data.owner.name} <span className="text-slate-400 font-normal">(Owner)</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{membersData.data.owner.email}</p>
                  </div>
                </div>
              </div>
            )}
            {removableMembers.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-800 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{member.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{member.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(member)}
                  disabled={pendingId === member._id}
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pendingId === member._id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add People */}
        <div>
          <h3 className="text-xs font-semibold uppercase text-slate-400 mb-2">Add People</h3>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all"
          />

          <div className="mt-3 max-h-56 overflow-y-auto space-y-1 -mx-2">
            {usersLoading ? (
              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">Loading users...</div>
            ) : candidates.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {query.trim() ? 'No matching users found.' : 'Everyone with an account is already in this workspace.'}
              </div>
            ) : (
              candidates.map((user) => {
                const justAdded = addedIds.has(user._id);
                return (
                  <div
                    key={user._id}
                    className="flex items-center justify-between gap-3 px-2 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-surface-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAdd(user)}
                      disabled={pendingId === user._id || justAdded}
                      className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:cursor-not-allowed ${
                        justAdded
                          ? 'bg-success-500/10 text-success-600 dark:text-success-400'
                          : 'bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30 disabled:opacity-50'
                      }`}
                    >
                      {justAdded ? 'Added ✓' : pendingId === user._id ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
