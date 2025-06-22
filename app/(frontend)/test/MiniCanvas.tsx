'use client';

import React, { useRef, useEffect } from 'react';
type ReserveData = {
  x: number;
  y: number;
  width: number;
  height: number;
  status: string;
};
interface Props {
  data: ReserveData[];
  cellSize: number;
  viewX: number;
  viewY: number;
  viewSize: number;
}

const MainCanvas: React.FC<Props> = ({
  data,
  cellSize,
  viewX,
  viewY,
  viewSize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = viewSize * cellSize;
    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);

    // Reserved blocks inside the view only
    for (const { x, y, width, height, status } of data) {
      if (
        x + width >= viewX &&
        y + height >= viewY &&
        x <= viewX + viewSize &&
        y <= viewY + viewSize
      ) {
        ctx.fillStyle = status === 'sold' ? '#f00' : '#0f0';
        ctx.fillRect(
          (x - viewX) * cellSize,
          (y - viewY) * cellSize,
          width * cellSize,
          height * cellSize
        );
      }
    }
  }, [data, cellSize, viewX, viewY, viewSize]);

  return (
    <canvas ref={canvasRef} style={{ border: '1px solid #ccc' }} />
  );
};

export default MainCanvas;
