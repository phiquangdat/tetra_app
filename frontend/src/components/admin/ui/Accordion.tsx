import React, { type ReactNode } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '../../common/Icons';

interface AccordionProps {
  header: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({
  header,
  isOpen,
  onToggle,
  children,
}) => (
  <div className="bg-[#F9F5FF] border border-highlight rounded-xl overflow-hidden shadow-sm">
    <button
      onClick={onToggle}
      className="w-full text-left px-6 py-4 text-base font-semibold text-primary flex justify-between items-center hover:bg-[#EFE8FF] transition"
    >
      <span>{header}</span>
      {isOpen ? (
        <ChevronUpIcon width={20} height={20} />
      ) : (
        <ChevronDownIcon width={20} height={20} />
      )}
    </button>
    {isOpen && (
      <div className="px-6 pb-4 text-primary text-base">{children}</div>
    )}
  </div>
);

export default Accordion;
