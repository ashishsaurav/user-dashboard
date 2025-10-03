import { useState, useCallback } from "react";

interface DragItem {
  type: string;
  id: string;
}

interface DragOverItem {
  id: string;
  position: "top" | "bottom" | "middle" | "left" | "right";
}

export const useDragAndDrop = () => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverItem, setDragOverItem] = useState<DragOverItem | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, type: string, id: string) => {
      e.stopPropagation();
      setDraggedItem({ type, id });
      e.dataTransfer.setData("text/plain", JSON.stringify({ type, id }));
      e.dataTransfer.effectAllowed = "move";
      (e.currentTarget as HTMLElement).style.opacity = "0.5";
    },
    []
  );

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = "1";
    setDraggedItem(null);
    setDragOverItem(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const calculateDragPosition = useCallback(
    (e: React.DragEvent, isHorizontal: boolean): "top" | "bottom" | "middle" => {
      const rect = e.currentTarget.getBoundingClientRect();

      if (isHorizontal) {
        const x = e.clientX - rect.left;
        const width = rect.width;
        if (x < width * 0.33) {
          return "top";
        } else if (x > width * 0.66) {
          return "bottom";
        }
      } else {
        const y = e.clientY - rect.top;
        const height = rect.height;
        if (y < height * 0.33) {
          return "top";
        } else if (y > height * 0.66) {
          return "bottom";
        }
      }
      return "middle";
    },
    []
  );

  const handleDragEnter = useCallback(
    (
      e: React.DragEvent,
      targetId: string,
      isHorizontal: boolean = false
    ) => {
      e.preventDefault();
      if (!draggedItem) return;

      const position = calculateDragPosition(e, isHorizontal);
      setDragOverItem({ id: targetId, position });
    },
    [draggedItem, calculateDragPosition]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverItem(null);
    }
  }, []);

  const reset = useCallback(() => {
    setDraggedItem(null);
    setDragOverItem(null);
  }, []);

  return {
    draggedItem,
    dragOverItem,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    reset,
  };
};
