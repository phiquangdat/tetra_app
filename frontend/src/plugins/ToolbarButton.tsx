import React from 'react';

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  'aria-label': string;
  children: React.ReactNode;
}

export function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  'aria-label': ariaLabel,
  children,
}: ToolbarButtonProps) {
  const baseClasses = 'p-1 rounded-md transition-colors';
  const activeClasses = active ? 'bg-blue-100 text-blue-600' : 'text-gray-700';
  const disabledClasses = disabled
    ? 'text-gray-400 cursor-not-allowed'
    : 'hover:bg-gray-200';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${activeClasses} ${disabledClasses}`}
      aria-label={ariaLabel}
      aria-pressed={active}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}