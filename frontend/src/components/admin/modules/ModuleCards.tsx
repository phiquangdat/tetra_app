import ModuleCard from '../../ui/ModuleCard';

interface Module {
  id: React.Key | null | undefined;
  title: string;
  topic: string;
  points: number;
  status: string;
  coverUrl: string;
}

const modules: Module[] = [
  {
    id: '23jhru2y3',
    title: 'AI Fundamentals',
    topic: 'AI',
    points: 240,
    status: 'Published',
    coverUrl:
      'https://www.thestrategyinstitute.org/images/key-areas-where-ai-is-transforming-business-strategies.jpg',
  },
  {
    id: 'a9s8d7f6g5',
    title: 'Cybersecurity Essentials',
    topic: 'Cybersecurity',
    points: 180,
    status: 'Draft',
    coverUrl:
      'https://media.wiley.com/product_data/coverImage300/93/11193623/1119362393.jpg',
  },
  {
    id: 'zxcvbn1234',
    title: 'Workplace Safety',
    topic: 'Safety',
    points: 200,
    status: 'Published',
    coverUrl: '',
  },
];

function ModuleCards() {
  return (
    <div className="flex flex-col gap-6 px-0 py-8 w-full mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Learning Modules</h1>
      <ul className="flex flex-wrap justify-center items-center gap-8 p-0">
        {modules.map((module: Module) => (
          <li key={module.id}>
            <ModuleCard
              id={module.id}
              title={module.title}
              coverUrl={module.coverUrl}
              details={[
                { label: 'Topic', value: module.topic },
                { label: 'Points', value: module.points },
                { label: 'Status', value: module.status },
              ]}
              buttonLabel="Open"
              linkBasePath="/admin/modules"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ModuleCards;
