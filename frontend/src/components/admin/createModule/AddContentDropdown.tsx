import React from 'react';
import { ChevronDownIcon } from 'lucide-react';

export type AddContentDropdownProps = {
  unitNumber: number;
  onOpenArticle: () => void;
  onOpenVideo: () => void;
  onOpenQuiz: () => void;
};

const AddContentDropdown: React.FC<AddContentDropdownProps> = ({
  unitNumber,
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
    <div className="relative w-[190px]">
      <select
        id={`contentBlocks-${unitNumber}`}
        onChange={handleChange}
        className="appearance-none w-full border border-gray-300 rounded-lg px-3 pr-8 py-2 text-sm bg-secondary hover:bg-secondaryHover text-white transition"
        defaultValue=""
      >
        <option value="" disabled>
          + Add content
        </option>
        <option value="addVideo">Add video</option>
        <option value="addArticle">Add article</option>
        <option value="addQuiz">Add quiz</option>
      </select>

      <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white" />
    </div>
  );
};

export default AddContentDropdown;
