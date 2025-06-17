import { useState } from 'react';

function UnitForm() {
  const [isOpen, setIsOpen] = useState(true);
  const [unitNumber, setUnitNumber] = useState(1);
  const incrementUnitNumber = () => {
    setUnitNumber((prev) => prev + 1);
  };

  const handleAddUnit = () => {
    incrementUnitNumber();
  };

  const icons = {
    chevronDown: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M19 9l-7 7-7-7" />
      </svg>
    ),
    chevronUp: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M5 15l7-7 7 7" />
      </svg>
    ),
  };
  return (
    <div
      className="max-w-5xl px-16 py-9 my-6 rounded-3xl"
      style={{ backgroundColor: '#F2EAEA' }}
    >
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Units</h2>
      <form action="submit">
        <div
          className={`flex items-center justify-between py-2 mb-4 ${isOpen ? '' : 'bg-gray-100'} rounded-lg cursor-pointer transition-colors duration-200`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <h3 className="text-xl font-semibold text-gray-700">
            Unit {unitNumber}
          </h3>
          {isOpen ? icons.chevronUp : icons.chevronDown}
        </div>
        {isOpen && (
          <div className="space-y-6 max-w-110 mx-0 mb-11">
            <div className="max-w-90 mb-11">
              <label
                htmlFor="unitTitle"
                className="block mb-2 font-medium text-gray-700"
              >
                Unit Title
              </label>
              <input
                type="text"
                id="unitTitle"
                name="unitTitle"
                required
                className="bg-white border-gray-400 border-2 w-full rounded-lg p-2 focus:outline-none focus:border-blue-500 transition-colors duration-200"
              />
            </div>

            <div className="w-full mb-11">
              <label
                htmlFor="unitDescription"
                className="block mb-2 font-medium text-gray-700"
              >
                Unit Description
              </label>
              <textarea
                id="unitDescription"
                name="unitDescription"
                className="bg-white border-gray-400 border-2 w-full h-60 rounded-lg p-2 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                style={{ resize: 'none' }}
                rows={4}
              ></textarea>
            </div>

            <div className="w-48 mb-11">
              <label htmlFor="contentBlocks" className="text-xl font-semibold">
                Content Blocks
              </label>
              <select
                id="contentBlocks"
                name="contentBlocks"
                className="bg-white border-gray-400 text-gray-700 border-2 w-full mt-6 rounded-lg p-2 focus:outline-none focus:border-blue-500 transition-colors duration-200"
              >
                <option value="" disabled selected>
                  + Add content
                </option>
                <option value="addVideo">Add video</option>
                <option value="addArticle">Add article</option>
                <option value="addQuiz">Add quiz</option>
              </select>
            </div>
          </div>
        )}

        <div className="mx-auto my-6 flex justify-center">
          <button className="bg-white border-gray-400 border-2 text-sm text-gray-700 px-2  rounded-lg cursor-pointer w-44 h-10 hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2">
            <span className="text-xl pb-1">+</span>
            Add another unit
          </button>
        </div>

        <div className="mx-auto my-6 flex justify-center gap-2">
          <button
            type="submit"
            className="bg-white border-gray-400 border-2 text-sm text-gray-700 px-4 py-1 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 mr-4 w-32 h-10"
            onClick={(e) => {
              e.preventDefault();
              handleAddUnit();
            }}
          >
            Save draft
          </button>
          <button
            type="submit"
            className="bg-white border-gray-400 border-2 text-sm text-gray-700 px-4 py-1 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 mr-4 w-32 h-10"
          >
            Publish
          </button>
        </div>
      </form>
    </div>
  );
}

export default UnitForm;
