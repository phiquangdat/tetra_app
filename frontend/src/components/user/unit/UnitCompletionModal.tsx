import React from 'react';
import ReactDOM from 'react-dom';
import { X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUnitCompletionModal } from '../../../context/user/UnitCompletionModalContext';

const UnitCompletionModal: React.FC = () => {
  const { isVisible, nextUnitId, moduleId, close } = useUnitCompletionModal();
  const navigate = useNavigate();

  const handleNextUnit = () => {
    if (nextUnitId) {
      navigate(`/user/unit/${nextUnitId}`);
    }
    close();
  };

  const handleBackToModule = () => {
    navigate(`/user/modules/${moduleId}`);
    close();
  };

  if (!isVisible) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl">
        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 text-[#231942] hover:text-[#7E6BBE] transition"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <CheckCircle size={48} className="text-[#FFA726]" />
        </div>

        {/* Heading */}
        <h2 className="text-[#14248A] text-2xl font-semibold text-center mb-2">
          Unit Complete!
        </h2>

        <p className="text-[#231942] text-center text-sm mb-6">
          Great job finishing this unit. What would you like to do next?
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            disabled={!nextUnitId}
            onClick={handleNextUnit}
            className={`bg-[#14248A] ${!nextUnitId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#101e72]'} text-white px-5 py-2 rounded-lg text-sm font-medium transition`}
          >
            Continue to Next Unit
          </button>
          <button
            onClick={handleBackToModule}
            className="bg-[#7E6BBE] hover:bg-[#6c5aa9] text-white px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            Back to Module Overview
          </button>
        </div>
      </div>
    </div>,
    modalRoot,
  );
};

export default UnitCompletionModal;
