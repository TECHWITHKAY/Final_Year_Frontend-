import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CityComparisonChartProps {
  data: any[];
  height?: number;
}

export const CityComparisonChart: React.FC<CityComparisonChartProps> = ({ data, height = 350 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 60, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#E0EBE0" />
      <XAxis type="number" tick={{ fontSize: 12, fill: '#4A6741' }} />
      <YAxis dataKey="city" type="category" tick={{ fontSize: 12, fill: '#4A6741' }} />
      <Tooltip
        contentStyle={{ borderRadius: 8, border: '1px solid #E0EBE0', fontFamily: 'DM Sans' }}
        formatter={(v: number) => [`GHS ${v.toFixed(2)}`, 'Avg Price']}
      />
      <Bar dataKey="avgPrice" fill="#1B5E20" radius={[0, 4, 4, 0]} animationDuration={1000} />
    </BarChart>
  </ResponsiveContainer>
);
