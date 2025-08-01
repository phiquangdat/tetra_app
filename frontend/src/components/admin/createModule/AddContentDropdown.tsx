import React from 'react';
import { ChevronDownIcon } from 'lucide-react';

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
      <div className="flex justify-start mt-4">
        <div className="relative w-[220px]">
          <select
            id={`contentBlocks-${unitNumber}`}
            onChange={handleChange}
            className={`appearance-none w-full border border-gray-300 rounded-lg px-4 pr-10 py-2 text-sm transition ${
              disabled
                ? 'bg-highlight text-primary opacity-50 cursor-not-allowed'
                : 'bg-secondary hover:bg-secondaryHover text-white'
            }`}
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

          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white" />
        </div>
      </div>
      {disabled && (
        <p className="text-sm text-gray-500 mt-2">
          Save the unit first to add content blocks.
        </p>
      )}
    </div>
  );
};

export default AddContentDropdown;
