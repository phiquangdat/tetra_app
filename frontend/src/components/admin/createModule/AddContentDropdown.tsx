import React from 'react';

export type AddContentDropdownProps = {
  unitNumber: number;
  disabled: boolean;
  onOpenArticle: () => void;
  onOpenVideo: () => void;
  onOpenQuiz: () => void;
};

const AddContentDropdown: React.FC<AddContentDropdownProps> = ({
  unitNumber,
  disabled,
  onOpenArticle,
  onOpenVideo,
  onOpenQuiz,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switch (e.target.value) {
      case 'addArticle':
        onOpenArticle();
        break;
      case 'addVideo':
        onOpenVideo();
        break;
      case 'addQuiz':
        onOpenQuiz();
        break;
    }
    // reset
    e.target.value = '';
  };

  return (
    <div className="mt-6">
      <label
        htmlFor={`contentBlocks-${unitNumber}`}
        className="block mb-2 font-medium"
      >
        Add Content Block
      </label>
      <select
        id={`contentBlocks-${unitNumber}`}
        onChange={handleChange}
        className="w-full border-gray-300 border rounded p-2 focus:outline-none focus:border-blue-500"
        disabled={disabled}
        defaultValue=""
      >
        <option value="" disabled>
          + Add content
        </option>
        <option value="addVideo">Add video</option>
        <option value="addArticle">Add article</option>
        <option value="addQuiz">Add quiz</option>
      </select>
      {disabled && (
        <p className="text-sm text-gray-500 mt-2">
          Save the unit first to add content blocks.
        </p>
      )}
    </div>
  );
};

export default AddContentDropdown;
