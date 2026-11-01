import React from 'react';
import { Search } from 'lucide-react';
import { TaskItem, TeamMember } from '../../types';
import { ChecklistEngine } from '../../domain/checklistEngine';

interface TaskFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedDirectory: string;
  setSelectedDirectory: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  selectedOwner: string;
  setSelectedOwner: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  eventTasks: TaskItem[];
  availableCategories: string[];
  teamMembers: TeamMember[];
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedDirectory,
  setSelectedDirectory,
  selectedStatus,
  setSelectedStatus,
  selectedOwner,
  setSelectedOwner,
  selectedCategory,
  setSelectedCategory,
  eventTasks,
  availableCategories,
  teamMembers,
}) => {
  return (
    <div className="bg-white border border-[#231530]/10 rounded-2xl p-4 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#231530]/40 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, catering microtasks, food stalls, owners..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#231530]/15 rounded-xl focus:outline-hidden focus:border-[#E06D28]"
          />
        </div>

        {/* Directory Filter */}
        <select
          value={selectedDirectory}
          onChange={(e) => setSelectedDirectory(e.target.value)}
          className="px-3 py-2 text-xs bg-[#FAF7F2] border border-[#231530]/15 rounded-xl focus:border-[#E06D28] font-medium"
        >
          <option value="all">All Member Directories</option>
          <option value="family">Family Roster</option>
          <option value="office">Office Colleagues</option>
          <option value="community">Community & Society</option>
          <option value="volunteers">Volunteers & Marshals</option>
        </select>

        {/* Status filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs bg-[#FAF7F2] border border-[#231530]/15 rounded-xl focus:border-[#E06D28]"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending Only</option>
          <option value="completed">Completed Only</option>
          <option value="blocked">Blocked by Dependencies</option>
          <option value="high">High Priority Only</option>
        </select>

        {/* Owner filter grouped by directory */}
        <select
          value={selectedOwner}
          onChange={(e) => setSelectedOwner(e.target.value)}
          className="px-3 py-2 text-xs bg-[#FAF7F2] border border-[#231530]/15 rounded-xl focus:border-[#E06D28]"
        >
          <option value="all">All Assigned Leads</option>
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

      {/* Category Pills with Category Leaf Progress */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#231530] text-white font-semibold'
              : 'bg-[#FAF7F2] text-[#231530]/70 hover:text-[#231530]'
          }`}
        >
          All Categories ({eventTasks.length})
        </button>
        {availableCategories.map((catName) => {
          const catProgress = ChecklistEngine.calculateCategoryProgress(eventTasks, catName);
          const isSelected = selectedCategory.toLowerCase() === catName.toLowerCase();
          return (
            <button
              key={catName}
              onClick={() => setSelectedCategory(catName)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#E06D28] text-white font-semibold'
                  : 'bg-[#FAF7F2] text-[#231530]/70 hover:text-[#231530]'
              }`}
            >
              <span>{catName}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#231530]/10 text-[#231530]/80'
                }`}
              >
                {catProgress.completedLeaves}/{catProgress.totalLeaves}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
