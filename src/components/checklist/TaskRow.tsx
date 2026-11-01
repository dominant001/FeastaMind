import React from 'react';
import {
  Link2,
  Coins,
  AlertTriangle,
  User,
  Clock,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TaskItem, TaskStatus, TeamMember } from '../../types';
import { ChecklistEngine } from '../../domain/checklistEngine';
import { formatINR } from '../../utils/currency';

interface TaskRowProps {
  task: TaskItem;
  eventTasks: TaskItem[];
  teamMembers: TeamMember[];
  eventDate?: string;
  isExpanded: boolean;
  toggleTaskExpanded: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  handleQuickAssignOwner: (taskId: string, ownerId: string) => void;
  setDepModalTask: (task: TaskItem) => void;
  handleOpenAIExpansion: (categoryName?: string) => void;
  deleteTask: (taskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  eventTasks,
  teamMembers,
  eventDate,
  isExpanded,
  toggleTaskExpanded,
  updateTaskStatus,
  handleQuickAssignOwner,
  setDepModalTask,
  handleOpenAIExpansion,
  deleteTask,
  toggleSubtask,
}) => {
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubCount = task.subtasks ? task.subtasks.filter((st) => st.completed).length : 0;
  const prereqs = ChecklistEngine.evaluatePrerequisites(task, eventTasks);
  const dateInfo = ChecklistEngine.calculateMilestoneDate(eventDate, task.relativeOffsetDays, 'Asia/Kolkata');

  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden shadow-xs transition-all ${
        prereqs.isBlocked
          ? 'border-amber-300/80 bg-amber-50/10'
          : 'border-[#231530]/10 hover:border-[#231530]/25'
      }`}
    >
      {/* Main Task Header Row */}
      <div className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={task.status === 'completed'}
          onChange={() =>
            updateTaskStatus(
              task.id,
              task.status === 'completed' ? 'todo' : 'completed'
            )
          }
          className="mt-1 w-4 h-4 rounded-md accent-[#E06D28] cursor-pointer shrink-0"
        />

        {/* Body Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              className={`text-sm sm:text-base font-semibold ${
                task.status === 'completed'
                  ? 'line-through text-[#231530]/40'
                  : 'text-[#231530]'
              }`}
            >
              {task.title}
            </h4>

            {task.priority === 'high' && (
              <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200/50 px-1.5 py-0.5 rounded-sm font-semibold uppercase">
                High Priority
              </span>
            )}

            {/* Prerequisite & Blocked Badges */}
            {task.dependsOnIds && task.dependsOnIds.length > 0 && (
              <button
                onClick={() => setDepModalTask(task)}
                className={`text-[10px] px-1.5 py-0.5 rounded-sm flex items-center gap-1 font-mono cursor-pointer border ${
                  prereqs.isBlocked
                    ? 'text-amber-800 bg-amber-100 border-amber-300 font-bold'
                    : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                }`}
                title="Click to view or edit task prerequisites"
              >
                <Link2 className="w-3 h-3" />
                <span>
                  {prereqs.isBlocked
                    ? `Blocked (${prereqs.pendingDependencies.length} pending)`
                    : `Chained (${prereqs.completedCount}/${prereqs.totalCount})`}
                </span>
              </button>
            )}

            {/* Estimated Expense Badge */}
            {task.estimatedCost !== undefined && task.estimatedCost > 0 && (
              <span
                className="text-[10px] text-[#231530]/80 bg-[#FAF7F2] border border-[#231530]/10 px-1.5 py-0.5 rounded-sm flex items-center gap-1 font-mono"
                title="Estimated task operational budget"
              >
                <Coins className="w-3 h-3 text-[#E06D28]" />
                <span>{formatINR(task.estimatedCost)}</span>
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-[#231530]/70 mt-1 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Blocked Explanation Alert */}
          {prereqs.isBlocked && (
            <div className="mt-2 text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200 rounded-lg p-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                Waiting on prerequisite: <strong>{prereqs.pendingDependencies[0]?.title}</strong>
              </span>
            </div>
          )}

          {/* Metadata Line */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#231530]/60 mt-2">
            <span className="font-medium text-[#231530]/80">{task.categoryName}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <User className="w-3.5 h-3.5 text-[#E06D28] shrink-0" />
              <select
                value={task.ownerId || ''}
                onChange={(e) => handleQuickAssignOwner(task.id, e.target.value)}
                className="text-xs font-medium text-[#231530] bg-[#FAF7F2] border border-[#231530]/15 hover:border-[#E06D28]/40 rounded-lg px-2 py-0.5 focus:outline-hidden focus:border-[#E06D28] cursor-pointer"
                title="Assign task to team member"
              >
                <option value="">Unassigned</option>
                {['family', 'office', 'community', 'volunteers'].map((dirKey) => {
                  const dirMembers = teamMembers.filter((m) => (m.directoryType || 'family') === dirKey);
                  if (dirMembers.length === 0) return null;
                  const groupLabels: Record<string, string> = {
                    family: 'Family Roster',
                    office: 'Office Colleagues',
                    community: 'Community & Society',
                    volunteers: 'Volunteers & Marshals',
                  };
                  return (
                    <optgroup key={dirKey} label={groupLabels[dirKey] || dirKey}>
                      {dirMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.relation})
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
              {task.ownerId && (() => {
                const m = teamMembers.find((mem) => mem.id === task.ownerId);
                const dir = m?.directoryType || task.directoryType || 'family';
                const dirLabels: Record<string, string> = {
                  family: 'Family',
                  office: 'Office',
                  community: 'Community',
                  volunteers: 'Volunteer',
                };
                return (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-xs bg-[#231530]/10 text-[#231530]/80 uppercase">
                    {dirLabels[dir] || dir}
                  </span>
                );
              })()}
            </span>
            <span>·</span>
            {/* Date / Milestone Display */}
            <span className="flex items-center gap-1 font-mono text-[#231530]/80" title={dateInfo.relativeDaysLabel}>
              <Clock className="w-3 h-3 text-[#231530]/50" />
              <span>{dateInfo.formattedDisplay}</span>
            </span>
            {hasSubtasks && (
              <>
                <span>·</span>
                <span className="text-[#E06D28] font-semibold">
                  {completedSubCount}/{task.subtasks.length} Subtasks
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setDepModalTask(task)}
            className="p-1.5 text-[#231530]/50 hover:text-[#231530] rounded-lg transition-colors cursor-pointer"
            title="Manage Task Dependencies"
          >
            <Link2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleOpenAIExpansion(task.categoryName)}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-[#FAF7F2] hover:bg-[#E06D28]/10 text-[#231530] hover:text-[#E06D28] border border-[#231530]/10 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Generate granular microtasks for this category"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E06D28]" />
            <span>Expand</span>
          </button>

          <button
            onClick={() => deleteTask(task.id)}
            className="p-1.5 text-[#231530]/40 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {hasSubtasks && (
            <button
              onClick={() => toggleTaskExpanded(task.id)}
              className="p-1.5 text-[#231530]/60 hover:text-[#231530] rounded-lg transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Subtasks Drawer */}
      {isExpanded && hasSubtasks && (
        <div className="bg-[#FAF7F2]/60 border-t border-[#231530]/10 p-4 sm:p-5 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#231530]/60 mb-2">
            Microtask Action Items ({completedSubCount}/{task.subtasks.length} Completed)
          </div>
          <div className="space-y-1.5">
            {task.subtasks.map((st) => (
              <label
                key={st.id}
                className="flex items-center gap-2.5 text-xs text-[#231530] hover:bg-white/80 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={st.completed}
                  onChange={() => toggleSubtask(task.id, st.id)}
                  className="w-3.5 h-3.5 rounded-xs accent-[#E06D28] shrink-0"
                />
                <span className={st.completed ? 'line-through text-[#231530]/40' : 'text-[#231530]'}>
                  {st.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
