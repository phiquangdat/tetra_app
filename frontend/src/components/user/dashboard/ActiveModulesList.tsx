const data = [
  {
    title: 'Internet Privacy',
    topic: 'Cybersecurity - Intermediate',
  },
  {
    title: 'Safety at Work',
    topic: 'Occupational Safety',
  },
  {
    title: 'Artificial Intelligence',
    topic: 'AI tools - Beginner',
  },
];

const icons = {
  quiz: (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 17.75l-6.172 3.245 1.179-6.873L2 9.755l6.908-1.004L12 2.5l3.092 6.251L22 9.755l-5.007 4.367 1.179 6.873z"
      />
    </svg>
  ),
};

const ActiveModulesList = () => {
  return (
    <div className="rounded-2xl bg-gray-100 p-8 mb-8 shadow-lg">
      <div className="relative -mx-8 mb-6">
        <div className="text-lg font-semibold pb-2 px-8">In Progress</div>
        <span className="block absolute left-0 border-b-4 border-blue-500 w-1/3"></span>
        <span className="block absolute left-1/3 border-b-4 border-gray-300 w-2/3"></span>
      </div>

      <div className="flex flex-col gap-6">
        {data.map((item) => (
          <div
            key={item.title}
            className="flex flex-col justify-between bg-yellow-50 rounded-xl p-4"
          >
            <div className="flex self-start items-center gap-4">
              <span className="text-3xl">{icons.quiz}</span>
              <div>
                <div className="font-semibold text-lg text-gray-800">
                  {item.title}
                </div>
                <div className="text-gray-500 text-sm">{item.topic}</div>
              </div>
            </div>

            <button className="bg-blue-500 self-end text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-600 transition">
              Start learning
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <a href="#" className="text-gray-700 font-medium gap-2 hover:underline">
          View all Modules <span>&rarr;</span>
        </a>
      </div>
    </div>
  );
};

export default ActiveModulesList;
