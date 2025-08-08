import { Link } from 'react-router-dom';
import ActiveModuleCard, {
  type ActiveModuleStatus,
} from '../../ui/ActiveModuleCard';

const data = [
  { title: 'Internet Privacy', topic: 'Cybersecurity - Intermediate' },
  { title: 'Safety at Work', topic: 'Occupational Safety' },
  { title: 'Artificial Intelligence', topic: 'AI tools - Beginner' },
];

const dummyStatuses: ActiveModuleStatus[] = [
  'in_progress',
  'not_started',
  'completed',
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
        {data.map((item, idx) => (
          <ActiveModuleCard
            key={item.title}
            title={item.title}
            topic={item.topic}
            earnedPoints={idx * 5 + 10}
            status={dummyStatuses[idx % dummyStatuses.length]}
            onClick={() => {
              console.log('Start learning clicked for', item.title);
            }}
          />
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
