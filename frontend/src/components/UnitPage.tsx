import { useState } from 'react';

const icons = {
  video: (
    <svg
      className="w-6 h-6 text-gray-700 flex-shrink-0"
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
      className="w-6 h-6 text-gray-700 flex-shrink-0"
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
      className="w-6 h-6 text-gray-700 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 13v-2a2 2 0 00-2-2h-2V7a2 2 0 00-2-2h-2V3a2 2 0 00-2-2H7a2 2 0 00-2 2v2H3a2 2 0 00-2 2v2h2a2 2 0 012 2v2h2a2 2 0 012 2v2h2a2 2 0 012 2v2h2a2 2 0 002-2v-2h2a2 2 0 002-2z"
      />
    </svg>
  ),
  points: (
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
  check: (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
};

const stats = [
  { icon: icons.video, label: 'Videos', value: 1 },
  { icon: icons.article, label: 'Articles', value: 1 },
  { icon: icons.quiz, label: 'Quizzes', value: 1 },
  { icon: icons.points, label: 'Points', value: 50 },
];

const contentList = [
  {
    type: 'video',
    label: 'Video',
    title: 'Strategies for data protection and encryption',
  },
  {
    type: 'article',
    label: 'Article',
    title: 'Case studies on data breaches and prevention',
  },
  { type: 'quiz', label: 'Quiz', title: 'Key concepts of data protection' },
];

const UnitPage = () => {
  const [checkedIndex, setCheckedIndex] = useState<number | null>(null);

  const handleRowClick = (idx: number) => {
    setCheckedIndex(idx);
  };

  return (
    <div className="mx-auto px-8 py-8 min-h-screen text-left">
      <div className="flex flex-col gap-4 py-8 mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight mb-0 md:mb-0">
          Introduction to Cyber Threats
        </h1>
      </div>
      <h2 className="text-xl font-bold ml-4 mb-4">About this unit</h2>

      <div className="flex flex-col md:flex-row gap-16 items-stretch mb-8">
        <div className="flex-1 flex flex-col bg-gray-200 rounded-3xl p-6 text-gray-700 text-base text-left shadow-sm justify-center">
          This module introduces the foundational concepts of cybersecurity,
          including common threats like phishing and malware. You'll learn how
          to protect your personal and workplace data through videos, articles,
          and interactive quizzes.
        </div>
        <div className="border rounded-3xl p-6 flex flex-row gap-8 min-w-[340px] bg-white hover:shadow-lg transition items-center">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-row items-center gap-4">
              {stat.icon}
              <div className="flex flex-col items-start">
                <span className="text-gray-700">{stat.label}</span>
                <span className="text-xl font-bold">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-100 rounded-2xl p-6 shadow-md w-full md:w-full mx-auto">
        {contentList.map((item, index) => (
          <div
            key={index}
            className={`grid grid-cols-[24px_80px_1fr_32px] gap-6 items-center p-4 rounded-xl cursor-pointer transition-colors
${checkedIndex === index ? 'bg-blue-100' : 'bg-white hover:bg-gray-200'}`}
            onClick={() => handleRowClick(index)}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              {icons[item.type as keyof typeof icons]}
            </div>
            <div className="capitalize font-medium text-sm text-gray-600">
              {item.label}
            </div>
            <div>{item.title}</div>
            {checkedIndex === index ? icons.check : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnitPage;
