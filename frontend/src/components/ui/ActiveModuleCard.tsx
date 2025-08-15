import React from 'react';
import { OpenBooksIcon } from '../common/Icons';

export type ActiveModuleStatus = 'not_started' | 'in_progress' | 'completed';

export interface ActiveModuleCardProps {
  title: string;
  topic: string;
  earnedPoints?: number;
  status?: ActiveModuleStatus;
  onClick?: () => void;
  className?: string;
}

const statusLabel: Record<ActiveModuleStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
};

const statusClasses: Record<ActiveModuleStatus, string> = {
  not_started: 'bg-slate-100 text-slate-700 border-slate-200',
  in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const ActiveModuleCard: React.FC<ActiveModuleCardProps> = ({
  title,
  topic,
  earnedPoints = 0,
  status = 'in_progress',
  onClick,
  className = '',
}) => {
  const isCompleted = status === 'completed';

  return (
    <div
      className={`group flex flex-col justify-between rounded-xl bg-background p-6 border border-highlight hover:shadow-xl transition-all duration-300 shadow-sm ${className}`}
      data-testid="active-module-card"
    >
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="shrink-0 p-3 bg-highlight/30 rounded-xl group-hover:bg-highlight/70 transition-colors duration-300">
            <OpenBooksIcon
              color="var(--color-surface)"
              width={26}
              height={26}
            />
          </span>
          <div>
            <div className="font-bold text-lg text-primary leading-relaxed">
              {title}
            </div>
            <div className="text-primary/70 text-sm italic">{topic}</div>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${statusClasses[status]}`}
        >
          <span className="inline-block h-2 w-2 rounded-full bg-current opacity-70" />
          {statusLabel[status]}
        </span>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-primary/70">
          <span className="font-semibold text-primary">{earnedPoints}</span> pts
          earned
        </div>

        <button
          type="button"
          onClick={onClick}
          disabled={isCompleted}
          className={`bg-surface hover:bg-surfaceHover disabled:bg-surface/60 disabled:cursor-not-allowed self-end text-white font-semibold px-6 py-3 rounded-lg shadow transform hover:scale-105 transition-all duration-300`}
        >
          {isCompleted ? 'Review' : 'Continue learning'}
        </button>
      </div>
    </div>
  );
};

export default ActiveModuleCard;
