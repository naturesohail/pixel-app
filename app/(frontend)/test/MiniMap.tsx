"use client";
import React, { useRef, useEffect, useState } from "react";

type ReserveData = {
  x: number;
  y: number;
  width: number;
  height: number;
  status: string;
};

interface Props {
  data: ReserveData[];
  fullSize: number;
  onViewChange: (x: number, y: number) => void;
  viewSize: number;
}

const MiniMap: React.FC<Props> = ({
  data,
  fullSize,
  onViewChange,
  viewSize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = 200 / fullSize;
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [viewX, setViewX] = useState(0);
  const [viewY, setViewY] = useState(0);

  // ========== DRAW CANVAS ==========
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 200;
    canvas.height = 200;

    // Background
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, 200, 200);

    // Reserved Areas
    for (const { x, y, width, height, status } of data) {
      ctx.fillStyle = status === "sold" ? "#f00" : "#0f0";
      ctx.fillRect(x * scale, y * scale, width * scale, height * scale);
    }

    // Viewport Box
    ctx.strokeStyle = "#0000ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(viewX * scale, viewY * scale, viewSize * scale, viewSize * scale);
  }, [data, viewX, viewY, viewSize, scale]);

  // ========== COMMON LOGIC ==========
  const updateView = (x: number, y: number) => {
    const clampedX = Math.max(0, Math.min(fullSize - viewSize, x));
    const clampedY = Math.max(0, Math.min(fullSize - viewSize, y));
    setViewX(clampedX);
    setViewY(clampedY);
    onViewChange(clampedX, clampedY);
  };

  // ========== DESKTOP EVENTS ==========
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    setDragStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale - viewSize / 2;
    const y = (e.clientY - rect.top) / scale - viewSize / 2;
    updateView(Math.floor(x), Math.floor(y));
  };

  const handleMouseUp = () => setDragStart(null);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale - viewSize / 2;
    const y = (e.clientY - rect.top) / scale - viewSize / 2;
    updateView(Math.floor(x), Math.floor(y));
  };

  // ========== MOBILE EVENTS ==========
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / scale;
    const y = (touch.clientY - rect.top) / scale;
    setDragStart({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scroll
    if (!dragStart) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / scale - viewSize / 2;
    const y = (touch.clientY - rect.top) / scale - viewSize / 2;
    updateView(Math.floor(x), Math.floor(y));
  };

  const handleTouchEnd = () => setDragStart(null);

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: "1px solid #000",
        cursor: "grab",
        touchAction: "none",
        maxWidth: "80%",
        height: "auto",
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
};

export default MiniMap;
