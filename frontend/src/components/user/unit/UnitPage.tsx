import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchUnitById,
  fetchUnitContentById,
  type UnitContent,
} from '../../../services/unit/unitApi';
import { useUnitContent } from '../../../context/user/UnitContentContext';
import { useModuleProgress } from '../../../context/user/ModuleProgressContext';
import { useQuizModal } from '../../../context/user/QuizModalContext.tsx';
import {
  BookIcon,
  PuzzleIcon,
  StarIcon,
  VideoIcon,
  CheckIcon,
} from '../../common/Icons.tsx';
import {
  getUnitProgress,
  createUnitProgress,
  getContentProgress,
  type ContentProgress,
} from '../../../services/userProgress/userProgressApi.tsx';

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
  {
    icon: <VideoIcon width={30} height={30} />,
    label: 'Videos',
    type: 'video',
  },
  {
    icon: <BookIcon width={30} height={30} />,
    label: 'Articles',
    type: 'article',
  },
  {
    icon: <PuzzleIcon width={30} height={30} />,
    label: 'Quizzes',
    type: 'quiz',
  },
  {
    icon: <StarIcon width={30} height={30} color="#FFA726" />,
    label: 'Points',
    type: 'points',
  },
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
  const {
    setUnitId,
    setModuleId,
    unitProgressStatus,
    setUnitProgressStatus,
    goToFirstContent,
  } = useModuleProgress();
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
        setModuleId(details.moduleId);

        const content = await fetchUnitContentById(id);
        let contentProgress: ContentProgress[] = [];

        try {
          contentProgress = await getContentProgress(id);
        } catch (progressError) {
          if (
            progressError instanceof Error &&
            progressError.message.includes('404')
          ) {
            console.error('[getContentProgress] No progress records found');
            contentProgress = [];
          } else {
            throw progressError;
          }
        }
        console.log('[getContentProgress] Content progress:', contentProgress);

        setUnitContent(details.id, content);

        const updatedContent = content.map((item) => {
          // Merge content with progress
          const progress = contentProgress.find(
            (p) => p.unitContentId === item.id,
          );
          return {
            ...item,
            status: progress ? progress.status : 'not_started',
            points: progress ? progress.points : 0,
          };
        });

        setUnitContentList(updatedContent);

        try {
          const unitProgress = await getUnitProgress(id);
          setUnitProgressStatus(unitProgress?.status.toLowerCase());
        } catch (getError) {
          if (getError instanceof Error && getError.message.includes('404')) {
            setUnitProgressStatus('not_started');
          }
        }
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

  const handleStart = async () => {
    try {
      if (unitDetails.id) {
        const response = await createUnitProgress(
          unitDetails.id,
          unitDetails.moduleId,
        );
        setUnitProgressStatus(response.status.toLowerCase());
        console.log('[createUnitProgress] Unit progress created:', response);
        await goToFirstContent();
      }
    } catch (err) {
      console.error('Error starting unit:', err);
      setError('Cannot start unit.');
    }
  };

  return (
    <div className="mx-auto px-8 py-8 min-h-screen bg-[#FFFFFF] text-left">
      <div className="mb-6">
        <a
          onClick={() => navigate(`/user/modules/${unitDetails.moduleId}`)}
          className="inline-flex items-center text-[#998FC7] hover:text-[#231942] px-3 py-1 rounded-lg hover:bg-[#F9F5FF] hover:border hover:border-[#D4C2FC] active:bg-[#D4C2FC] transition-all cursor-pointer"
        >
          <span className="mr-2 text-xl">←</span>
          Back to Module
        </a>
      </div>

      <div className="flex flex-col gap-4 py-8 mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#231942] tracking-tight">
          {loading ? 'Loading...' : unitDetails.title}
        </h1>
        {unitProgressStatus === 'in_progress' ? (
          <button
            className="bg-secondary text-white font-semibold px-14 py-3 rounded-full text-lg shadow-md hover:bg-secondaryHover focus:outline-none focus:ring-2 focus:ring-surface transition w-fit"
            type="button"
          >
            Continue
          </button>
        ) : (
          <button
            className="bg-surface text-white font-semibold px-16 py-3 rounded-full text-lg shadow-md hover:bg-surfaceHover focus:outline-none focus:ring-2 focus:ring-secondary transition w-fit"
            type="button"
            onClick={handleStart}
          >
            Start
          </button>
        )}
      </div>

      <h2 className="text-xl font-bold ml-4 mb-4 text-[#231942]">
        About this unit
      </h2>

      <div className="flex flex-col md:flex-row gap-16 items-stretch mb-8">
        <div className="flex-1 flex flex-col bg-[#F9F5FF] rounded-3xl p-6 text-[#231942] text-base shadow-sm justify-center">
          {loading ? 'Loading description...' : unitDetails.description}
          {error && <p className="text-red-500">{error}</p>}
        </div>
        <div className="border border-[#D4C2FC] rounded-3xl p-6 flex flex-row gap-8 min-w-[340px] bg-white hover:shadow-lg transition items-center">
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
                  <span className="text-sm text-[#231942]">{stat.label}</span>
                  <span className="text-xl font-bold text-[#14248A]">
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

      <div className="bg-[#F9F5FF] rounded-2xl p-6 shadow-lg w-full md:w-full mx-auto border border-[#D4C2FC]">
        {loading ? (
          <div className="text-center py-4">Loading content...</div>
        ) : unitContentList.length > 0 ? (
          unitContentList.map((content, index) => (
            <div
              key={content.id}
              className={`grid grid-cols-[24px_80px_1fr_auto] gap-4 items-center p-4 rounded-xl cursor-pointer transition-colors 
                hover:bg-[#D4C2FC] ${
                  checkedIndex === index
                    ? 'bg-[#998FC7]/30'
                    : content.status?.toLowerCase() === 'completed'
                      ? 'bg-green-100/70 border border-green-300'
                      : 'bg-white'
                }`}
              onClick={() => handleRowClick(index)}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {content.content_type === 'video' && (
                  <VideoIcon width={24} height={24} />
                )}
                {content.content_type === 'article' && (
                  <BookIcon width={24} height={24} />
                )}
                {content.content_type === 'quiz' && (
                  <PuzzleIcon width={24} height={24} />
                )}
              </div>
              <div className="capitalize text-base font-medium text-[#231942]">
                {content.content_type}
              </div>
              <div className="text-[#231942] text-base">{content.title}</div>
              <div className="flex justify-end items-center">
                {content.content_type === 'quiz' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(content.id);
                    }}
                    className="px-4 py-2 bg-[#FFA726] hover:bg-[#FFB74D] text-black font-semibold rounded-full transition-colors duration-200 text-sm whitespace-nowrap"
                  >
                    Start challenge
                  </button>
                )}
                {checkedIndex === index ? <CheckIcon /> : ''}
                {content.status?.toLowerCase() === 'completed' && (
                  <div className="flex items-center gap-2">
                    <div className="mx-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                      <CheckIcon width={14} height={14} color="white" />
                    </div>
                    {content.points > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                        {content.points} pts
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-[#998FC7]">
            No content available for this unit.
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitPage;
