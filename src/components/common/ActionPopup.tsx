import React, { useEffect, useRef, useState } from "react";
import "./ActionPopup.css";

interface ActionPopupProps {
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  isVisible: boolean;
  showDelete?: boolean;
  position: { x: number; y: number };
  sourceRect?: DOMRect; // ✅ NEW: The rect of the hovered element
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ActionPopup: React.FC<ActionPopupProps> = ({
  onEdit,
  onDelete,
  onToggleVisibility,
  isVisible,
  showDelete = true,
  position,
  sourceRect,
  onMouseEnter,
  onMouseLeave,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [computedPosition, setComputedPosition] = useState({ x: position.x, y: position.y });
  const [popupSide, setPopupSide] = useState<'left' | 'right'>('right');

  useEffect(() => {
    if (popupRef.current && sourceRect) {
      const popupRect = popupRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const MARGIN = 8; // Gap between element and popup
      const EDGE_MARGIN = 16; // Margin from viewport edge
      
      let finalX = position.x;
      let finalY = position.y;
      let side: 'left' | 'right' = 'right';
      
      // Calculate available space on right and left
      const spaceOnRight = viewportWidth - sourceRect.right;
      const spaceOnLeft = sourceRect.left;
      
      // Prefer right side, but use left if not enough space on right
      if (spaceOnRight >= popupRect.width + MARGIN + EDGE_MARGIN) {
        // Position to the right
        side = 'right';
        finalX = sourceRect.right + MARGIN;
      } else if (spaceOnLeft >= popupRect.width + MARGIN + EDGE_MARGIN) {
        // Position to the left
        side = 'left';
        finalX = sourceRect.left - popupRect.width - MARGIN;
      } else {
        // Not enough space on either side, use the side with more space
        if (spaceOnRight > spaceOnLeft) {
          side = 'right';
          finalX = sourceRect.right + MARGIN;
        } else {
          side = 'left';
          finalX = sourceRect.left - popupRect.width - MARGIN;
        }
      }
      
      // Vertical positioning - align with the element center
      finalY = sourceRect.top + (sourceRect.height / 2) - (popupRect.height / 2);
      
      // Ensure popup doesn't go off-screen vertically
      if (finalY < EDGE_MARGIN) {
        finalY = EDGE_MARGIN;
      } else if (finalY + popupRect.height > viewportHeight - EDGE_MARGIN) {
        finalY = viewportHeight - popupRect.height - EDGE_MARGIN;
      }
      
      setComputedPosition({ x: finalX, y: finalY });
      setPopupSide(side);
    }
  }, [position, sourceRect]);

  return (
    <div
      ref={popupRef}
      className={`action-popup action-popup-${popupSide}`}
      style={{ left: computedPosition.x, top: computedPosition.y }}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        className="action-popup-btn"
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        title={isVisible ? "Hide" : "Show"}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {isVisible ? (
            <>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </>
          ) : (
            <>
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </>
          )}
        </svg>
      </button>

      <button
        className="action-popup-btn"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title="Edit"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>

      {showDelete && (
        <button
          className="action-popup-btn delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ActionPopup;
