import React from 'react';

interface SaveButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

const SaveButton: React.FC<SaveButtonProps> = ({
  onClick,
  disabled = false,
  label = 'Save',
}) => {
  return (
    <button
      type="button"
      aria-label="Save Module"
      disabled={disabled}
      onClick={onClick}
      className={`text-sm px-4 py-1 rounded-lg cursor-pointer transition-colors duration-200 mr-4 mt-8 w-28 h-10
        ${
          disabled
            ? 'bg-highlight text-primary/60 opacity-60 cursor-not-allowed'
            : 'bg-surface text-white hover:bg-surfaceHover border border-highlight'
        }`}
    >
      {disabled ? 'Saving...' : label}
    </button>
  );
};

export default SaveButton;
