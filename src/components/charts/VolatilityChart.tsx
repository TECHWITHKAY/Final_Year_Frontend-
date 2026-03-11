import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface VolatilityChartProps {
  data: any[];
  height?: number;
}

const getVolatilityColor = (level: string) => {
  switch (level?.toUpperCase()) {
    case 'LOW': return '#1B5E20';
    case 'MEDIUM': return '#F9A825';
    case 'HIGH': return '#C62828';
    default: return '#8A9E88';
  }
};

export const VolatilityChart: React.FC<VolatilityChartProps> = ({ data, height = 350 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 80, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#E0EBE0" />
      <XAxis type="number" tick={{ fontSize: 12, fill: '#4A6741' }} />
      <YAxis dataKey="commodity" type="category" tick={{ fontSize: 12, fill: '#4A6741' }} />
      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E0EBE0' }} />
      <Bar dataKey="stdDev" animationDuration={1000} radius={[0, 4, 4, 0]}>
        {data.map((entry, i) => (
          <Cell key={i} fill={getVolatilityColor(entry.level)} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);
