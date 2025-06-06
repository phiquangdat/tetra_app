import React, { useState } from 'react';

type Unit = {
  title: string;
  content: {
    type: 'video' | 'article' | 'quiz';
    title: string;
  }[];
};

const units: Unit[] = [
  {
    title: 'Data Protection',
    content: [
      { type: 'video', title: 'Strategies for data protection' },
      { type: 'article', title: 'Case studies on breaches and prevention' },
      { type: 'quiz', title: 'Key concepts of data protection' },
    ],
  },
  {
    title: 'Cybersecurity Fundamentals',
    content: [
      { type: 'video', title: 'Introduction to Cyber Threats' },
      { type: 'article', title: 'Best Practices for Secure Systems' },
      { type: 'quiz', title: 'Cybersecurity Knowledge Check' },
    ],
  },
];

const Syllabus: React.FC = () => {
  const [openUnit, setOpenUnit] = useState<number | null>(null);

  const toggleUnit = (index: number) => {
    setOpenUnit(openUnit === index ? null : index);
  };

  const icons = {
    video: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h11a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
      </svg>
    ),
    article: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
        <path d="M17 21V13H7v8" />
        <path d="M7 3v5h8" />
      </svg>
    ),
    quiz: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 17.75l-6.172 3.245 1.179-6.873L2 9.755l6.908-1.004L12 2.5l3.092 6.251L22 9.755l-5.007 4.367 1.179 6.873z"
        />
      </svg>
    ),
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
    <div className="bg-gray-100 rounded-2xl p-6 shadow-md w-full md:w-full mx-auto">
      <h2 className="text-xl font-semibold mb-4">Syllabus</h2>
      {units.map((unit, index) => (
        <div key={index} className="mb-4">
          <div
            className={`flex justify-between items-center p-4 rounded-xl cursor-pointer transition-colors
              ${openUnit === index ? 'bg-blue-100' : 'bg-white hover:bg-gray-200'}`}
            onClick={() => toggleUnit(index)}
          >
            <div>
              <div className="font-bold">
                Unit {index + 1}: {unit.title}
              </div>
              <div className="text-sm text-gray-600">
                1 Article, 1 Video, 1 Quiz
              </div>
            </div>
            {openUnit === index ? icons.chevronUp : icons.chevronDown}
          </div>
          {openUnit === index && (
            <div className="mt-2 ml-4 space-y-1 text-sm">
              {unit.content.map((contentItem, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[24px_80px_1fr] gap-2 items-center text-gray-700"
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    {icons[contentItem.type]}
                  </div>
                  <div className="capitalize font-medium text-sm text-gray-600">
                    {contentItem.type}
                  </div>
                  <div>{contentItem.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Syllabus;
