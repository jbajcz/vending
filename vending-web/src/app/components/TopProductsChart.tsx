"use client";
import React from 'react';

type TopProduct = { name: string; count: number };

export default function TopProductsChart({ data }: { data: TopProduct[] }) {
  const width = 480;
  const height = 220;
  const padding = 40;
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const barWidth = (width - padding * 2) / data.length - 12;

  return (
    <div className="card" style={{ padding: '16px' }}>
      <div className="card-title">Top Products</div>
      <svg width={width} height={height} style={{ display: 'block', margin: '0 auto' }}>
        {/* Y axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = padding + (1 - t) * (height - padding * 2);
          const label = Math.round(t * maxCount);
          return (
            <g key={i}>
              <text x={6} y={y + 4} fontSize={10} fill="#666">{label}</text>
              <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="#eee" />
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = padding + i * (barWidth + 12) + 6;
          const barHeight = (d.count / maxCount) * (height - padding * 2);
          const y = padding + (height - padding * 2 - barHeight);
          return (
            <g key={d.name}>
              <rect x={x} y={y} width={barWidth} height={barHeight} fill="#3b82f6" rx={4} />
              <text x={x + barWidth / 2} y={y - 6} fontSize={11} fill="#111" textAnchor="middle">{d.count}</text>
              <text x={x + barWidth / 2} y={height - 8} fontSize={11} fill="#333" textAnchor="middle">{d.name}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
