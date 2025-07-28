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
      className="bg-white border-gray-400 border-2 text-sm text-gray-700 px-4 py-1 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors duration-200 mr-4 mt-8 w-28 h-10"
    >
      {disabled ? 'Saving...' : label}
    </button>
  );
};

export default SaveButton;
