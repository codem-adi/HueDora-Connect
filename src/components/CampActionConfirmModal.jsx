import { DateInput } from './DateInput';

const DURATION_OPTIONS = [3, 4, 5, 6, 8];

const ACTION_COPY = {
  approve: {
    title: 'Approve camp',
    message: 'Are you sure you want to approve this camp?',
    confirmLabel: 'Approve',
    confirmClass: 'btn-primary',
  },
  reject: {
    title: 'Reject camp',
    message: 'Are you sure you want to reject this camp?',
    confirmLabel: 'Reject',
    confirmClass: 'btn-danger',
  },
  delete: {
    title: 'Delete camp',
    message: 'Are you sure you want to delete this camp? This action archives the camp.',
    confirmLabel: 'Delete',
    confirmClass: 'btn-danger',
  },
  cancel: {
    title: 'Cancel camp',
    message: 'Are you sure you want to cancel this camp?',
    confirmLabel: 'Cancel camp',
    confirmClass: 'btn-danger',
  },
  execute: {
    title: 'Mark executed',
    message: 'Are you sure you want to mark this camp as executed?',
    confirmLabel: 'Mark executed',
    confirmClass: 'btn-primary',
  },
  submitReview: {
    title: 'Re-submit camp',
    message: 'Are you sure you want to re-submit this camp for review?',
    confirmLabel: 'Re-submit',
    confirmClass: 'btn-primary',
  },
  reschedule: {
    title: 'Reschedule camp',
    message: 'Update the camp date and time, then confirm reschedule.',
    confirmLabel: 'Reschedule',
    confirmClass: 'btn-primary',
  },
};

const BULK_ACTION_COPY = {
  approve: {
    title: 'Approve selected camps',
    message: (count) => `Approve ${count} selected camp${count === 1 ? '' : 's'}?`,
    confirmLabel: 'Approve selected',
    confirmClass: 'btn-primary',
  },
  reject: {
    title: 'Reject selected camps',
    message: (count) => `Reject ${count} selected camp${count === 1 ? '' : 's'}?`,
    confirmLabel: 'Reject selected',
    confirmClass: 'btn-danger',
  },
  delete: {
    title: 'Delete selected camps',
    message: (count) => `Delete ${count} selected camp${count === 1 ? '' : 's'}? This archives them.`,
    confirmLabel: 'Delete selected',
    confirmClass: 'btn-danger',
  },
  execute: {
    title: 'Mark selected executed',
    message: (count) => `Mark ${count} selected camp${count === 1 ? '' : 's'} as executed?`,
    confirmLabel: 'Mark executed',
    confirmClass: 'btn-primary',
  },
  reschedule: {
    title: 'Reschedule selected camps',
    message: (count) => `Reschedule ${count} selected camp${count === 1 ? '' : 's'}? Date and time will not be changed in bulk.`,
    confirmLabel: 'Reschedule selected',
    confirmClass: 'btn-primary',
  },
};

function updateScheduleField(schedule, field, value) {
  const next = { ...schedule, [field]: value };

  if (field === 'startTime' || field === 'durationHours') {
    const hours = Number(field === 'durationHours' ? value : next.durationHours) || 3;
    const start = field === 'startTime' ? value : next.startTime;
    const [h, m] = String(start || '09:00').split(':').map(Number);
    const total = h * 60 + (m || 0) + hours * 60;
    const endH = Math.floor(total / 60) % 24;
    const endM = total % 60;
    next.endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    next.durationHours = hours;
  }

  return next;
}

export function CampActionConfirmModal({
  request,
  schedule,
  onScheduleChange,
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!request) return null;

  const isBulk = request.mode === 'bulk';
  const copy = isBulk
    ? BULK_ACTION_COPY[request.action]
    : ACTION_COPY[request.action];

  if (!copy) return null;

  const message = isBulk ? copy.message(request.count) : copy.message;
  const showSchedule = !isBulk && request.action === 'reschedule' && schedule;

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onCancel}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="camp-action-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="camp-action-modal-title">{copy.title}</h2>
        <p className="modal-message">{message}</p>

        {!isBulk && request.camp && (
          <div className="modal-camp-summary">
            <div><strong>Client:</strong> {request.camp.clientName || '—'}</div>
            <div><strong>Camp:</strong> {request.camp.campaignName || '—'}</div>
          </div>
        )}

        {showSchedule && (
          <div className="modal-form-grid">
            <DateInput
              id="reschedule-camp-date"
              label="Camp date"
              value={schedule.campDate}
              onChange={(value) => onScheduleChange(updateScheduleField(schedule, 'campDate', value))}
              required
            />
            <label>
              Start time
              <input
                type="time"
                value={schedule.startTime}
                onChange={(e) => onScheduleChange(updateScheduleField(schedule, 'startTime', e.target.value))}
              />
            </label>
            <label>
              Duration (hours)
              <select
                value={schedule.durationHours}
                onChange={(e) => onScheduleChange(updateScheduleField(schedule, 'durationHours', Number(e.target.value)))}
              >
                {DURATION_OPTIONS.map((hours) => (
                  <option key={hours} value={hours}>{hours} hours</option>
                ))}
              </select>
            </label>
            <label>
              End time
              <input type="time" value={schedule.endTime} readOnly />
            </label>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${copy.confirmClass}`}
            onClick={onConfirm}
            disabled={loading || (showSchedule && !schedule.campDate)}
          >
            {loading ? 'Processing...' : copy.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
