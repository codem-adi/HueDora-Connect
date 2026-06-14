import { useState } from 'react';

function IconEye({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 5c-5.5 0-9.5 4.7-10.8 7 1.3 2.3 5.3 7 10.8 7s9.5-4.7 10.8-7C21.5 9.7 17.5 5 12 5zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3.3 2.6 2 4l2.5 2.5C2.4 8.2 1 10.4 1 12c1.3 2.3 5.3 7 11 7 2.1 0 4-.6 5.6-1.5L20 21.4 21.4 20l-18-17.4zM12 17c-3.9 0-7.2-3.2-8.5-5  .6-1 1.5-2.2 2.6-3.1l1.8 1.8A4 4 0 0 0 12 15c.5 0 1-.1 1.4-.3l1.5 1.5c-.8.5-1.8.8-2.9.8zm8.2-3c-.5-.8-1.2-1.7-2-2.5l-1.4 1.4a4 4 0 0 0-5.4 5.4l-1.5 1.5C8.9 18.8 10.4 19 12 19c5.7 0 9.7-4.7 11-7-.5-.9-1.2-1.9-1.8-2.7z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PasswordInput({
  value,
  onChange,
  onBlur,
  required = false,
  placeholder,
  id,
  name,
  autoComplete,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input-wrap">
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        type={visible ? 'text' : 'password'}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="password-toggle-btn"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
      >
        <IconEye open={visible} />
      </button>
    </div>
  );
}
