const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'rejected', label: 'Rejected' },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M10.5 3a7.5 7.5 0 0 1 5.92 12.09l4.39 4.39-1.41 1.41-4.39-4.39A7.5 7.5 0 1 1 10.5 3zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z"
        fill="currentColor"
      />
    </svg>
  );
}

export function UsersFilters({
  search,
  onSearchChange,
  onSearchSubmit,
  statusFilter,
  onStatusFilterChange,
  activeChips,
  onClearAll,
  showPermissionsPanel,
  onTogglePermissionsPanel,
  onCreateUser,
}) {
  return (
    <div className="users-filter-panel panel">
      <div className="users-filter-search-block">
        <label htmlFor="users-search" className="users-filter-label">Search users</label>
        <div className="users-search-field">
          <span className="users-search-icon" aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            id="users-search"
            className="users-search-input"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
          />
          <button type="button" className="btn btn-primary users-search-btn" onClick={onSearchSubmit}>
            Search
          </button>
        </div>
      </div>

      <div className="users-filter-toolbar">
        <div className="users-status-filters" role="group" aria-label="Filter by status">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`users-status-btn${statusFilter === option.value ? ' is-active' : ''}`}
              aria-pressed={statusFilter === option.value}
              onClick={() => onStatusFilterChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="users-filter-actions">
          <button
            type="button"
            className={`btn btn-secondary${showPermissionsPanel ? ' is-active' : ''}`}
            aria-expanded={showPermissionsPanel}
            onClick={onTogglePermissionsPanel}
          >
            {showPermissionsPanel ? 'Hide Roles & Permissions' : 'Roles & Permissions'}
          </button>
          <button type="button" className="btn btn-primary" onClick={onCreateUser}>
            New User
          </button>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="users-filter-chips">
          {activeChips.map((chip) => (
            <span key={chip.key} className="filter-chip">
              {chip.label}
              <button type="button" aria-label={`Remove ${chip.label} filter`} onClick={chip.onRemove}>
                ×
              </button>
            </span>
          ))}
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClearAll}>
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
