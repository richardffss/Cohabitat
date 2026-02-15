import React, { useState, useEffect, useRef } from 'react';
import { Position } from '../types';

interface DraggableProps {
  id: string;
  initialPos: Position;
  zIndex: number;
  onUpdate: (id: string, pos: Position) => void;
  onFocus: (id: string) => void;
  children: React.ReactNode;
  className?: string;
  dragHandleClassName?: string;
}

export const Draggable: React.FC<DraggableProps> = ({ 
  id, 
  initialPos, 
  zIndex, 
  onUpdate, 
  onFocus, 
  children, 
  className = '',
  dragHandleClassName = '' 
}) => {
  const [pos, setPos] = useState(initialPos);
  const [isDragging, setIsDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  // Sync with prop updates if they happen externally
  useEffect(() => {
    setPos(initialPos);
  }, [initialPos.x, initialPos.y]);

  const onMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from specific handles if specified, otherwise the whole container
    if (dragHandleClassName && !(e.target as HTMLElement).closest(dragHandleClassName)) return;
    
    // Prevent default to stop text selection
    // e.preventDefault(); 
    // We don't prevent default globally so inputs still work, 
    // but the handle should usually be a non-input element.

    if (e.button !== 0) return; // Only left click

    onFocus(id);
    setIsDragging(true);
    
    const node = nodeRef.current;
    if (node) {
        // Calculate offset from top-left of the element
        const rect = node.getBoundingClientRect();
        // We need to account for the parent container's offset if we were doing strict relative math,
        // but since we are updating state based on mouse movement delta, simple offset works.
        setRel({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    // We need the parent container to calculate relative position correctly
    // For this app, we assume the parent is the corkboard container
    const parent = nodeRef.current?.offsetParent as HTMLElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    
    const newX = e.clientX - parentRect.left - rel.x;
    const newY = e.clientY - parentRect.top - rel.y;

    setPos({ x: newX, y: newY });
  };

  const onMouseUp = () => {
    if (isDragging) {
        setIsDragging(false);
        onUpdate(id, pos);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, rel]);

  return (
    <div
      ref={nodeRef}
      onMouseDown={onMouseDown}
      className={`absolute transition-shadow ${isDragging ? 'z-50 cursor-grabbing shadow-2xl scale-[1.01]' : 'cursor-grab'} ${className} md:block hidden`}
      style={{
        left: pos.x,
        top: pos.y,
        zIndex: isDragging ? 9999 : zIndex,
        touchAction: 'none'
      }}
    >
      {children}
    </div>
  );
};

// Mobile version just renders children in flow
export const MobileStackItem: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
    return (
        <div className={`mb-6 ${className} md:hidden block relative`}>
            {children}
        </div>
    )
}
