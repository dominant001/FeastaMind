import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Plus,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
  Link2,
} from 'lucide-react';
import { TaskItem, TaskPriority, TaskStatus, DirectoryType } from '../../types';
import { ChecklistEngine } from '../../domain/checklistEngine';
import { ChecklistClient } from '../../services/checklistClient';
import { SuggestionResponse, AuditResponse, AuditIssue } from '../../server/checklist/checklistAdvisor';
import { TaskFilters } from '../checklist/TaskFilters';
import { TaskRow } from '../checklist/TaskRow';

export const ChecklistScreen: React.FC = () => {
  const {
    activeEvent,
    tasks,
    teamMembers,
    categories,
    toggleSubtask,
    updateTaskStatus,
    updateTask,
    addTask,
    addMultipleTasks,
    deleteTask,
    setEventDate,
    showToast,
  } = useApp();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [selectedDirectory, setSelectedDirectory] = useState<string>('all');
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({
    'task-groom-1': true,
    'task-groom-3': true,
    'task-inv-4': true,
  });

  // Date editing state
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dateInput, setDateInput] = useState(activeEvent.eventDate || '');

  // New task form state
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    categoryName: 'Groom',
    categoryId: 'groom',
    subcategoryName: 'Attire & Styling',
    priority: 'medium' as TaskPriority,
    ownerId: '',
    directoryType: 'family' as DirectoryType,
    description: '',
    relativeOffsetDays: -15,
    estimatedCost: 0,
    linkedBudgetCategoryId: '',
  });

  // AI Task Expansion Preview State & Assignees
  const [expansionLoading, setExpansionLoading] = useState(false);
  const [expansionModalOpen, setExpansionModalOpen] = useState(false);
  const [expansionData, setExpansionData] = useState<SuggestionResponse | null>(null);
  const [selectedCandidateIndices, setSelectedCandidateIndices] = useState<Record<number, boolean>>({});
  const [candidateOwners, setCandidateOwners] = useState<Record<number, string>>({});
  const [defaultExpansionOwnerId, setDefaultExpansionOwnerId] = useState<string>('');

  // Checklist Audit State & Assignees
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [auditBannerDismissed, setAuditBannerDismissed] = useState(false);
  const [auditIssueAssignees, setAuditIssueAssignees] = useState<Record<string, string>>({});

  // Quick Inline Task Assignment
  const handleQuickAssignOwner = async (taskId: string, newOwnerId: string) => {
    const assignedMember = teamMembers.find((m) => m.id === newOwnerId);
    await updateTask(taskId, {
      ownerId: assignedMember ? assignedMember.id : undefined,
      ownerName: assignedMember ? assignedMember.name : undefined,
      ownerRole: assignedMember ? assignedMember.relation : undefined,
      directoryType: assignedMember ? assignedMember.directoryType : undefined,
    });
    if (assignedMember) {
      showToast(`Assigned to ${assignedMember.name} (${assignedMember.relation})`, 'info');
    } else {
      showToast('Task marked unassigned', 'info');
    }
  };

  // Dependency Management Modal State
  const [depModalTask, setDepModalTask] = useState<TaskItem | null>(null);
  const [depError, setDepError] = useState<string | null>(null);

  const eventTasks = tasks.filter((t) => t.eventId === activeEvent.id);

  // Calculate overall and category leaf task progress
  const leafProgress = ChecklistEngine.calculateLeafProgress(eventTasks);

  // Categories list
  const availableCategories = Array.from(new Set(eventTasks.map((t) => t.categoryName)));

  // Filtered tasks
  const filteredTasks = eventTasks.filter((t) => {
    if (selectedCategory !== 'all' && t.categoryName.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (selectedStatus === 'completed' && t.status !== 'completed') return false;
    if (selectedStatus === 'pending' && t.status === 'completed') return false;
    if (selectedStatus === 'high' && t.priority !== 'high') return false;
    if (selectedStatus === 'blocked') {
      const prereqs = ChecklistEngine.evaluatePrerequisites(t, eventTasks);
      if (!prereqs.isBlocked) return false;
    }
    if (selectedOwner !== 'all' && t.ownerId !== selectedOwner) return false;
    if (selectedDirectory !== 'all') {
      const ownerMember = teamMembers.find((m) => m.id === t.ownerId);
      const taskDir = ownerMember?.directoryType || t.directoryType || 'family';
      if (taskDir !== selectedDirectory) return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q) || false;
      const matchSub = t.subtasks?.some((st) => st.title.toLowerCase().includes(q)) || false;
      const matchOwner = t.ownerName?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc && !matchSub && !matchOwner) return false;
    }
    return true;
  });

  // Group filtered tasks by Subcategory
  const subcategoryGroups: Record<string, TaskItem[]> = {};
  filteredTasks.forEach((t) => {
    const sub = t.subcategoryName || 'General Logistics';
    if (!subcategoryGroups[sub]) {
      subcategoryGroups[sub] = [];
    }
    subcategoryGroups[sub].push(t);
  });

  const toggleTaskExpanded = (id: string) => {
    setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Trigger AI Microtask Expansion
  const handleOpenAIExpansion = async (categoryTarget?: string) => {
    const targetCat = categoryTarget || (selectedCategory !== 'all' ? selectedCategory : 'Groom');
    setExpansionLoading(true);
    setExpansionModalOpen(true);
    setExpansionData(null);
    setSelectedCandidateIndices({});
    setCandidateOwners({});
    setDefaultExpansionOwnerId('');

    try {
      const idToken = user ? await user.getIdToken().catch(() => undefined) : undefined;
      const res = await ChecklistClient.requestTaskExpansion({
        eventContext: {
          name: activeEvent.name,
          type: activeEvent.type,
          city: activeEvent.city,
          guestCount: activeEvent.guestCount,
          eventDate: activeEvent.eventDate,
        },
        category: targetCat,
        existingTasks: eventTasks,
        idToken,
      });

      setExpansionData(res);
      const initialSelection: Record<number, boolean> = {};
      res.suggestions.forEach((s, idx) => {
        initialSelection[idx] = !s.isDuplicate;
      });
      setSelectedCandidateIndices(initialSelection);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast('Could not load AI task expansion: ' + message, 'error');
      setExpansionModalOpen(false);
    } finally {
      setExpansionLoading(false);
    }
  };

  // Confirm and Import Selected AI Tasks
  const handleImportSelectedAITasks = async () => {
    if (!expansionData) return;

    const toAdd: Omit<TaskItem, 'id'>[] = [];
    expansionData.suggestions.forEach((s, idx) => {
      if (!selectedCandidateIndices[idx]) return;
      const ownerId = candidateOwners[idx] !== undefined ? candidateOwners[idx] : defaultExpansionOwnerId;
      const assignedMember = teamMembers.find((m) => m.id === ownerId);

      toAdd.push({
        eventId: activeEvent.id,
        categoryId: expansionData.category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        categoryName: expansionData.category,
        subcategoryName: s.subcategoryName || 'AI Expansion',
        title: s.title,
        description: s.description ? `${s.description} (Operational rationale: ${s.rationale})` : s.rationale,
        status: 'todo' as TaskStatus,
        priority: s.priority,
        ownerId: assignedMember ? assignedMember.id : undefined,
        ownerName: assignedMember ? assignedMember.name : undefined,
        ownerRole: assignedMember ? assignedMember.relation : undefined,
        directoryType: assignedMember ? assignedMember.directoryType : undefined,
        relativeOffsetDays: s.relativeOffsetDays,
        estimatedCost: s.estimatedCost,
        dependsOnIds: [],
        subtasks: [
          {
            id: `st-init-${Date.now()}-${idx}`,
            title: 'Initial vendor briefing & schedule lock',
            completed: false,
          },
        ],
      });
    });

    if (toAdd.length === 0) {
      showToast('No tasks selected for import.', 'warning');
      return;
    }

    await addMultipleTasks(toAdd);
    const assignedCount = toAdd.filter((t) => t.ownerId).length;
    showToast(
      assignedCount > 0
        ? `Imported ${toAdd.length} AI microtasks (${assignedCount} assigned to team members).`
        : `Imported ${toAdd.length} AI microtasks to checklist.`,
      'success'
    );
    setExpansionModalOpen(false);
    setExpansionData(null);
  };

  // Run Gap / Blindspot Audit
  const handleRunAudit = async () => {
    setAuditLoading(true);
    try {
      const idToken = user ? await user.getIdToken().catch(() => undefined) : undefined;
      const res = await ChecklistClient.requestChecklistAudit({
        eventContext: {
          name: activeEvent.name,
          type: activeEvent.type,
          city: activeEvent.city,
          guestCount: activeEvent.guestCount,
          eventDate: activeEvent.eventDate,
        },
        tasks: eventTasks,
        idToken,
      });
      setAuditData(res);
      setAuditBannerDismissed(false);
      showToast(`Checklist audit complete: Found ${res.totalIssues} operational insights.`, 'info');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      showToast('Failed to audit checklist: ' + message, 'error');
    } finally {
      setAuditLoading(false);
    }
  };

  // Add Task recommended by Audit
  const handleAddAuditRecommendedTask = async (issue: AuditIssue, assignedOwnerId?: string) => {
    const ownerIdToUse = assignedOwnerId || auditIssueAssignees[issue.id];
    const assignedMember = teamMembers.find((m) => m.id === ownerIdToUse);

    await addTask({
      eventId: activeEvent.id,
      categoryId: issue.category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      categoryName: issue.category,
      subcategoryName: 'Critical Safeguard',
      title: issue.title,
      description: `${issue.description} Recommendation: ${issue.recommendation}`,
      status: 'todo',
      priority: issue.severity === 'critical' ? 'high' : 'medium',
      ownerId: assignedMember ? assignedMember.id : undefined,
      ownerName: assignedMember ? assignedMember.name : undefined,
      ownerRole: assignedMember ? assignedMember.relation : undefined,
      directoryType: assignedMember ? assignedMember.directoryType : undefined,
      relativeOffsetDays: -14,
      dependsOnIds: [],
      subtasks: [
        {
          id: `st-audit-${Date.now()}`,
          title: issue.recommendation,
          completed: false,
        },
      ],
    });

    if (auditData) {
      setAuditData({
        ...auditData,
        issues: auditData.issues.filter((i: AuditIssue) => i.id !== issue.id),
        totalIssues: auditData.totalIssues - 1,
      });
    }
    showToast(
      assignedMember
        ? `Added safeguard task assigned to ${assignedMember.name}.`
        : 'Added safeguard task to checklist.',
      'success'
    );
  };

  // Create Task Form Handler
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskData.title.trim()) return;

    const assignedMember = teamMembers.find((m) => m.id === newTaskData.ownerId);

    addTask({
      eventId: activeEvent.id,
      title: newTaskData.title.trim(),
      categoryId: newTaskData.categoryId,
      categoryName: newTaskData.categoryName,
      subcategoryName: newTaskData.subcategoryName,
      status: 'todo',
      priority: newTaskData.priority,
      ownerId: newTaskData.ownerId || undefined,
      ownerName: assignedMember ? assignedMember.name : undefined,
      ownerRole: assignedMember ? assignedMember.relation : undefined,
      relativeOffsetDays: Number(newTaskData.relativeOffsetDays),
      estimatedCost: Number(newTaskData.estimatedCost) || undefined,
      linkedBudgetCategoryId: newTaskData.linkedBudgetCategoryId || undefined,
      dependsOnIds: [],
      subtasks: [
        {
          id: `st-init-${Date.now()}`,
          title: 'Initial setup & vendor confirmation',
          completed: false,
        },
      ],
    });

    setNewTaskModalOpen(false);
    setNewTaskData({
      title: '',
      categoryName: 'Groom',
      categoryId: 'groom',
      subcategoryName: 'Attire & Styling',
      priority: 'medium',
      ownerId: '',
      directoryType: 'family',
      description: '',
      relativeOffsetDays: -15,
      estimatedCost: 0,
      linkedBudgetCategoryId: '',
    });
  };

  // Toggle Dependency in Modal with Cycle Prevention
  const handleToggleDependency = async (candidatePrereqId: string) => {
    if (!depModalTask) return;
    setDepError(null);

    const isCurrentDep = depModalTask.dependsOnIds.includes(candidatePrereqId);
    if (isCurrentDep) {
      const updatedDeps = depModalTask.dependsOnIds.filter((id) => id !== candidatePrereqId);
      await updateTask(depModalTask.id, { dependsOnIds: updatedDeps });
      setDepModalTask({ ...depModalTask, dependsOnIds: updatedDeps });
    } else {
      const cycleCheck = ChecklistEngine.detectCycle(eventTasks, depModalTask.id, candidatePrereqId);
      if (cycleCheck.hasCycle) {
        setDepError(
          `Cannot link prerequisite: ${cycleCheck.reason || 'Circular dependency graph detected.'}`
        );
        return;
      }
      const updatedDeps = [...depModalTask.dependsOnIds, candidatePrereqId];
      await updateTask(depModalTask.id, { dependsOnIds: updatedDeps });
      setDepModalTask({ ...depModalTask, dependsOnIds: updatedDeps });
    }
  };

  const handleSaveDate = async () => {
    await setEventDate(dateInput);
    setIsEditingDate(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E06D28]">
            <span>Hierarchical Event Execution</span>
            <span className="text-[#231530]/40">·</span>
            <span className="text-[#231530]/60">Strict Dependency Tracking</span>
            <span className="text-[#231530]/40">·</span>
            <span className="text-[#231530]/60">Asia/Kolkata IST Milestones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#231530] font-display">
            Smart Checklist & Timeline Intelligence
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Leaf Completion Badge */}
          <div className="px-3.5 py-2 bg-white border border-[#231530]/10 rounded-xl text-xs font-mono shadow-xs">
            <span className="text-[#231530]/60">Leaf Completion: </span>
            <strong className="text-[#E06D28] font-bold">
              {leafProgress.completedLeaves}/{leafProgress.totalLeaves} ({leafProgress.percentage}%)
            </strong>
          </div>

          {/* AI Gap Audit Button */}
          <button
            onClick={handleRunAudit}
            disabled={auditLoading}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Scan checklist against municipal, power, and accessibility blindspots"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>{auditLoading ? 'Auditing...' : 'Audit Blindspots'}</span>
          </button>

          {/* AI Suggest Microtasks Button */}
          <button
            onClick={() => handleOpenAIExpansion()}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Preview AI recommended microtasks for this category"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Suggest Tasks</span>
          </button>

          {/* Add Custom Task */}
          <button
            onClick={() => setNewTaskModalOpen(true)}
            className="px-4 py-2 bg-[#E06D28] hover:bg-[#C4551D] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Date Uncertainty & Timezone Status Banner */}
      <div className="p-4 bg-white border border-[#231530]/10 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${activeEvent.eventDate ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              {activeEvent.eventDate ? (
                <div>
                  <span className="text-xs font-bold text-emerald-800">
                    Celebration Date Locked: {ChecklistEngine.calculateMilestoneDate(activeEvent.eventDate, 0, 'Asia/Kolkata').formattedDisplay}
                  </span>
                  <p className="text-[11px] text-[#231530]/65">
                    All milestone deadlines are dynamically calculated relative to this anchor in Indian Standard Time (IST).
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-xs font-bold text-amber-800">
                    Celebration Date Unconfirmed (Date Uncertainty Guard Active)
                  </span>
                  <p className="text-[11px] text-[#231530]/65">
                    Tasks are displayed strictly as relative milestones (e.g. T-60 days before event). No arbitrary calendar dates are invented.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditingDate ? (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#231530]/20 rounded-lg focus:border-[#E06D28] focus:outline-hidden"
                />
                <button
                  onClick={handleSaveDate}
                  className="px-3 py-1.5 bg-[#E06D28] text-white text-xs font-semibold rounded-lg hover:bg-[#C4551D] cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingDate(false)}
                  className="px-2.5 py-1.5 bg-gray-100 text-[#231530]/70 text-xs rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setDateInput(activeEvent.eventDate || '');
                  setIsEditingDate(true);
                }}
                className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#231530]/5 text-[#231530] text-xs font-medium border border-[#231530]/15 rounded-lg transition-colors cursor-pointer"
              >
                {activeEvent.eventDate ? 'Change Date' : 'Set Event Date'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Checklist Audit Results Banner */}
      {auditData && !auditBannerDismissed && (
        <div className="bg-indigo-950 text-white rounded-2xl p-5 shadow-sm space-y-4 border border-indigo-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold tracking-tight">
                  Checklist Operational Audit ({auditData.totalIssues} Insights Found)
                </h3>
                <p className="text-[11px] text-indigo-200">
                  {auditData.disclaimer}
                </p>
              </div>
            </div>
            <button
              onClick={() => setAuditBannerDismissed(true)}
              className="text-indigo-300 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {auditData.issues.map((issue) => (
              <div
                key={issue.id}
                className="bg-indigo-900/60 border border-indigo-700/50 rounded-xl p-3.5 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-indigo-800 text-indigo-200">
                      {issue.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-xs ${
                        issue.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {issue.severity}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white mt-1.5">{issue.title}</h4>
                  <p className="text-[11px] text-indigo-200/90 mt-1 leading-relaxed">{issue.description}</p>
                </div>

                <div className="pt-2 border-t border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <User className="w-3 h-3 text-amber-400 shrink-0" />
                    <select
                      value={auditIssueAssignees[issue.id] || ''}
                      onChange={(e) => setAuditIssueAssignees((prev) => ({ ...prev, [issue.id]: e.target.value }))}
                      className="bg-indigo-950/80 border border-indigo-700 text-indigo-100 text-[10px] rounded-lg px-2 py-1 max-w-[170px] truncate cursor-pointer"
                    >
                      <option value="">Assign Lead...</option>
                      <optgroup label="Family Roster">
                        {teamMembers.filter((m) => m.directoryType === 'family').map((m) => (
                          <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>
                        ))}
                      </optgroup>
                      <optgroup label="Office Colleagues">
                        {teamMembers.filter((m) => m.directoryType === 'office').map((m) => (
                          <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>
                        ))}
                      </optgroup>
                      <optgroup label="Community & Society">
                        {teamMembers.filter((m) => m.directoryType === 'community').map((m) => (
                          <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>
                        ))}
                      </optgroup>
                      <optgroup label="Volunteers & Marshals">
                        {teamMembers.filter((m) => m.directoryType === 'volunteers').map((m) => (
                          <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <button
                    onClick={() => handleAddAuditRecommendedTask(issue)}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-[#231530] text-[10px] font-bold rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    + Add Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar Component */}
      <TaskFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedDirectory={selectedDirectory}
        setSelectedDirectory={setSelectedDirectory}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedOwner={selectedOwner}
        setSelectedOwner={setSelectedOwner}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        eventTasks={eventTasks}
        availableCategories={availableCategories}
        teamMembers={teamMembers}
      />

      {/* Grouped Hierarchical Task View */}
      <div className="space-y-6">
        {filteredTasks.length === 0 ? (
          <div className="bg-white border border-[#231530]/10 rounded-2xl p-12 text-center text-xs text-[#231530]/60">
            No checklist items match your active filters. Try clearing the search or category filters.
          </div>
        ) : (
          Object.entries(subcategoryGroups).map(([subcategoryName, groupTasks]) => (
            <div key={subcategoryName} className="space-y-3">
              {/* Subcategory Section Header */}
              <div className="flex items-center justify-between px-2 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-[#E06D28] rounded-full" />
                  <h3 className="text-sm font-bold text-[#231530] uppercase tracking-wider">
                    {subcategoryName}
                  </h3>
                  <span className="text-xs text-[#231530]/50">({groupTasks.length} tasks)</span>
                </div>
              </div>

              {/* Tasks in Subcategory */}
              <div className="space-y-3">
                {groupTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    eventTasks={eventTasks}
                    teamMembers={teamMembers}
                    eventDate={activeEvent.eventDate}
                    isExpanded={!!expandedTasks[task.id]}
                    toggleTaskExpanded={toggleTaskExpanded}
                    updateTaskStatus={updateTaskStatus}
                    handleQuickAssignOwner={handleQuickAssignOwner}
                    setDepModalTask={setDepModalTask}
                    handleOpenAIExpansion={handleOpenAIExpansion}
                    deleteTask={deleteTask}
                    toggleSubtask={toggleSubtask}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create New Task Modal */}
      {newTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#231530]/10">
            <div className="flex items-center justify-between pb-3 border-b border-[#231530]/10">
              <h3 className="text-lg font-bold text-[#231530]">Create Actionable Microtask</h3>
              <button
                onClick={() => setNewTaskModalOpen(false)}
                className="text-[#231530]/40 hover:text-[#231530] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#231530] mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                  placeholder="e.g. Schedule Groom Safa Tying Trial & Fitting"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#231530]/15 rounded-xl focus:border-[#E06D28]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#231530] mb-1">Category</label>
                  <select
                    value={newTaskData.categoryName}
                    onChange={(e) => {
                      const name = e.target.value;
                      setNewTaskData({
                        ...newTaskData,
                        categoryName: name,
                        categoryId: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#231530]/15 rounded-xl focus:border-[#E06D28]"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#231530] mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={newTaskData.subcategoryName}
                    onChange={(e) => setNewTaskData({ ...newTaskData, subcategoryName: e.target.value })}
                    placeholder="e.g. Attire & Styling"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#231530]/15 rounded-xl focus:border-[#E06D28]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#231530] mb-1">Assign Lead Member</label>
                  <select
                    value={newTaskData.ownerId}
                    onChange={(e) => setNewTaskData({ ...newTaskData, ownerId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#231530]/15 rounded-xl focus:border-[#E06D28]"
                  >
                    <option value="">Unassigned</option>
                    <optgroup label="Family Roster">
                      {teamMembers.filter((m) => m.directoryType === 'family').map((m) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>
                      ))}
                    </optgroup>
                    <optgroup label="Office Colleagues">
                      {teamMembers.filter((m) => m.directoryType === 'office').map((m) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>
                      ))}
                    </optgroup>
                    <optgroup label="Community & Society">
                      {teamMembers.filter((m) => m.directoryType === 'community').map((m) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>
                      ))}
                    </optgroup>
                    <optgroup label="Volunteers & Marshals">
                      {teamMembers.filter((m) => m.directoryType === 'volunteers').map((m) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#231530] mb-1">Priority</label>
                  <select
                    value={newTaskData.priority}
                    onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#231530]/15 rounded-xl focus:border-[#E06D28]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#231530] mb-1">Timeline Offset (Days)</label>
                  <input
                    type="number"
                    value={newTaskData.relativeOffsetDays}
                    onChange={(e) => setNewTaskData({ ...newTaskData, relativeOffsetDays: Number(e.target.value) })}
                    placeholder="-15"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#231530]/15 rounded-xl focus:border-[#E06D28]"
                  />
                  <span className="text-[10px] text-[#231530]/50">-15 means 15 days before event</span>
                </div>

                <div>
                  <label className="block font-semibold text-[#231530] mb-1">Linked Budget Category</label>
                  <select
                    value={newTaskData.linkedBudgetCategoryId}
                    onChange={(e) => setNewTaskData({ ...newTaskData, linkedBudgetCategoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#231530]/15 rounded-xl focus:border-[#E06D28]"
                  >
                    <option value="">None / Operational</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#231530]/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewTaskModalOpen(false)}
                  className="px-4 py-2 bg-[#FAF7F2] text-[#231530]/70 font-semibold rounded-xl hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E06D28] hover:bg-[#C4551D] text-white font-semibold rounded-xl shadow-xs cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Expansion Modal */}
      {expansionModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-[#231530]/10 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#231530]/10 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-[#231530]">
                  AI Microtask Expansion ({selectedCategory !== 'all' ? selectedCategory : 'Groom'})
                </h3>
              </div>
              <button
                onClick={() => setExpansionModalOpen(false)}
                className="text-[#231530]/40 hover:text-[#231530] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {expansionLoading ? (
              <div className="py-12 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                <p className="text-xs text-[#231530]/70">
                  Analyzing celebration parameters and existing checklist...
                </p>
              </div>
            ) : expansionData ? (
              <div className="space-y-4 overflow-y-auto flex-1 pr-1 text-xs">
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between font-bold text-purple-900">
                    <span>{expansionData.suggestions.length} Microtasks Recommended</span>
                    {expansionData.simulated && (
                      <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded uppercase">
                        Offline Fallback
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-purple-950/80">
                    {expansionData.disclaimer}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {expansionData.suggestions.map((s, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all ${
                        s.isDuplicate
                          ? 'bg-amber-50/50 border-amber-200 opacity-70'
                          : selectedCandidateIndices[idx]
                          ? 'bg-white border-purple-300 shadow-xs'
                          : 'bg-gray-50/60 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={!!selectedCandidateIndices[idx]}
                          onChange={(e) =>
                            setSelectedCandidateIndices((prev) => ({
                              ...prev,
                              [idx]: e.target.checked,
                            }))
                          }
                          className="mt-1 w-4 h-4 rounded-xs accent-purple-600 cursor-pointer shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-[#231530] text-xs">{s.title}</h4>
                            <div className="flex items-center gap-1">
                              {s.isDuplicate && (
                                <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                                  Duplicate
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">
                                T{s.relativeOffsetDays} Days
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#231530]/70 mt-1">{s.rationale}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="pt-3 border-t border-[#231530]/10 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setExpansionModalOpen(false)}
                className="px-4 py-2 bg-[#FAF7F2] text-[#231530]/70 font-semibold rounded-xl hover:bg-gray-200 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSelectedAITasks}
                disabled={expansionLoading || !expansionData}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer text-xs disabled:opacity-50"
              >
                Import Selected Microtasks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dependency Modal */}
      {depModalTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#231530]/10">
            <div className="flex items-center justify-between pb-3 border-b border-[#231530]/10">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-[#E06D28]" />
                <h3 className="text-base font-bold text-[#231530]">
                  Chain Dependencies for "{depModalTask.title}"
                </h3>
              </div>
              <button
                onClick={() => setDepModalTask(null)}
                className="text-[#231530]/40 hover:text-[#231530] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {depError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
                {depError}
              </div>
            )}

            <div className="space-y-2 text-xs">
              <p className="text-[#231530]/70">
                Select prerequisite tasks that must be completed before this task can proceed. Circular dependency links are automatically prevented.
              </p>

              <div className="max-h-60 overflow-y-auto space-y-1.5 pt-2 border-t border-[#231530]/10">
                {eventTasks
                  .filter((t) => t.id !== depModalTask.id)
                  .map((t) => {
                    const isLinked = depModalTask.dependsOnIds.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                          isLinked
                            ? 'bg-[#E06D28]/10 border-[#E06D28] text-[#231530] font-semibold'
                            : 'bg-[#FAF7F2] border-transparent hover:border-[#231530]/20 text-[#231530]/80'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isLinked}
                            onChange={() => handleToggleDependency(t.id)}
                            className="w-4 h-4 rounded-xs accent-[#E06D28] cursor-pointer"
                          />
                          <span>{t.title}</span>
                        </div>
                        <span className="text-[10px] text-[#231530]/50 font-mono">
                          {t.categoryName}
                        </span>
                      </label>
                    );
                  })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#231530]/10 flex justify-end">
              <button
                onClick={() => setDepModalTask(null)}
                className="px-5 py-2 bg-[#231530] text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
