import { useState, useCallback } from "react";

export interface DragState {
  draggedItem: string | null;
  dragOverItem: string | null;
  dragOverPosition: "top" | "bottom" | "middle" | null;
}

export interface DragHandlers {
  handleDragStart: (e: React.DragEvent, itemId: string) => void;
  handleDragEnd: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent, itemId: string) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, targetId: string) => void;
  resetDragState: () => void;
}

export interface UseDragAndDropListProps {
  onReorder: (draggedId: string, targetId: string, position: "before" | "after") => void;
  onMove?: (draggedId: string, targetId: string) => void;
}

export function useDragAndDropList({ onReorder, onMove }: UseDragAndDropListProps) {
  const [dragState, setDragState] = useState<DragState>({
    draggedItem: null,
    dragOverItem: null,
    dragOverPosition: null,
  });

  const resetDragState = useCallback(() => {
    setDragState({
      draggedItem: null,
      dragOverItem: null,
      dragOverPosition: null,
    });
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    setDragState(prev => ({ ...prev, draggedItem: itemId }));
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", itemId);

    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "0.5";
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "1";
    resetDragState();
  }, [resetDragState]);

  const handleDragOver = useCallback((e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? "top" : "bottom";

    setDragState(prev => ({
      ...prev,
      dragOverItem: itemId,
      dragOverPosition: position,
    }));
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      dragOverItem: null,
      dragOverPosition: null,
    }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    const draggedId = dragState.draggedItem;
    if (!draggedId || draggedId === targetId) {
      resetDragState();
      return;
    }

    const position = dragState.dragOverPosition;
    if (position === "top" || position === "bottom") {
      onReorder(draggedId, targetId, position === "top" ? "before" : "after");
    } else if (onMove) {
      onMove(draggedId, targetId);
    }

    resetDragState();
  }, [dragState, onReorder, onMove, resetDragState]);

  const getDragClassName = useCallback((itemId: string) => {
    const classes = [];
    
    if (dragState.draggedItem === itemId) {
      classes.push("dragging");
    }
    
    if (dragState.dragOverItem === itemId) {
      classes.push("drag-over");
      if (dragState.dragOverPosition) {
        classes.push(`drag-over-${dragState.dragOverPosition}`);
      }
    }
    
    return classes.join(" ");
  }, [dragState]);

  const handlers: DragHandlers = {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    resetDragState,
  };

  return {
    dragState,
    handlers,
    getDragClassName,
  };
}