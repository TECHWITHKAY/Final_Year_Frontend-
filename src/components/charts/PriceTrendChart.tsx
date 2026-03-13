import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PriceTrendChartProps {
  data: any[];
  lines?: { key: string; name: string; color: string }[];
  height?: number;
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({ data, lines, height = 450 }) => {
  const defaultLines = [{ key: 'avgPrice', name: 'Avg Price', color: '#1B5E20' }];
  const chartLines = lines || defaultLines;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
        <defs>
          {chartLines.map(line => (
            <linearGradient key={line.key} id={`gradient-${line.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={line.color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={line.color} stopOpacity={0.05} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E0EBE0" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12, fill: '#4A6741' }} 
          label={{ value: 'Month', position: 'insideBottom', offset: -15, fill: '#4A6741', fontSize: 12, fontWeight: 500 }} 
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#4A6741' }} 
          label={{ value: 'Price (GHS)', angle: -90, position: 'insideLeft', offset: -5, fill: '#4A6741', fontSize: 12, fontWeight: 500 }} 
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid #E0EBE0', fontFamily: 'DM Sans' }}
          formatter={(v: number) => [`GHS ${v.toFixed(2)}`, '']}
        />
        {chartLines.length > 1 && <Legend />}
        {chartLines.map(line => (
          <Area
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            fill={`url(#gradient-${line.key})`}
            animationDuration={1200}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};
