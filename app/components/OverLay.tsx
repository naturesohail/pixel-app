
// --- Overlay Component (New File: components/Overlay.tsx) ---
// You would typically put this in its own file, e.g., `components/Overlay.tsx`
import React, { useRef, useEffect, useState } from 'react';

type OverlayProps = {
  targetRef: React.RefObject<HTMLElement>;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  onNext: () => void;
  onSkip: () => void;
  isLastStep: boolean;
};

const Overlay: React.FC<OverlayProps> = ({
  targetRef,
  content,
  position,
  onNext,
  onSkip,
  isLastStep,
}) => {
  const [tooltipStyle, setTooltipStyle] = useState({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate tooltip position based on target element
  useEffect(() => {
    const calculatePosition = () => {
      if (!targetRef.current || !tooltipRef.current) return;

      const targetRect = targetRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let style: React.CSSProperties = {
        position: 'absolute',
        zIndex: 10000,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      };

      // Determine top/left based on position
      switch (position) {
        case 'bottom':
          style.top = `${targetRect.bottom + window.scrollY + 10}px`;
          style.left = `${targetRect.left + window.scrollX + (targetRect.width / 2) - (tooltipRect.width / 2)}px`;
          break;
        case 'top':
          style.top = `${targetRect.top + window.scrollY - tooltipRect.height - 10}px`;
          style.left = `${targetRect.left + window.scrollX + (targetRect.width / 2) - (tooltipRect.width / 2)}px`;
          break;
        case 'left':
          style.top = `${targetRect.top + window.scrollY + (targetRect.height / 2) - (tooltipRect.height / 2)}px`;
          style.left = `${targetRect.left + window.scrollX - tooltipRect.width - 10}px`;
          break;
        case 'right':
          style.top = `${targetRect.top + window.scrollY + (targetRect.height / 2) - (tooltipRect.height / 2)}px`;
          style.left = `${targetRect.right + window.scrollX + 10}px`;
          break;
        default:
          break;
      }

      // Adjust for viewport boundaries if necessary (basic check)
      if (typeof style.left === 'string') {
        let leftValue = parseFloat(style.left);
        if (leftValue < 0) style.left = '10px'; // Prevent going off left
        if (leftValue + tooltipRect.width > window.innerWidth) {
            style.left = `${window.innerWidth - tooltipRect.width - 10}px`; // Prevent going off right
        }
      }
      if (typeof style.top === 'string') {
        let topValue = parseFloat(style.top);
        if (topValue < 0) style.top = '10px'; // Prevent going off top
      }

      setTooltipStyle(style);
    };

    // Recalculate on mount, resize, and scroll
    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition);
    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [targetRef, position, content]); // Recalculate if target or content changes

  if (!targetRef.current) return null; // Don't render if target isn't mounted yet

  const targetRect = targetRef.current.getBoundingClientRect();

  return (
    <>
      {/* Dimmed Overlay Background */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
        onClick={onSkip} // Allow clicking outside to skip
      ></div>

      {/* Highlight Box around Target */}
      <div
        className="absolute z-[9999] border-2 border-blue-500 rounded-lg pointer-events-none"
        style={{
          top: targetRect.top + window.scrollY - 5,
          left: targetRect.left + window.scrollX - 5,
          width: targetRect.width + 10,
          height: targetRect.height + 10,
        }}
      ></div>

      {/* Tooltip */}
      <div ref={tooltipRef} style={tooltipStyle}>
        <p className="text-gray-800 text-sm">{content}</p>
        <div className="flex justify-between items-center mt-2">
          <button
            onClick={onSkip}
            className="text-gray-600 hover:text-gray-800 text-xs px-2 py-1 rounded"
          >
            Skip Tour
          </button>
          <button
            onClick={onNext}
            className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600 transition-colors"
          >
            {isLastStep ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
};