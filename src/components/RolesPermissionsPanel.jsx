import { useMemo, useState } from 'react';
import {
  ASSIGNABLE_ROLES,
  groupRolePermissions,
  PERMISSION_LABELS,
  ROLE_PERMISSIONS,
} from '../constants/roles';
import { SelectDropdown } from './SelectDropdown';

export function RolesPermissionsPanel({ onClose }) {
  const [selectedRole, setSelectedRole] = useState('admin');

  const rolePermissions = useMemo(
    () => ROLE_PERMISSIONS[selectedRole] || [],
    [selectedRole],
  );

  const permissionGroups = useMemo(
    () => groupRolePermissions(rolePermissions),
    [rolePermissions],
  );

  return (
    <aside className="permissions-panel">
      <div className="permissions-panel-top">
        <div className="permissions-panel-header">
          <div className="permissions-panel-title-row">
            <div>
              <h3>Roles & Permissions</h3>
              <p className="panel-subtitle">Preview what each role can access in the app.</p>
            </div>
            {onClose && (
              <button
                type="button"
                className="permissions-panel-close"
                aria-label="Hide roles and permissions"
                onClick={onClose}
              >
                ×
              </button>
            )}
          </div>
        </div>

        <SelectDropdown
          label="Role"
          value={selectedRole}
          options={ASSIGNABLE_ROLES}
          onChange={setSelectedRole}
        />
      </div>

      <div className="permissions-panel-body">
        <div className="permissions-breakdown">
          {permissionGroups.map((group) => (
            <section key={group.key} className="permission-group">
              <h4 className="permission-group-title">{group.label}</h4>
              <ul className="permission-items">
                {group.items.map((permission) => (
                  <li key={permission} className="permission-item">
                    <span className="permission-item-icon" aria-hidden="true">✓</span>
                    <span>{PERMISSION_LABELS[permission] || permission}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </aside>
  );
}
