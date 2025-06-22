'use client';

import React, { useState } from 'react';
import MiniMap from './MiniMap';
import MainCanvas from './MiniCanvas';
type ReserveData = {
  x: number;
  y: number;
  width: number;
  height: number;
  status: string;
};
export default function Home() {
  const [reserved, setReserved] = useState<ReserveData[]>([
    { x: 22, y: 4, width: 6, height: 4, status: 'sold' },
    { x: 50, y: 50, width: 10, height: 10, status: 'sold' },
  ]);

  const [viewX, setViewX] = useState(0);
  const [viewY, setViewY] = useState(0);
  const viewSize = 50; // 50x50 cells

  return (
    <main>
      <h2>MiniMap (select region)</h2>
      <MiniMap
        data={reserved}
        fullSize={1000}
        viewSize={viewSize}
        onViewChange={(x, y) => {
          setViewX(x);
          setViewY(y);
        }}
      />

      <h2>Main Viewport (shows selected region)</h2>
      <MainCanvas
        data={reserved}
        viewX={viewX}
        viewY={viewY}
        viewSize={viewSize}
        cellSize={12}
      />
    </main>
  );
}
