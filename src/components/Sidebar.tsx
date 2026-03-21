import React, { useState } from 'react';
import { useAppStore } from '../store';

interface FilterGroupProps<T extends string | number> {
  title: string;
  icon: string;
  options: T[];
  selected: T[];
  onChange: (values: T[]) => void;
}

function FilterGroup<T extends string | number>({ title, icon, options, selected, onChange }: FilterGroupProps<T>) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleOption = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="mb-1">
      <div 
        className="flex items-center gap-1.5 px-2 py-1.5 cursor-pointer rounded-md hover:bg-[#0f1629] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-xs text-[#00D4AA]">{icon}</span>
        <span className="text-xs font-semibold flex-1">{title}</span>
        <span className="text-[10px] text-[#64748b] bg-[#0f1629] px-1 rounded">{options.length}</span>
        <span className={`text-[10px] text-[#64748b] transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
      </div>
      {isOpen && (
        <div className="py-1 pl-5">
          {options.slice(0, 10).map((option) => (
            <label
              key={String(option)}
              className="flex items-center gap-1.5 px-1.5 py-1 rounded text-xs cursor-pointer hover:bg-[#0f1629] transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
                className="w-3 h-3 accent-[#00D4AA]"
              />
              <span className={selected.includes(option) ? 'text-[#00D4AA]' : 'text-[#e2e8f0]'}>
                {option}
              </span>
            </label>
          ))}
          {options.length > 10 && (
            <div className="text-[10px] text-[#64748b] px-2 py-1">+ {options.length - 10} more...</div>
          )}
        </div>
      )}
    </div>
  );
}

export const Sidebar: React.FC = () => {
  const { filters, filterOptions, setFilter, clearFilters, sidebarCollapsed, toggleSidebar } = useAppStore();

  const hasActiveFilters = 
    filters.years.length > 0 ||
    filters.reasons.length > 0 ||
    filters.countries.length > 0 ||
    filters.journals.length > 0 ||
    filters.institutions.length > 0 ||
    filters.fields.length > 0;

  if (sidebarCollapsed) {
    return (
      <div className="w-11 shrink-0 bg-[#0b1120] border-r border-[#1e2d4a] flex flex-col">
        <div className="p-3 border-b border-[#1e2d4a]">
          <button 
            onClick={toggleSidebar}
            className="text-[#94a3b8] hover:text-[#00D4AA] text-xs"
          >
            ▶
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside className="w-60 shrink-0 bg-[#0b1120] border-r border-[#1e2d4a] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-[#1e2d4a]">
        <span className="text-[10px] text-[#64748b] font-mono uppercase tracking-wider">Filters</span>
        <button 
          onClick={toggleSidebar}
          className="text-[#94a3b8] hover:text-[#00D4AA] text-xs px-1 rounded hover:bg-[#0f1629] transition-colors"
        >
          ◀
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <FilterGroup
          title="年份"
          icon="📅"
          options={filterOptions.years}
          selected={filters.years}
          onChange={(values) => setFilter('years', values)}
        />
        <FilterGroup
          title="撤稿原因"
          icon="⚠️"
          options={filterOptions.reasons}
          selected={filters.reasons}
          onChange={(values) => setFilter('reasons', values)}
        />
        <FilterGroup
          title="国家"
          icon="🌍"
          options={filterOptions.countries}
          selected={filters.countries}
          onChange={(values) => setFilter('countries', values)}
        />
        <FilterGroup
          title="期刊"
          icon="📚"
          options={filterOptions.journals}
          selected={filters.journals}
          onChange={(values) => setFilter('journals', values)}
        />
        <FilterGroup
          title="机构"
          icon="🏛"
          options={filterOptions.institutions}
          selected={filters.institutions}
          onChange={(values) => setFilter('institutions', values)}
        />
        <FilterGroup
          title="学科领域"
          icon="🔬"
          options={filterOptions.fields}
          selected={filters.fields}
          onChange={(values) => setFilter('fields', values)}
        />
      </div>

      {hasActiveFilters && (
        <div className="p-2 border-t border-[#1e2d4a]">
          <button
            onClick={clearFilters}
            className="w-full py-1.5 px-3 text-xs text-[#FF3B5C] bg-[rgba(255,59,92,0.1)] border border-[rgba(255,59,92,0.3)] rounded-md hover:bg-[rgba(255,59,92,0.2)] transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </aside>
  );
};
