import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchUnitById,
  fetchUnitContentById,
  type UnitContent,
} from '../../../services/unit/unitApi';
import { useUnitContent } from '../../../context/user/UnitContentContext';
import { useModuleProgress } from '../../../context/user/ModuleContext';
import { useQuizModal } from '../../../context/user/QuizModalContext.tsx';
import {
  BookIcon,
  PuzzleIcon,
  StarIcon,
  VideoIcon,
  CheckIcon,
} from '../../common/Icons.tsx';

interface UnitPageProps {
  id: string;
}

interface Unit {
  id: string;
  title: string;
  description: string;
  moduleId: string;
}

const stats = [
  { icon: <VideoIcon />, label: 'Videos', type: 'video' },
  { icon: <BookIcon />, label: 'Articles', type: 'article' },
  { icon: <PuzzleIcon />, label: 'Quizzes', type: 'quiz' },
  { icon: <StarIcon />, label: 'Points', type: 'points' },
];

async function fetchUnitDetails(id: string) {
  try {
    const response = await fetchUnitById(id);
    return response;
  } catch (error) {
    console.error('Error fetching unit details:', error);
    throw error;
  }
}

const UnitPage = ({ id }: UnitPageProps) => {
  const { setUnitId } = useModuleProgress();
  const [checkedIndex, setCheckedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [unitDetails, setUnitDetails] = useState<Unit>({
    id: '',
    title: '',
    description: '',
    moduleId: '',
  });
  const [unitContentList, setUnitContentList] = useState<UnitContent[]>([]);
  const navigate = useNavigate();
  const { setUnitContent } = useUnitContent();

  const { openModal } = useQuizModal();

  useEffect(() => {
    if (!id) {
      setError('Unit ID is required');
      setLoading(false);
      return;
    }
    setLoading(true);
    const loadUnitDetails = async () => {
      try {
        const details = await fetchUnitDetails(id);
        setUnitDetails(details);
        setUnitId(id);

        const content = await fetchUnitContentById(id);
        setUnitContent(details.id, content);
        setUnitContentList(content);
      } catch (error) {
        console.error('Failed to load unit details:', error);
        setError('Failed to load unit details');
      } finally {
        setLoading(false);
      }
    };

    loadUnitDetails();
  }, [id]);

  const handleRowClick = (idx: number) => {
    // Skip redirecting on click if it's quiz
    if (unitContentList[idx].content_type == 'quiz') {
      return;
    }

    setCheckedIndex((current) => (current === idx ? null : idx));
    navigate(
      `/user/${unitContentList[idx].content_type}/${unitContentList[idx].id}`,
      {
        state: { unitId: unitDetails.id },
      },
    );
  };

  return (
    <div className="mx-auto px-8 py-8 min-h-screen text-left">
      <div className="mb-6">
        <a
          onClick={() => navigate(`/user/modules/${unitDetails.moduleId}`)}
          className="inline-flex items-center text-gray-500 hover:text-black px-3 py-1 rounded-lg hover:bg-gray-100 hover:border hover:border-gray-300 active:bg-gray-200 transition-all cursor-pointer"
        >
          <span className="mr-2 text-xl">←</span>
          Back to Module
        </a>
      </div>

      <div className="flex flex-col gap-4 py-8 mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight mb-0 md:mb-0">
          {loading ? 'Loading...' : unitDetails.title}
        </h1>
      </div>
      <h2 className="text-xl font-bold ml-4 mb-4">About this unit</h2>

      <div className="flex flex-col md:flex-row gap-16 items-stretch mb-8">
        <div className="flex-1 flex flex-col bg-gray-200 rounded-3xl p-6 text-gray-700 text-base text-left shadow-sm justify-center">
          {loading ? 'Loading description...' : unitDetails.description}
          {error && <p className="text-red-500">{error}</p>}
        </div>
        <div className="border rounded-3xl p-6 flex flex-row gap-8 min-w-[340px] bg-white hover:shadow-lg transition items-center">
          {loading ? (
            <div className="text-center w-full">Loading stats...</div>
          ) : (
            stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-row items-center gap-4"
              >
                {stat.icon}
                <div className="flex flex-col items-start">
                  <span className="text-gray-700">{stat.label}</span>
                  <span className="text-xl font-bold">
                    {
                      unitContentList.filter(
                        (item) => item.content_type === stat.type,
                      ).length
                    }
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-gray-100 rounded-2xl p-6 shadow-lg w-full md:w-full mx-auto border border-gray-200">
        {loading ? (
          <div className="text-center py-4">Loading content...</div>
        ) : unitContentList.length > 0 ? (
          unitContentList.map((content, index) => (
            <div
              key={content.id}
              className={`grid grid-cols-[24px_80px_1fr_32px] gap-4 hover:bg-gray-200 items-center p-4 rounded-xl cursor-pointer transition-colors
                ${checkedIndex === index ? 'bg-gray-300' : ''}`}
              onClick={() => handleRowClick(index)}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {content.content_type === 'video' && <VideoIcon />}
                {content.content_type === 'article' && <BookIcon />}
                {content.content_type === 'quiz' && <PuzzleIcon />}
              </div>
              <div className="capitalize font-medium text-sm text-gray-700">
                {content.content_type}
              </div>
              <div className="text-gray-900">{content.title}</div>
              <div className="flex justify-end items-center">
                {content.content_type === 'quiz' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('id is ', content.id);
                      openModal(content.id);
                    }}
                    className="px-4 py-2 bg-blue-200 hover:bg-blue-400 text-black font-semibold rounded-full transition-colors duration-200 text-sm whitespace-nowrap"
                  >
                    Start challenge
                  </button>
                )}
                {checkedIndex === index ? <CheckIcon /> : ''}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No content available for this unit.
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitPage;
