import React from 'react';

const Switch = ({ checked, onCheckedChange, disabled = false, ...props }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent
        transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${checked ? 'bg-primary' : 'bg-muted'}
      `}
      {...props}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform
          ${checked ? 'translate-x-5' : 'translate-x-1'}
        `}
      />
    </button>
  );
};

export { Switch };

