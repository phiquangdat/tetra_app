import { StarIcon } from '../../common/Icons';
import { Link } from 'react-router-dom';

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

const ActiveModulesList = () => {
  return (
    <div className="rounded-2xl bg-cardBackground p-6 my-12 shadow-lg">
      <div className="relative -mx-6 mb-10">
        <div className="text-primary text-xl font-semibold pb-3 px-10">
          In Progress
        </div>
        <span className="block absolute left-0 border-b-4 border-highlight w-1/3"></span>
        <span className="block absolute left-1/3 border-b-4 border-accent w-2/3"></span>
      </div>

      <div className="flex flex-col gap-6">
        {data.map((item) => (
          <div
            key={item.title}
            className="flex flex-col justify-between rounded-xl bg-background p-6 border border-highlight hover:shadow-xl transition-all duration-300 shadow-sm"
          >
            <div className="flex self-start items-center gap-4">
              <span>
                <StarIcon width={26} height={26} />
              </span>
              <div>
                <div className="font-bold text-lg text-primary leading-relaxed">
                  {item.title}
                </div>
                <div className="text-primary/70 text-sm italic">
                  {item.topic}
                </div>
              </div>
            </div>

            <button className="bg-surface hover:bg-surfaceHover self-end text-white font-semibold px-6 py-3 rounded-lg shadow transform hover:scale-105 transition-all duration-300">
              Start learning
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Link
          to="/user/modules"
          className="flex text-primary hover:text-secondaryHover items-center gap-2 text-lg font-semibold transition-colors duration-300"
        >
          View all Modules <span className="text-xl">&rarr;</span>
        </Link>
      </div>
    </div>
  );
};

export default ActiveModulesList;
