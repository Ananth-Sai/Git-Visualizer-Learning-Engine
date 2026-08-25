'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, X, Check, ArrowUp, ArrowDown, Trash2, Edit3, Layers } from 'lucide-react';
import { useAppStore } from '../../core/engine/StateManager';
import { GitCommit } from '../../core/types';

type RebaseAction = 'pick' | 'squash' | 'reword' | 'drop';

interface RebaseItem {
  id: string;
  action: RebaseAction;
  originalMessage: string;
  newMessage: string;
}

export const InteractiveRebase: React.FC = () => {
  const { isRebaseModalOpen, setRebaseModalOpen, repo, setRepo, executeCommand } = useAppStore();

  const commits = (Object.values(repo.objects).filter((o) => o.type === 'commit') as GitCommit[]).slice(-5);

  const [items, setItems] = useState<RebaseItem[]>(() =>
    commits.map((c) => ({
      id: c.id,
      action: 'pick',
      originalMessage: c.message,
      newMessage: c.message,
    }))
  );

  if (!isRebaseModalOpen) return null;

  const handleActionChange = (id: string, action: RebaseAction) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, action } : item))
    );
  };

  const handleMessageChange = (id: string, msg: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, newMessage: msg } : item))
    );
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setItems(updated);
  };

  const handleApplyRebase = () => {
    // Perform simulated rebase squashing
    const remainingItems = items.filter((i) => i.action !== 'drop');
    if (remainingItems.length === 0) {
      setRebaseModalOpen(false);
      return;
    }

    const objects = { ...repo.objects };
    let parentId = (objects[remainingItems[0].id] as GitCommit)?.parents[0] || '';

    const newObjects: any = {};
    for (const [k, v] of Object.entries(repo.objects)) {
      if (v.type !== 'commit') newObjects[k] = v;
    }

    // Root commit
    const rootCommit = Object.values(repo.objects).find((o: any) => o.type === 'commit' && o.parents.length === 0) as GitCommit;
    if (rootCommit) newObjects[rootCommit.id] = rootCommit;

    let prevId = rootCommit ? rootCommit.id : '';
    let squashedMessage = '';

    for (let i = 0; i < remainingItems.length; i++) {
      const item = remainingItems[i];
      if (item.action === 'squash' && squashedMessage) {
        squashedMessage += ` + ${item.newMessage}`;
        // Update previous commit with combined message
        if (newObjects[prevId]) {
          newObjects[prevId].message = squashedMessage;
        }
      } else {
        squashedMessage = item.newMessage;
        const newCommitId = `rb-${item.id.slice(0, 5)}`;
        newObjects[newCommitId] = {
          id: newCommitId,
          type: 'commit',
          tree: 'tree-rebased',
          parents: prevId ? [prevId] : [],
          author: { name: 'Developer', email: 'dev@gitfluid.io', timestamp: Date.now() },
          message: squashedMessage,
          branchTag: repo.head.target,
        };
        prevId = newCommitId;
      }
    }

    const refs = { ...repo.refs, heads: { ...repo.refs.heads } };
    if (repo.head.type === 'branch') {
      refs.heads[repo.head.target] = prevId;
    }

    setRepo({
      ...repo,
      objects: newObjects,
      refs,
    });

    setRebaseModalOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="w-full max-w-3xl rounded-2xl glass-panel-elevated shadow-2xl overflow-hidden border border-purple-500/30 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-purple-500/10 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <GitBranch className="text-purple-400" size={20} />
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <span>Interactive Rebase Studio (`git rebase -i`)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Pick, squash, reorder, or drop commits to produce a clean linear story.
                </p>
              </div>
            </div>

            <button
              onClick={() => setRebaseModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Commit Rebase List */}
          <div className="flex-1 p-6 overflow-y-auto space-y-3 bg-slate-950/90 text-xs">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                  item.action === 'drop'
                    ? 'bg-rose-500/10 border-rose-500/30 opacity-50'
                    : item.action === 'squash'
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-slate-900/80 border-white/5'
                }`}
              >
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === items.length - 1}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>

                {/* Action Selector */}
                <select
                  value={item.action}
                  onChange={(e) => handleActionChange(item.id, e.target.value as RebaseAction)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 font-mono font-bold text-xs uppercase tracking-wider text-purple-300 outline-none"
                >
                  <option value="pick">pick</option>
                  <option value="squash">squash</option>
                  <option value="reword">reword</option>
                  <option value="drop">drop</option>
                </select>

                <span className="font-mono text-slate-400 text-xs">{item.id.slice(0, 7)}</span>

                {/* Message Editor */}
                <input
                  type="text"
                  value={item.newMessage}
                  onChange={(e) => handleMessageChange(item.id, e.target.value)}
                  disabled={item.action === 'drop'}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-700/60 text-slate-200 text-xs focus:border-purple-500 outline-none font-sans"
                />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-white/5">
            <span className="text-xs text-slate-400">
              {items.filter((i) => i.action === 'squash').length} commit(s) marked for squash
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setRebaseModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyRebase}
                className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-500/20"
              >
                <Check size={16} />
                <span>Apply Rebase Replay</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
