import { useEffect, useState } from 'react';
import { userApi } from '../services/endpoints';
import { Pagination } from '../components/Pagination';
import { DEFAULT_PAGE_SIZE } from '../constants/pagination';
import {
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
} from '../constants/roles';
import { trimFormStrings, trimString } from '../utils/trimInput';
import { validateUserForm } from '../utils/userFormValidation';
import { PasswordInput } from '../components/PasswordInput';
import { SelectDropdown } from '../components/SelectDropdown';
import { RolesPermissionsPanel } from '../components/RolesPermissionsPanel';
import { UsersFilters } from '../components/UsersFilters';

const STATUS_LABELS = {
  all: 'All users',
  pending: 'Pending approval',
  active: 'Active',
  inactive: 'Inactive',
  rejected: 'Rejected',
};

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  role: 'read_only',
  password: '',
};

function formatUserStatus(user) {
  if (user.signupStatus === 'pending') return 'Pending approval';
  if (user.signupStatus === 'rejected') return 'Rejected';
  return user.isActive ? 'Active' : 'Inactive';
}

function statusClass(user) {
  if (user.signupStatus === 'pending') return 'status-pill status-pending';
  if (user.signupStatus === 'rejected') return 'status-pill status-rejected';
  return user.isActive ? 'status-pill status-active' : 'status-pill status-inactive';
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPermissionsPanel, setShowPermissionsPanel] = useState(false);
  const [approvingUser, setApprovingUser] = useState(null);
  const [approveRole, setApproveRole] = useState('read_only');

  useEffect(() => {
    loadUsers(1, pageSize, search, statusFilter);
  }, [statusFilter]);

  async function loadUsers(nextPage = page, nextPageSize = pageSize, searchValue = search, statusValue = statusFilter) {
    setLoading(true);
    const trimmedSearch = trimString(searchValue);
    setSearch(trimmedSearch);
    try {
      const params = { page: nextPage, limit: nextPageSize, status: statusValue };
      if (trimmedSearch) params.search = trimmedSearch;
      const { data } = await userApi.list(params);
      setUsers(data.data);
      setPagination(data.pagination);
      setPage(nextPage);
      setPageSize(nextPageSize);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingUser({ mode: 'create' });
    setForm(emptyForm);
    setFieldErrors({});
  }

  function openEdit(user) {
    setEditingUser({ mode: 'edit', user });
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: '',
    });
    setFieldErrors({});
  }

  function closeEditor() {
    setEditingUser(null);
    setForm(emptyForm);
    setFieldErrors({});
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    const trimmed = trimFormStrings(form, ['name', 'email', 'phone', 'password']);
    setForm(trimmed);

    const isCreate = editingUser?.mode === 'create';
    const validation = validateUserForm(trimmed, { requirePassword: isCreate });
    setFieldErrors(validation.errors);
    if (!validation.isValid) return;

    setSaving(true);
    setError('');
    try {
      const payload = {
        name: trimmed.name,
        email: trimString(trimmed.email).toLowerCase(),
        phone: trimmed.phone || undefined,
        role: trimmed.role,
      };
      if (trimmed.password) payload.password = trimmed.password;

      if (isCreate) {
        await userApi.create(payload);
      } else {
        await userApi.update(editingUser.user.id, payload);
      }

      closeEditor();
      await loadUsers(page, pageSize);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) setFieldErrors(apiErrors);
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  }

  async function runAction(action, user, extra = {}) {
    setError('');
    try {
      if (action === 'approve') await userApi.approve(user.id, extra);
      if (action === 'reject') await userApi.reject(user.id);
      if (action === 'activate') await userApi.activate(user.id);
      if (action === 'deactivate') await userApi.deactivate(user.id);
      await loadUsers(page, pageSize);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} user`);
    }
  }

  function handleSearchSubmit() {
    setPage(1);
    loadUsers(1, pageSize);
  }

  function clearAllFilters() {
    setSearch('');
    setStatusFilter('all');
    setPage(1);
    loadUsers(1, pageSize, '', 'all');
  }

  const activeChips = [];
  if (search) {
    activeChips.push({
      key: 'search',
      label: `Search: ${search}`,
      onRemove: () => {
        setSearch('');
        setPage(1);
        loadUsers(1, pageSize, '', statusFilter);
      },
    });
  }
  if (statusFilter !== 'all') {
    activeChips.push({
      key: 'status',
      label: `Status: ${STATUS_LABELS[statusFilter] || statusFilter}`,
      onRemove: () => setStatusFilter('all'),
    });
  }

  return (
    <div className="users-page">
      <div className={`users-layout${showPermissionsPanel ? ' users-layout-with-panel' : ''}`}>
        <div className="users-main">
          <UsersFilters
            search={search}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            activeChips={activeChips}
            onClearAll={clearAllFilters}
            showPermissionsPanel={showPermissionsPanel}
            onTogglePermissionsPanel={() => setShowPermissionsPanel((value) => !value)}
            onCreateUser={openCreate}
          />

          {error && (
            <div className="page-alerts">
              <div className="error-banner">{error}</div>
            </div>
          )}

          <div className="table-card">
            {loading ? (
              <div className="empty-state">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="empty-state">No users found.</div>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{ROLE_LABELS[user.role] || user.role}</td>
                        <td><span className={statusClass(user)}>{formatUserStatus(user)}</span></td>
                        <td>{user.phone || '—'}</td>
                        <td>
                          <div className="actions">
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => openEdit(user)}>
                              Edit
                            </button>
                            {user.signupStatus === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={() => {
                                    setApprovingUser(user);
                                    setApproveRole(user.role || 'read_only');
                                  }}
                                >
                                  Approve
                                </button>
                                <button type="button" className="btn btn-danger btn-sm" onClick={() => runAction('reject', user)}>
                                  Reject
                                </button>
                              </>
                            )}
                            {user.signupStatus !== 'pending' && user.signupStatus !== 'rejected' && (
                              user.isActive ? (
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => runAction('deactivate', user)}>
                                  Deactivate
                                </button>
                              ) : (
                                <button type="button" className="btn btn-primary btn-sm" onClick={() => runAction('activate', user)}>
                                  Activate
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <Pagination
            pagination={pagination}
            pageSize={pageSize}
            onPageChange={(nextPage) => loadUsers(nextPage, pageSize)}
            onPageSizeChange={(nextPageSize) => { setPage(1); loadUsers(1, nextPageSize); }}
            itemLabel="users"
          />
        </div>

        {showPermissionsPanel && (
          <RolesPermissionsPanel onClose={() => setShowPermissionsPanel(false)} />
        )}
      </div>

      {editingUser && (
        <div className="modal-overlay" onClick={closeEditor}>
          <div className="modal-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>{editingUser.mode === 'create' ? 'New User' : 'Edit User'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <label>
                  Name
                  <input value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
                  {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
                </label>
                <label>
                  Email
                  <input value={form.email} onChange={(e) => updateField('email', e.target.value)} type="email" required />
                  {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                </label>
                <label>
                  Phone
                  <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} type="tel" />
                  {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
                </label>
                <div className="form-grid-item">
                  <SelectDropdown
                    id="user-form-role"
                    label="Role"
                    value={form.role}
                    options={ASSIGNABLE_ROLES}
                    onChange={(value) => updateField('role', value)}
                  />
                  {fieldErrors.role && <span className="field-error">{fieldErrors.role}</span>}
                </div>
                <label>
                  {editingUser.mode === 'create' ? 'Password' : 'New Password (optional)'}
                  <PasswordInput
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    required={editingUser.mode === 'create'}
                    autoComplete="new-password"
                  />
                  {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeEditor}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {approvingUser && (
        <div className="modal-overlay" onClick={() => setApprovingUser(null)}>
          <div className="modal-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>Approve Signup</h2>
            <p className="modal-message">
              Approve access for <strong>{approvingUser.name}</strong> ({approvingUser.email})?
            </p>
            <SelectDropdown
              id="approve-user-role"
              label="Assign role"
              value={approveRole}
              options={ASSIGNABLE_ROLES}
              onChange={setApproveRole}
            />
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setApprovingUser(null)}>Cancel</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={async () => {
                  const user = approvingUser;
                  setApprovingUser(null);
                  await runAction('approve', user, { role: approveRole });
                }}
              >
                Approve User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
