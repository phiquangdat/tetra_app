import React from 'react';

interface SaveButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isDirty?: boolean;
  label?: string;
}

const SaveButton: React.FC<SaveButtonProps> = ({
  onClick,
  disabled = false,
  isDirty = true,
  label = 'Save',
}) => {
  let classes = '';

  if (disabled) {
    classes = 'bg-highlight text-primary/60 opacity-60 cursor-not-allowed';
  } else if (isDirty) {
    classes =
      'bg-surface text-white hover:bg-surfaceHover border border-highlight';
  } else {
    classes = 'bg-highlight text-primary hover:bg-highlight/80';
  }

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-colors duration-200 ${classes}`}
    >
      {disabled ? 'Saving...' : label}
    </button>
  );
};

export default SaveButton;
