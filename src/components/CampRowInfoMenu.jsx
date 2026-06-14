import { useEffect, useRef, useState } from 'react';
import { AlertBadge } from './DashboardWidgets';
import { formatDateTimeDDMMYYYY } from '../utils/dateFormat';

function formatDateTime(value) {
  return formatDateTimeDDMMYYYY(value);
}

export function CampRowInfoMenu({
  camp,
  hasPermission,
  isSuperAdmin,
  onAction,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const approvalBlockers = camp.status === 'pending_review' ? (camp.approvalBlockers || []) : [];
  const hasApprovalAlert = approvalBlockers.length > 0;
  const showReject = camp.status === 'pending_review' && hasPermission('camps:approve');
  const showDelete = (
    ((hasPermission('camps:update') || hasPermission('camps:approve')) && camp.status !== 'executed')
    || (isSuperAdmin() && camp.status === 'executed')
  );
  const showResubmit = camp.status === 'rescheduled' && hasPermission('camps:update');
  const showCancel = camp.status === 'approved' && hasPermission('camps:approve');
  const showReschedule = (
    (camp.status === 'approved' && hasPermission('camps:approve'))
    || (camp.status === 'executed' && isSuperAdmin())
  );
  const hasActions = showReject || showDelete || showResubmit || showCancel || showReschedule;

  function runAction(action) {
    setOpen(false);
    onAction(camp._id, action);
  }

  return (
    <div className="camp-info-menu" ref={rootRef}>
      <button
        type="button"
        className="camp-info-btn"
        aria-label="Camp details and actions"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        i
      </button>
      {open && (
        <div className="camp-info-popover" role="dialog" aria-label="Camp details">
          {hasApprovalAlert && (
            <div className="camp-info-row camp-info-alert">
              <span className="camp-info-label">Approval alert</span>
            </div>
          )}
          {approvalBlockers.map((message) => (
            <p key={message} className="camp-info-note camp-info-error">{message}</p>
          ))}
          {camp.campId && (
            <div className="camp-info-row">
              <span className="camp-info-label">Camp ID</span>
              <span>{camp.campId}</span>
            </div>
          )}
          {camp.submittedAt && (
            <div className="camp-info-row">
              <span className="camp-info-label">Submitted</span>
              <span>{formatDateTime(camp.submittedAt)}</span>
            </div>
          )}
          {camp.alertLevel && camp.alertLevel !== 'none' && (
            <div className="camp-info-row camp-info-alert">
              <span className="camp-info-label">Alert</span>
              <AlertBadge alertLevel={camp.alertLevel} alertReason={camp.alertReason} />
            </div>
          )}
          {camp.alertReason && camp.alertLevel && camp.alertLevel !== 'none' && (
            <p className="camp-info-note">{camp.alertReason}</p>
          )}
          {!hasApprovalAlert && !camp.submittedAt && !camp.alertLevel && !hasActions && (
            <p className="camp-info-note">No extra details for this camp.</p>
          )}
          {hasActions && (
            <div className="camp-info-actions">
              {showResubmit && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => runAction('submitReview')}>
                  Re-submit
                </button>
              )}
              {showReschedule && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => runAction('reschedule')}>
                  Reschedule
                </button>
              )}
              {showCancel && (
                <button type="button" className="btn btn-danger btn-sm" onClick={() => runAction('cancel')}>
                  Cancel
                </button>
              )}
              {showReject && (
                <button type="button" className="btn btn-danger btn-sm" onClick={() => runAction('reject')}>
                  Reject
                </button>
              )}
              {showDelete && (
                <button type="button" className="btn btn-danger btn-sm" onClick={() => runAction('delete')}>
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
