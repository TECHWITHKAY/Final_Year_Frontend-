import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SeasonalChartProps {
  data: any[];
  height?: number;
}

const getSeasonalColor = (index: number) => {
  if (index < 0.9) return '#1B5E20';
  if (index <= 1.1) return '#F9A825';
  return '#C62828';
};

export const SeasonalChart: React.FC<SeasonalChartProps> = ({ data, height = 350 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#E0EBE0" />
      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#4A6741' }} />
      <YAxis tick={{ fontSize: 12, fill: '#4A6741' }} />
      <Tooltip
        contentStyle={{ borderRadius: 8, border: '1px solid #E0EBE0' }}
        formatter={(v: number) => [v.toFixed(2), 'Seasonal Index']}
      />
      <Bar dataKey="seasonalIndex" animationDuration={1000} radius={[4, 4, 0, 0]}>
        {data.map((entry, i) => (
          <Cell key={i} fill={getSeasonalColor(entry.seasonalIndex)} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);
